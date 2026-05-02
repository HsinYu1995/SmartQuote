import type { Quote } from '../../types'
import { Card } from '../ui/Card'
import { StatusBadge, TypeBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Link } from 'react-router-dom'

interface QuoteResultPanelProps {
  quote: Quote
  onNewQuote?: () => void
}

export function QuoteResultPanel({ quote, onNewQuote }: QuoteResultPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in" data-testid="quote-result">
      <Card className="border-2 border-blue-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Reference Number</p>
            <p className="text-xl font-bold text-gray-900 font-mono" data-testid="reference-number">
              {quote.referenceNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TypeBadge type={quote.type} />
            <StatusBadge status={quote.status} />
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Client: <span className="font-medium text-gray-900">
              {quote.client.firstName} {quote.client.lastName}
            </span>
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            Email: <span className="font-medium text-gray-900">{quote.client.email}</span>
          </p>
        </div>

        {quote.status === 'rejected' ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-red-700 font-semibold text-lg mb-1">Quote Not Available</p>
            <p className="text-red-600 text-sm">
              Based on the risk profile provided, we are unable to offer coverage at this time.
              Please review the client's details or contact underwriting.
            </p>
          </div>
        ) : quote.result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-600 mb-1">Monthly Premium</p>
                <p className="text-3xl font-bold text-blue-700" data-testid="monthly-premium">
                  ${quote.result.monthlyPremium.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm text-green-600 mb-1">Annual Premium</p>
                <p className="text-3xl font-bold text-green-700" data-testid="annual-premium">
                  ${quote.result.annualPremium.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Deductible</span>
                <span className="font-medium">${quote.result.deductible.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Coverage Limit</span>
                <span className="font-medium">${quote.result.coverageLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Effective Date</span>
                <span className="font-medium">{quote.result.effectiveDate}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Expiry Date</span>
                <span className="font-medium">{quote.result.expiryDate}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Premium Breakdown</p>
              <div className="space-y-1.5" data-testid="premium-breakdown">
                {Object.entries(quote.result.breakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-blue-200 rounded-full"
                        style={{ width: `${(val / quote.result!.monthlyPremium) * 80}px` }}
                      />
                      <span className="font-medium w-16 text-right">${val.toFixed(2)}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onNewQuote} className="flex-1">
          New Quote
        </Button>
        <Link to={`/quotes/${quote.id}`} className="flex-1">
          <Button className="w-full">View Full Details</Button>
        </Link>
      </div>
    </div>
  )
}
