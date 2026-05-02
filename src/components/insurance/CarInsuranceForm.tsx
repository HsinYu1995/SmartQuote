import { useFormContext } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { VEHICLE_YEARS } from '../../utils/constants'

export function CarInsuranceForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const ce = (errors.condition ?? {}) as Record<string, { message?: string }>

  return (
    <div className="space-y-4" data-testid="car-insurance-form">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
        Vehicle & Coverage Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Vehicle Make"
          required
          placeholder="e.g. Toyota"
          {...register('condition.vehicleMake')}
          error={ce.vehicleMake?.message}
          data-testid="vehicle-make"
        />
        <Input
          label="Vehicle Model"
          required
          placeholder="e.g. Camry"
          {...register('condition.vehicleModel')}
          error={ce.vehicleModel?.message}
          data-testid="vehicle-model"
        />
        <Select
          label="Vehicle Year"
          required
          options={VEHICLE_YEARS}
          placeholder="Select year"
          {...register('condition.vehicleYear', { valueAsNumber: true })}
          error={ce.vehicleYear?.message}
          data-testid="vehicle-year"
        />
        <Input
          label="VIN"
          required
          placeholder="17-character VIN"
          maxLength={17}
          {...register('condition.vehicleVin')}
          error={ce.vehicleVin?.message}
          data-testid="vehicle-vin"
        />
        <Select
          label="Primary Usage"
          required
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' },
            { value: 'rideshare', label: 'Rideshare (Uber/Lyft)' },
          ]}
          {...register('condition.usage')}
          error={ce.usage?.message}
          data-testid="vehicle-usage"
        />
        <Input
          label="Annual Mileage"
          type="number"
          required
          placeholder="12000"
          {...register('condition.annualMileage', { valueAsNumber: true })}
          error={ce.annualMileage?.message}
          data-testid="annual-mileage"
        />
        <Select
          label="Coverage Level"
          required
          options={[
            { value: 'basic', label: 'Basic — Liability only ($50k limit)' },
            { value: 'standard', label: 'Standard — Liability + Collision ($100k limit)' },
            { value: 'comprehensive', label: 'Comprehensive — Full coverage ($300k limit)' },
          ]}
          {...register('condition.coverageLevel')}
          error={ce.coverageLevel?.message}
          data-testid="coverage-level"
        />
        <Input
          label="Years Licensed"
          type="number"
          required
          min={0}
          {...register('condition.driverLicenseYears', { valueAsNumber: true })}
          error={ce.driverLicenseYears?.message}
          data-testid="license-years"
        />
        <Input
          label="Prior Accidents (last 5 yrs)"
          type="number"
          required
          min={0}
          max={20}
          {...register('condition.priorAccidents', { valueAsNumber: true })}
          error={ce.priorAccidents?.message}
          data-testid="prior-accidents"
        />
        <Input
          label="Current Insurer (optional)"
          placeholder="e.g. State Farm"
          {...register('condition.currentInsurer')}
          data-testid="current-insurer"
        />
      </div>
    </div>
  )
}
