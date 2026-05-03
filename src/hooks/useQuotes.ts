import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteApi } from '../services/api'
import type { InsuranceType, Client, CarInsuranceCondition, HouseInsuranceCondition, HealthInsuranceCondition, QuoteFilters } from '../types'

export function useQuotes(filters: QuoteFilters = {}) {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => quoteApi.getQuotes(filters),
    staleTime: 30_000,
  })
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => quoteApi.getQuote(id),
    enabled: !!id,
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      client,
      condition,
      brokerId,
    }: {
      type: InsuranceType
      client: Client
      condition: CarInsuranceCondition | HouseInsuranceCondition | HealthInsuranceCondition
      brokerId: string
    }) => quoteApi.createQuote(type, client, condition, brokerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => quoteApi.getStats(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useClients(search = '') {
  return useQuery({
    queryKey: ['clients', search],
    queryFn: () => quoteApi.getClients(search),
    staleTime: 30_000,
  })
}
