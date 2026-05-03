import 'dotenv/config'
import express from 'express'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { calculateQuote, isHighRisk } from './quoteEngine.js'
import { demoQuotes } from './seedData.js'

const { Pool } = pg

const PORT = Number(process.env.SERVER_PORT ?? 3001)
const DEFAULT_DATABASE_URL = 'postgresql://smartquote:smartquote_dev_password@localhost:5432/smartquote'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
})

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000 // 8 hours

const app = express()
app.use(express.json())
app.use(cookieParser())

function requireAuth(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ message: 'Authentication required' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.brokerId = payload.sub
    next()
  } catch {
    res.clearCookie('token')
    return res.status(401).json({ message: 'Session expired, please sign in again' })
  }
}

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
}

// Separate instances so login and register have independent counters
app.use('/api/auth/login', rateLimit(rateLimitConfig))
app.use('/api/auth/register', rateLimit(rateLimitConfig))

// All /api routes are protected except /api/auth/*
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/')) return next()
  requireAuth(req, res, next)
})

function mapClient(row) {
  return {
    id: row.client_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
  }
}

function numberOrUndefined(value) {
  return value === null || value === undefined ? undefined : Number(value)
}

function mapResult(row) {
  if (!row.result_id) return undefined

  return {
    monthlyPremium: Number(row.monthly_premium),
    annualPremium: Number(row.annual_premium),
    deductible: Number(row.deductible),
    coverageLimit: Number(row.coverage_limit),
    effectiveDate: row.effective_date,
    expiryDate: row.expiry_date,
    breakdown: row.breakdown,
    notes: row.notes ?? undefined,
  }
}

