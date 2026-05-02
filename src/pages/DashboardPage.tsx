import { Link } from 'react-router-dom'
import { useStats, useQuotes } from '../hooks/useQuotes'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/Card'
import { StatusBadge, TypeBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { format } from 'date-fns'

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </Card>
  )
}

export function DashboardPage() {
  const { broker } = useAuthStore()
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: recent, isLoading: quotesLoading } = useQuotes({ pageSize: 5 })

  return (
    <div className="space-y-8" data-testid="dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {broker?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/quotes/new">
          <Button size="lg" data-testid="new-quote-button">
            + New Quote
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Quotes Today" value={stats?.totalToday ?? 0} color="border-blue-500" />
            <StatCard label="Approved Today" value={stats?.approvedToday ?? 0} color="border-green-500" />
            <StatCard label="Rejected Today" value={stats?.rejectedToday ?? 0} color="border-red-500" />
            <StatCard label="Pending Review" value={stats?.pendingTotal ?? 0} color="border-yellow-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
            <Link to="/quotes" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {quotesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-12 bg-gray-200 rounded flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2" data-testid="recent-quotes">
              {recent?.data.map((quote) => (
                <Link
                  key={quote.id}
                  to={`/quotes/${quote.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <TypeBadge type={quote.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {quote.client.firstName} {quote.client.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{quote.referenceNumber}</p>
                  </div>
                  <StatusBadge status={quote.status} />
                  {quote.result && (
                    <span className="text-sm font-semibold text-gray-700 ml-2 whitespace-nowrap">
                      ${quote.result.monthlyPremium.toFixed(2)}/mo
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/quotes/new?type=car', icon: '🚗', label: 'Car Insurance Quote', desc: 'Auto coverage for clients' },
              { to: '/quotes/new?type=house', icon: '🏠', label: 'House Insurance Quote', desc: 'Property protection' },
              { to: '/quotes/new?type=health', icon: '🏥', label: 'Health Insurance Quote', desc: 'Medical coverage plans' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                data-testid={`quick-action-${action.to.includes('car') ? 'car' : action.to.includes('house') ? 'house' : 'health'}`}
              >
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
