import type {
  Quote,
  InsuranceType,
  Client,
  CarInsuranceCondition,
  HouseInsuranceCondition,
  HealthInsuranceCondition,
  PaginatedResponse,
  QuoteFilters,
} from '../types'
import { mockQuotes, generateRef } from './mockData'
import { calculateCarQuote, calculateHouseQuote, calculateHealthQuote } from './quoteEngine'

const SIMULATED_DELAY = 600

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

let quotesStore: Quote[] = [...mockQuotes]

export const quoteApi = {
  async getQuotes(filters: QuoteFilters = {}): Promise<PaginatedResponse<Quote>> {
    await delay(SIMULATED_DELAY)

    let results = [...quotesStore]

    if (filters.type) results = results.filter((q) => q.type === filters.type)
    if (filters.status) results = results.filter((q) => q.status === filters.status)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      results = results.filter(
        (q) =>
          q.referenceNumber.toLowerCase().includes(s) ||
          `${q.client.firstName} ${q.client.lastName}`.toLowerCase().includes(s) ||
          q.client.email.toLowerCase().includes(s),
      )
    }
    if (filters.dateFrom) results = results.filter((q) => q.createdAt >= filters.dateFrom!)
    if (filters.dateTo) results = results.filter((q) => q.createdAt <= filters.dateTo!)

    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const page = filters.page ?? 1
    const pageSize = filters.pageSize ?? 10
    const total = results.length
    const totalPages = Math.ceil(total / pageSize)
    const data = results.slice((page - 1) * pageSize, page * pageSize)

    return { data, total, page, pageSize, totalPages }
  },

  async getQuote(id: string): Promise<Quote> {
    await delay(300)
    const quote = quotesStore.find((q) => q.id === id)
    if (!quote) throw new Error(`Quote ${id} not found`)
    return quote
  },

  async createQuote(
    type: InsuranceType,
    client: Client,
    condition: CarInsuranceCondition | HouseInsuranceCondition | HealthInsuranceCondition,
    brokerId: string,
  ): Promise<Quote> {
    await delay(SIMULATED_DELAY * 2)

    let result
    if (type === 'car') result = calculateCarQuote(condition as CarInsuranceCondition)
    else if (type === 'house') result = calculateHouseQuote(condition as HouseInsuranceCondition)
    else result = calculateHealthQuote(condition as HealthInsuranceCondition)

    // Simulate occasional rejection based on risk profile
    const isHighRisk =
      (type === 'car' && (condition as CarInsuranceCondition).priorAccidents >= 3) ||
      (type === 'health' && (condition as HealthInsuranceCondition).smokingStatus === 'current' &&
        (condition as HealthInsuranceCondition).preExistingConditions.length > 2)

    const quote: Quote = {
      id: `q-${Date.now()}`,
      referenceNumber: generateRef(),
      type,
      status: isHighRisk ? 'rejected' : 'approved',
      client,
      condition,
      result: isHighRisk ? undefined : result,
      brokerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    quotesStore = [quote, ...quotesStore]
    return quote
  },

  async getStats(): Promise<{
    totalToday: number
    approvedToday: number
    rejectedToday: number
    pendingTotal: number
  }> {
    await delay(300)
    const today = new Date().toISOString().split('T')[0]
    const todayQuotes = quotesStore.filter((q) => q.createdAt.startsWith(today))

    return {
      totalToday: todayQuotes.length,
      approvedToday: todayQuotes.filter((q) => q.status === 'approved').length,
      rejectedToday: todayQuotes.filter((q) => q.status === 'rejected').length,
      pendingTotal: quotesStore.filter((q) => q.status === 'pending').length,
    }
  },
}
