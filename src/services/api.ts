import type {
  Quote,
  InsuranceType,
  Client,
  ClientSummary,
  Broker,
  CarInsuranceCondition,
  HouseInsuranceCondition,
  HealthInsuranceCondition,
  PaginatedResponse,
  QuoteFilters,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

function toQueryString(filters: QuoteFilters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })

  return params.toString()
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message ?? `Request failed with ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const authApi = {
  async me(): Promise<Broker> {
    return request<Broker>('/auth/me')
  },

  async login(email: string, password: string): Promise<Broker> {
    return request<Broker>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async register(data: {
    name: string
    email: string
    password: string
    licenseNumber: string
    agency: string
  }): Promise<Broker> {
    return request<Broker>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' })
  },
}

export const quoteApi = {
  async getQuotes(filters: QuoteFilters = {}): Promise<PaginatedResponse<Quote>> {
    const qs = toQueryString(filters)
    return request<PaginatedResponse<Quote>>(`/quotes${qs ? `?${qs}` : ''}`)
  },

  async getQuote(id: string): Promise<Quote> {
    return request<Quote>(`/quotes/${id}`)
  },

  async createQuote(
    type: InsuranceType,
    client: Client,
    condition: CarInsuranceCondition | HouseInsuranceCondition | HealthInsuranceCondition,
    brokerId: string,
  ): Promise<Quote> {
    return request<Quote>('/quotes', {
      method: 'POST',
      body: JSON.stringify({ type, client, condition, brokerId }),
    })
  },

  async getStats(): Promise<{
    totalToday: number
    approvedToday: number
    rejectedToday: number
    pendingTotal: number
  }> {
    return request('/stats')
  },

  async getClients(search = ''): Promise<{ data: ClientSummary[] }> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return request<{ data: ClientSummary[] }>(`/clients${qs}`)
  },
}