function mapQuote(row) {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    type: row.type,
    status: row.status,
    client: mapClient(row),
    condition: row.condition,
    result: mapResult(row),
    brokerId: row.broker_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function validateQuoteInput(body) {
  const errors = []
  if (!['car', 'house', 'health'].includes(body.type)) errors.push('type must be car, house, or health')
  if (!body.client || typeof body.client !== 'object') errors.push('client is required')
  if (!body.condition || typeof body.condition !== 'object') errors.push('condition is required')
  return errors
}

async function getDefaultBrokerId(client) {
  const result = await client.query(
    `select id from brokers where email = $1
     union all
     select id from brokers
     limit 1`,
    ['alex.johnson@smartquote.com'],
  )

  if (!result.rows[0]) throw new Error('No broker exists in the database')
  return result.rows[0].id
}

async function insertClient(db, client) {
  const result = await db.query(
    `insert into clients (
      first_name, last_name, date_of_birth, email, phone, address, city, state, zip_code
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning id`,
    [
      client.firstName,
      client.lastName,
      client.dateOfBirth,
      client.email,
      client.phone,
      client.address,
      client.city,
      client.state,
      client.zipCode,
    ],
  )

  return result.rows[0].id
}

async function insertQuoteWithResult(db, { type, status, client, condition, brokerId, referenceNumber, createdAt, updatedAt }) {
  const clientId = await insertClient(db, client)
  const quoteResult = status === 'approved' ? calculateQuote(type, condition) : undefined

  const quote = await db.query(
    `insert into quotes (
      reference_number, broker_id, client_id, type, status, condition, created_at, updated_at
    )
    values ($1, $2, $3, $4, $5, $6, coalesce($7::timestamptz, now()), coalesce($8::timestamptz, now()))
    returning id`,
    [
      referenceNumber ?? (await nextReferenceNumber(db)),
      brokerId,
      clientId,
      type,
      status,
      JSON.stringify(condition),
      createdAt ?? null,
      updatedAt ?? null,
    ],
  )

  if (quoteResult) {
    await db.query(
      `insert into quote_results (
        quote_id, monthly_premium, annual_premium, deductible, coverage_limit,
        effective_date, expiry_date, breakdown, notes
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        quote.rows[0].id,
        quoteResult.monthlyPremium,
        quoteResult.annualPremium,
        quoteResult.deductible,
        quoteResult.coverageLimit,
        quoteResult.effectiveDate,
        quoteResult.expiryDate,
        JSON.stringify(quoteResult.breakdown),
        quoteResult.notes ?? null,
      ],
    )
  }

  return quote.rows[0].id
}

async function nextReferenceNumber(db) {
  const year = new Date().getFullYear()
  const prefix = `SQ-${year}-`
  const result = await db.query(
    `select reference_number
     from quotes
     where reference_number like $1
     order by reference_number desc
     limit 1`,
    [`${prefix}%`],
  )
  const last = result.rows[0]?.reference_number
  const next = last ? Number(last.slice(prefix.length)) + 1 : 1001
  return `${prefix}${String(next).padStart(6, '0')}`
}

async function findQuoteById(id) {
  const result = await pool.query(
    `select
      q.id, q.reference_number, q.broker_id, q.type, q.status, q.condition,
      q.created_at::text, q.updated_at::text,
      c.id as client_id, c.first_name, c.last_name, c.date_of_birth::text, c.email,
      c.phone, c.address, c.city, c.state, c.zip_code,
      qr.id as result_id, qr.monthly_premium, qr.annual_premium, qr.deductible,
      qr.coverage_limit, qr.effective_date::text, qr.expiry_date::text, qr.breakdown, qr.notes
     from quotes q
     join clients c on c.id = q.client_id
     left join quote_results qr on qr.quote_id = q.id
     where q.id = $1`,
    [id],
  )

  return result.rows[0] ? mapQuote(result.rows[0]) : null
}

async function seedDemoQuotes() {
  const db = await pool.connect()
  try {
    await db.query('begin')
    const count = await db.query('select count(*)::int as count from quotes')
    if (count.rows[0].count > 0) {
      await db.query('commit')
      return
    }

    const brokerId = await getDefaultBrokerId(db)
    for (const quote of demoQuotes) {
      await insertQuoteWithResult(db, { ...quote, brokerId })
    }
    await db.query('commit')
    console.log(`Seeded ${demoQuotes.length} demo quotes`)
  } catch (error) {
    await db.query('rollback')
    throw error
  } finally {
    db.release()
  }
}

function mapBroker(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    licenseNumber: row.license_number,
    agency: row.agency,
  }
}

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, licenseNumber, agency } = req.body
    const errors = []
    if (!name?.trim()) errors.push('Name is required')
    if (!email?.trim()) errors.push('Email is required')
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters')
    if (!licenseNumber?.trim()) errors.push('License number is required')
    if (!agency?.trim()) errors.push('Agency is required')
    if (errors.length) return res.status(400).json({ message: errors[0] })

    const existing = await pool.query('select id from brokers where email = $1', [email.toLowerCase()])
    if (existing.rows[0]) return res.status(409).json({ message: 'Email already registered' })

    const result = await pool.query(
      `insert into brokers (name, email, password_hash, license_number, agency)
       values ($1, $2, crypt($3, gen_salt('bf')), $4, $5)
       returning id, name, email, license_number, agency`,
      [name.trim(), email.toLowerCase().trim(), password, licenseNumber.trim(), agency.trim()],
    )

    const broker = mapBroker(result.rows[0])
    const token = jwt.sign({ sub: broker.id }, JWT_SECRET, { expiresIn: '8h' })
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
    })
    res.status(201).json(broker)
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const result = await pool.query(
      `select id, name, email, license_number, agency
       from brokers
       where email = $1 and password_hash = crypt($2, password_hash)`,
      [email.toLowerCase().trim(), password],
    )

    if (!result.rows[0]) return res.status(401).json({ message: 'Invalid email or password' })

    const broker = mapBroker(result.rows[0])
    const token = jwt.sign({ sub: broker.id }, JWT_SECRET, { expiresIn: '8h' })
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
    })
    res.json(broker)
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('select 1')
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.get('/api/stats', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `select
        count(*) filter (where created_at::date = current_date)::int as total_today,
        count(*) filter (where created_at::date = current_date and status = 'approved')::int as approved_today,
        count(*) filter (where created_at::date = current_date and status = 'rejected')::int as rejected_today,
        count(*) filter (where status = 'pending')::int as pending_total
       from quotes`,
    )

    res.json({
      totalToday: result.rows[0].total_today,
      approvedToday: result.rows[0].approved_today,
      rejectedToday: result.rows[0].rejected_today,
      pendingTotal: result.rows[0].pending_total,
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/clients', async (req, res, next) => {
  try {
    const search = String(req.query.search ?? '').trim()
    const params = []
    const where = []

    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      where.push(
        `(lower(c.first_name || ' ' || c.last_name) like $${params.length} or lower(c.email) like $${params.length})`,
      )
    }

    const result = await pool.query(
      `select
        c.id as client_id, c.first_name, c.last_name, c.date_of_birth::text,
        c.email, c.phone, c.address, c.city, c.state, c.zip_code,
        count(q.id)::int as quote_count,
        max(q.created_at)::text as latest_quote_at
       from clients c
       left join quotes q on q.client_id = c.id
       ${where.length ? `where ${where.join(' and ')}` : ''}
       group by c.id
       order by latest_quote_at desc nulls last, c.last_name, c.first_name`,
      params,
    )

    res.json({
      data: result.rows.map((row) => ({
        ...mapClient(row),
        quoteCount: row.quote_count,
        latestQuoteAt: row.latest_quote_at,
      })),
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/clients/:id/quotes', async (req, res, next) => {
  try {
    req.query.clientId = req.params.id
    return listQuotes(req, res, next)
  } catch (error) {
    next(error)
  }
})

app.get('/api/quotes', listQuotes)

async function listQuotes(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1))
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 10)))
    const params = []
    const where = []

    if (req.query.type) {
      params.push(req.query.type)
      where.push(`q.type = $${params.length}`)
    }
    if (req.query.status) {
      params.push(req.query.status)
      where.push(`q.status = $${params.length}`)
    }
    if (req.query.clientId) {
      params.push(req.query.clientId)
      where.push(`q.client_id = $${params.length}`)
    }
    if (req.query.dateFrom) {
      params.push(req.query.dateFrom)
      where.push(`q.created_at >= $${params.length}`)
    }
    if (req.query.dateTo) {
      params.push(req.query.dateTo)
      where.push(`q.created_at <= $${params.length}`)
    }
    if (req.query.search) {
      params.push(`%${String(req.query.search).toLowerCase()}%`)
      where.push(
        `(lower(q.reference_number) like $${params.length}
          or lower(c.first_name || ' ' || c.last_name) like $${params.length}
          or lower(c.email) like $${params.length})`,
      )
    }

    const whereSql = where.length ? `where ${where.join(' and ')}` : ''
    const total = await pool.query(
      `select count(*)::int as total
       from quotes q
       join clients c on c.id = q.client_id
       ${whereSql}`,
      params,
    )

    params.push(pageSize, (page - 1) * pageSize)
    const result = await pool.query(
      `select
        q.id, q.reference_number, q.broker_id, q.type, q.status, q.condition,
        q.created_at::text, q.updated_at::text,
        c.id as client_id, c.first_name, c.last_name, c.date_of_birth::text, c.email,
        c.phone, c.address, c.city, c.state, c.zip_code,
        qr.id as result_id, qr.monthly_premium, qr.annual_premium, qr.deductible,
        qr.coverage_limit, qr.effective_date::text, qr.expiry_date::text, qr.breakdown, qr.notes
       from quotes q
       join clients c on c.id = q.client_id
       left join quote_results qr on qr.quote_id = q.id
       ${whereSql}
       order by q.created_at desc
       limit $${params.length - 1} offset $${params.length}`,
      params,
    )

    const totalRows = total.rows[0].total
    res.json({
      data: result.rows.map(mapQuote),
      total: totalRows,
      page,
      pageSize,
      totalPages: Math.ceil(totalRows / pageSize),
    })
  } catch (error) {
    next(error)
  }
}

app.get('/api/quotes/:id', async (req, res, next) => {
  try {
    const quote = await findQuoteById(req.params.id)
    if (!quote) return res.status(404).json({ message: 'Quote not found', code: 'QUOTE_NOT_FOUND' })
    res.json(quote)
  } catch (error) {
    next(error)
  }
})

app.post('/api/quotes', async (req, res, next) => {
  const errors = validateQuoteInput(req.body)
  if (errors.length) return res.status(400).json({ message: 'Invalid quote request', code: 'VALIDATION_ERROR', details: errors })

  const db = await pool.connect()
  try {
    const { type, client, condition } = req.body
    const status = isHighRisk(type, condition) ? 'rejected' : 'approved'

    await db.query('begin')
    const brokerId = await getDefaultBrokerId(db)
    const id = await insertQuoteWithResult(db, { type, status, client, condition, brokerId })
    await db.query('commit')

    const quote = await findQuoteById(id)
    res.status(201).json(quote)
  } catch (error) {
    await db.query('rollback')
    next(error)
  } finally {
    db.release()
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({
    message: 'Unexpected server error',
    code: 'SERVER_ERROR',
  })
})

seedDemoQuotes()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SmartQuote API listening on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start SmartQuote API')
    console.error(error)
    process.exit(1)
  })
