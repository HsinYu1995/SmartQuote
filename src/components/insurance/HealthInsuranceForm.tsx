import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { PRE_EXISTING_CONDITIONS } from '../../utils/constants'

export function HealthInsuranceForm() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext()

  const ce = (errors.condition ?? {}) as Record<string, { message?: string }>
  const selectedConditions: string[] = watch('condition.preExistingConditions') ?? []

  return (
    <div className="space-y-4" data-testid="health-insurance-form">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
        Health Coverage Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Plan Type"
          required
          options={[
            { value: 'HMO', label: 'HMO — Health Maintenance Organization' },
            { value: 'PPO', label: 'PPO — Preferred Provider Organization' },
            { value: 'EPO', label: 'EPO — Exclusive Provider Organization' },
            { value: 'HDHP', label: 'HDHP — High Deductible Health Plan' },
          ]}
          {...register('condition.planType')}
          error={ce.planType?.message}
          data-testid="plan-type"
        />
        <Select
          label="Coverage Type"
          required
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'couple', label: 'Couple' },
            { value: 'family', label: 'Family' },
          ]}
          {...register('condition.coverageType')}
          error={ce.coverageType?.message}
          data-testid="coverage-type"
        />
        <Input
          label="Client Age"
          type="number"
          required
          min={18}
          max={85}
          {...register('condition.clientAge', { valueAsNumber: true })}
          error={ce.clientAge?.message}
          data-testid="client-age"
        />
        <Select
          label="Smoking Status"
          required
          options={[
            { value: 'never', label: 'Never Smoked' },
            { value: 'former', label: 'Former Smoker' },
            { value: 'current', label: 'Current Smoker' },
          ]}
          {...register('condition.smokingStatus')}
          error={ce.smokingStatus?.message}
          data-testid="smoking-status"
        />
        <Input
          label="BMI"
          type="number"
          required
          step="0.1"
          min={10}
          max={60}
          placeholder="e.g. 24.5"
          {...register('condition.bmi', { valueAsNumber: true })}
          error={ce.bmi?.message}
          data-testid="bmi"
        />
        <Input
          label="Desired Deductible ($)"
          type="number"
          required
          min={0}
          step={100}
          {...register('condition.desiredDeductible', { valueAsNumber: true })}
          error={ce.desiredDeductible?.message}
          data-testid="desired-deductible"
        />
        <Input
          label="Number of Prescriptions/month"
          type="number"
          required
          min={0}
          {...register('condition.prescriptionCount', { valueAsNumber: true })}
          error={ce.prescriptionCount?.message}
          data-testid="prescription-count"
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Pre-existing Conditions
          <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
        </h4>
        <Controller
          name="condition.preExistingConditions"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="pre-existing-conditions">
              {PRE_EXISTING_CONDITIONS.map((cond) => (
                <label key={cond} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedConditions.includes(cond)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedConditions, cond]
                        : selectedConditions.filter((c: string) => c !== cond)
                      field.onChange(next)
                    }}
                    data-testid={`condition-${cond.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <span className="text-sm text-gray-700">{cond}</span>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Add-on Coverage</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Checkbox label="Dental Coverage" {...register('condition.needsDental')} data-testid="needs-dental" />
          <Checkbox label="Vision Coverage" {...register('condition.needsVision')} data-testid="needs-vision" />
          <Checkbox label="Mental Health Coverage" {...register('condition.needsMental')} data-testid="needs-mental" />
        </div>
      </div>
    </div>
  )
}
