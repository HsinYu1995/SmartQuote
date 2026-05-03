import { test, expect } from '@playwright/test'

// Requires the Express server to be running: npm run dev:server
// Rate limit resets after 15 minutes — restart the server to reset counters between runs.

test.describe('Rate Limiter', () => {
  test('allows up to 10 login attempts then returns 429', async ({ request }) => {
    for (let i = 0; i < 10; i++) {
      const res = await request.post('/api/auth/login', {
        data: { email: 'brute@example.com', password: 'wrongpassword' },
      })
      expect(res.status(), `attempt ${i + 1} should not be rate limited`).toBe(401)
    }

    const blocked = await request.post('/api/auth/login', {
      data: { email: 'brute@example.com', password: 'wrongpassword' },
    })
    expect(blocked.status()).toBe(429)

    const body = await blocked.json()
    expect(body.message).toContain('Too many attempts')
  })

  test('allows up to 10 register attempts then returns 429', async ({ request }) => {
    for (let i = 0; i < 10; i++) {
      const res = await request.post('/api/auth/register', {
        data: {
          name: `Test User ${i}`,
          email: `ratelimit-test-${i}@example.com`,
          password: 'password123',
          licenseNumber: 'LIC-TEST-001',
          agency: 'Test Agency',
        },
      })
      // Could be 201 (created) or 409 (duplicate) — either is fine, just not 429
      expect(res.status(), `attempt ${i + 1} should not be rate limited`).not.toBe(429)
    }

    const blocked = await request.post('/api/auth/register', {
      data: {
        name: 'Blocked User',
        email: 'blocked@example.com',
        password: 'password123',
        licenseNumber: 'LIC-TEST-001',
        agency: 'Test Agency',
      },
    })
    expect(blocked.status()).toBe(429)

    const body = await blocked.json()
    expect(body.message).toContain('Too many attempts')
  })

  test('login and register limits are independent', async ({ request }) => {
    // After the login test has exhausted its limit, register should still respond normally
    const res = await request.post('/api/auth/register', {
      data: {
        name: 'Independent Test',
        email: 'independent@example.com',
        password: 'password123',
        licenseNumber: 'LIC-TEST-002',
        agency: 'Test Agency',
      },
    })
    // 429 would mean the limits bleed into each other — that's a bug
    expect(res.status()).not.toBe(429)
  })

  test('rate limit headers are present on auth responses', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'headers@example.com', password: 'wrong' },
    })
    expect(res.headers()['ratelimit-limit']).toBeDefined()
    expect(res.headers()['ratelimit-remaining']).toBeDefined()
  })

  test('health endpoint is not rate limited', async ({ request }) => {
    for (let i = 0; i < 15; i++) {
      const res = await request.get('/api/health')
      expect(res.status()).toBe(200)
    }
  })
})
