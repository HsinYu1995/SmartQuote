import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { Card } from '../components/ui/Card'
import { StatusBadge, TypeBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import type { InsuranceType, QuoteStatus, QuoteFilters } from '../types'
import { format } from 'date-fns'

export function QuoteHistoryPage() {
  const [searchParams] = useSearchParams()
  const clientId = searchParams.get('clientId') ?? undefined
  const [filters, setFilters] = useState<QuoteFilters>({ clientId, page: 1, pageSize: 10 })
  const { data, isLoading } = useQuotes(filters)

  const setFilter = (key: keyof QuoteFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))
  }

  return (
    <div className="space-y-6" data-testid="quote-history">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quote History</h1>
        <Link to="/quotes/new">
          <Button data-testid="new-quote-link">+ New Quote</Button>
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3" data-testid="filters">
          <Input
            placeholder="Search by name, ref, email..."
            value={filters.search ?? ''}
            onChange={(e) => setFilter('search', e.target.value)}
            data-testid="search-input"
          />
          <Select
            options={[
              { value: 'car', label: 'Car' },
              { value: 'house', label: 'House' },
              { value: 'health', label: 'Health' },
            ]}
            placeholder="All types"
            value={filters.type ?? ''}
            onChange={(e) => setFilter('type', e.target.value as InsuranceType)}
            data-testid="type-filter"
          />
          <Select
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'expired', label: 'Expired' },
            ]}
            placeholder="All statuses"
            value={filters.status ?? ''}
            onChange={(e) => setFilter('status', e.target.value as QuoteStatus)}
            data-testid="status-filter"
          />
          <Button
            variant="secondary"
            onClick={() => setFilters({ clientId, page: 1, pageSize: 10 })}
            data-testid="clear-filters"
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium mb-1">No quotes found</p>
            <p className="text-sm">Try adjusting your filters or create a new quote.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="quotes-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Reference', 'Client', 'Type', 'Status', 'Premium', 'Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors" data-testid={`quote-row-${quote.id}`}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{quote.referenceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {quote.client.firstName} {quote.client.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{quote.client.email}</p>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={quote.type} /></td>
                    <td className="px-4 py-3"><StatusBadge status={quote.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {quote.result ? `$${quote.result.monthlyPremium.toFixed(2)}/mo` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/quotes/${quote.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        data-testid={`view-quote-${quote.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((data.page - 1) * data.pageSize) + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                data-testid="prev-page"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                data-testid="next-page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
