import { useParams, Link } from 'react-router-dom'
import { useQuote } from '../hooks/useQuotes'
import { Card } from '../components/ui/Card'
import { StatusBadge, TypeBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { format } from 'date-fns'
import type { CarInsuranceCondition, HouseInsuranceCondition, HealthInsuranceCondition } from '../types'

function DetailRow({ label, value }: { label: string; value: string | number | boolean | undefined }) {
  if (value === undefined || value === null) return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{display}</span>
    </div>
  )
}

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: quote, isLoading, isError } = useQuote(id!)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-60 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (isError || !quote) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Quote not found.</p>
        <Link to="/quotes"><Button variant="secondary" className="mt-4">Back to History</Button></Link>
      </div>
    )
  }

  const carCond = quote.type === 'car' ? (quote.condition as CarInsuranceCondition) : null
  const houseCond = quote.type === 'house' ? (quote.condition as HouseInsuranceCondition) : null
  const healthCond = quote.type === 'health' ? (quote.condition as HealthInsuranceCondition) : null

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="quote-detail">
      <div className="flex items-center gap-3">
        <Link to="/quotes" className="text-sm text-gray-500 hover:text-gray-700">← History</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-mono">{quote.referenceNumber}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono" data-testid="quote-ref">
            {quote.referenceNumber}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Created {format(new Date(quote.createdAt), 'MMM d, yyyy — h:mm a')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TypeBadge type={quote.type} />
          <StatusBadge status={quote.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Client Information</h2>
          <DetailRow label="Name" value={`${quote.client.firstName} ${quote.client.lastName}`} />
          <DetailRow label="Date of Birth" value={quote.client.dateOfBirth} />
          <DetailRow label="Email" value={quote.client.email} />
          <DetailRow label="Phone" value={quote.client.phone} />
          <DetailRow label="Address" value={quote.client.address} />
          <DetailRow label="City / State / ZIP" value={`${quote.client.city}, ${quote.client.state} ${quote.client.zipCode}`} />
        </Card>

        {quote.result ? (
          <Card className="border-2 border-blue-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Premium Summary</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-500 mb-1">Monthly</p>
                <p className="text-2xl font-bold text-blue-700" data-testid="detail-monthly">
                  ${quote.result.monthlyPremium.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-500 mb-1">Annual</p>
                <p className="text-2xl font-bold text-green-700" data-testid="detail-annual">
                  ${quote.result.annualPremium.toFixed(2)}
                </p>
              </div>
            </div>
            <DetailRow label="Deductible" value={`$${quote.result.deductible.toLocaleString()}`} />
            <DetailRow label="Coverage Limit" value={`$${quote.result.coverageLimit.toLocaleString()}`} />
            <DetailRow label="Effective Date" value={quote.result.effectiveDate} />
            <DetailRow label="Expiry Date" value={quote.result.expiryDate} />
          </Card>
        ) : (
          <Card className="border-2 border-red-100 flex items-center justify-center">
            <div className="text-center py-4">
              <p className="text-red-600 font-semibold text-lg">Coverage Unavailable</p>
              <p className="text-red-400 text-sm mt-1">Risk profile exceeds underwriting limits</p>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          {quote.type === 'car' ? 'Vehicle' : quote.type === 'house' ? 'Property' : 'Health'} Details
        </h2>
        {carCond && (
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <DetailRow label="Make / Model" value={`${carCond.vehicleMake} ${carCond.vehicleModel}`} />
              <DetailRow label="Year" value={carCond.vehicleYear} />
              <DetailRow label="VIN" value={carCond.vehicleVin} />
              <DetailRow label="Usage" value={carCond.usage} />
            </div>
            <div>
              <DetailRow label="Annual Mileage" value={`${carCond.annualMileage.toLocaleString()} mi`} />
              <DetailRow label="Coverage Level" value={carCond.coverageLevel} />
              <DetailRow label="Years Licensed" value={carCond.driverLicenseYears} />
              <DetailRow label="Prior Accidents" value={carCond.priorAccidents} />
            </div>
          </div>
        )}
        {houseCond && (
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <DetailRow label="Address" value={houseCond.propertyAddress} />
              <DetailRow label="Year Built" value={houseCond.yearBuilt} />
              <DetailRow label="Size" value={`${houseCond.squareFootage.toLocaleString()} sq ft`} />
              <DetailRow label="Construction" value={houseCond.constructionType} />
            </div>
            <div>
              <DetailRow label="Roof Type" value={houseCond.roofType} />
              <DetailRow label="Roof Age" value={`${houseCond.roofAge} years`} />
              <DetailRow label="Sprinklers" value={houseCond.hasSprinklers} />
              <DetailRow label="Security System" value={houseCond.hasSecuritySystem} />
            </div>
          </div>
        )}
        {healthCond && (
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <DetailRow label="Plan Type" value={healthCond.planType} />
              <DetailRow label="Coverage Type" value={healthCond.coverageType} />
              <DetailRow label="Age" value={healthCond.clientAge} />
              <DetailRow label="Smoking" value={healthCond.smokingStatus} />
            </div>
            <div>
              <DetailRow label="BMI" value={healthCond.bmi} />
              <DetailRow label="Deductible" value={`$${healthCond.desiredDeductible.toLocaleString()}`} />
              <DetailRow label="Pre-existing" value={healthCond.preExistingConditions.join(', ') || 'None'} />
              <DetailRow label="Prescriptions/mo" value={healthCond.prescriptionCount} />
            </div>
          </div>
        )}
      </Card>

      {quote.result && (
        <Card>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Premium Breakdown</h2>
          <div className="space-y-2">
            {Object.entries(quote.result.breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(val / quote.result!.monthlyPremium) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ${val.toFixed(2)}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
