import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema, carConditionSchema, houseConditionSchema, healthConditionSchema } from '../types/validation'
import { useCreateQuote } from '../hooks/useQuotes'
import { useAuthStore } from '../store/authStore'
import { ClientForm } from '../components/insurance/ClientForm'
import { CarInsuranceForm } from '../components/insurance/CarInsuranceForm'
import { HouseInsuranceForm } from '../components/insurance/HouseInsuranceForm'
import { HealthInsuranceForm } from '../components/insurance/HealthInsuranceForm'
import { QuoteResultPanel } from '../components/quotes/QuoteResultPanel'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { InsuranceType, Quote } from '../types'

const carSchema = z.object({ client: clientSchema, condition: carConditionSchema })
const houseSchema = z.object({ client: clientSchema, condition: houseConditionSchema })
const healthSchema = z.object({ client: clientSchema, condition: healthConditionSchema })

const TYPE_LABELS: Record<InsuranceType, string> = {
  car: 'Car Insurance',
  house: 'House Insurance',
  health: 'Health Insurance',
}

const TYPE_ICONS: Record<InsuranceType, string> = { car: '🚗', house: '🏠', health: '🏥' }

function TypeSelector({ selected, onChange }: { selected: InsuranceType; onChange: (t: InsuranceType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3" data-testid="type-selector">
      {(['car', 'house', 'health'] as InsuranceType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          data-testid={`type-${type}`}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            selected === type
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl mb-1">{TYPE_ICONS[type]}</div>
          <div className="text-sm font-medium">{TYPE_LABELS[type]}</div>
        </button>
      ))}
    </div>
  )
}

export function NewQuotePage() {
  const [searchParams] = useSearchParams()
  const defaultType = (searchParams.get('type') as InsuranceType) ?? 'car'
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(defaultType)
  const [submittedQuote, setSubmittedQuote] = useState<Quote | null>(null)
  const { broker } = useAuthStore()
  const { mutateAsync: createQuote, isPending } = useCreateQuote()

  const schema = insuranceType === 'car' ? carSchema : insuranceType === 'house' ? houseSchema : healthSchema

  const getDefaultCondition = () => {
    if (insuranceType === 'car') return { vehicleYear: new Date().getFullYear(), usage: 'personal', coverageLevel: 'standard', priorAccidents: 0, driverLicenseYears: 0, annualMileage: 12000 }
    if (insuranceType === 'house') return { constructionType: 'wood', roofType: 'asphalt', roofAge: 0, occupancy: 'owner', hasSprinklers: false, hasSecuritySystem: false, hasPool: false }
    return { planType: 'PPO', coverageType: 'individual', smokingStatus: 'never', preExistingConditions: [] as string[], needsDental: false, needsVision: false, needsMental: false, prescriptionCount: 0 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { condition: getDefaultCondition() },
  })

  const handleTypeChange = (type: InsuranceType) => {
    setInsuranceType(type)
    methods.reset()
    setSubmittedQuote(null)
  }

  const onSubmit = methods.handleSubmit(async (data) => {
    const quote = await createQuote({
      type: insuranceType,
      client: data.client,
      condition: data.condition,
      brokerId: broker!.id,
    })
    setSubmittedQuote(quote)
  })

  if (submittedQuote) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quote Generated</h1>
        <QuoteResultPanel quote={submittedQuote} onNewQuote={() => { setSubmittedQuote(null); methods.reset() }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="new-quote-page">
      <h1 className="text-2xl font-bold text-gray-900">New Quote Request</h1>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Insurance Type</h2>
        <TypeSelector selected={insuranceType} onChange={handleTypeChange} />
      </Card>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="space-y-6" noValidate data-testid="quote-form">
          <Card>
            <ClientForm />
          </Card>

          <Card>
            {insuranceType === 'car' && <CarInsuranceForm />}
            {insuranceType === 'house' && <HouseInsuranceForm />}
            {insuranceType === 'health' && <HealthInsuranceForm />}
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              loading={isPending}
              data-testid="submit-quote"
            >
              {isPending ? 'Generating Quote…' : 'Generate Quote'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
