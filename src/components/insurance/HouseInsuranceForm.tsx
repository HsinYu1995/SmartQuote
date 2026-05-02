import { useFormContext } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { US_STATES, CURRENT_YEAR } from '../../utils/constants'

export function HouseInsuranceForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const ce = (errors.condition ?? {}) as Record<string, { message?: string }>

  return (
    <div className="space-y-4" data-testid="house-insurance-form">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
        Property Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Property Address"
          required
          className="sm:col-span-2"
          {...register('condition.propertyAddress')}
          error={ce.propertyAddress?.message}
          data-testid="property-address"
        />
        <Input
          label="City"
          required
          {...register('condition.propertyCity')}
          error={ce.propertyCity?.message}
          data-testid="property-city"
        />
        <Select
          label="State"
          required
          options={US_STATES}
          placeholder="Select state"
          {...register('condition.propertyState')}
          error={ce.propertyState?.message}
          data-testid="property-state"
        />
        <Input
          label="ZIP Code"
          required
          {...register('condition.propertyZip')}
          error={ce.propertyZip?.message}
          data-testid="property-zip"
        />
        <Input
          label="Year Built"
          type="number"
          required
          min={1800}
          max={CURRENT_YEAR}
          {...register('condition.yearBuilt', { valueAsNumber: true })}
          error={ce.yearBuilt?.message}
          data-testid="year-built"
        />
        <Input
          label="Square Footage"
          type="number"
          required
          min={100}
          {...register('condition.squareFootage', { valueAsNumber: true })}
          error={ce.squareFootage?.message}
          data-testid="square-footage"
        />
        <Select
          label="Construction Type"
          required
          options={[
            { value: 'wood', label: 'Wood Frame' },
            { value: 'brick', label: 'Brick' },
            { value: 'concrete', label: 'Concrete' },
            { value: 'mixed', label: 'Mixed' },
          ]}
          {...register('condition.constructionType')}
          error={ce.constructionType?.message}
          data-testid="construction-type"
        />
        <Select
          label="Roof Type"
          required
          options={[
            { value: 'asphalt', label: 'Asphalt Shingles' },
            { value: 'metal', label: 'Metal' },
            { value: 'tile', label: 'Tile' },
            { value: 'flat', label: 'Flat/Membrane' },
          ]}
          {...register('condition.roofType')}
          error={ce.roofType?.message}
          data-testid="roof-type"
        />
        <Input
          label="Roof Age (years)"
          type="number"
          required
          min={0}
          {...register('condition.roofAge', { valueAsNumber: true })}
          error={ce.roofAge?.message}
          data-testid="roof-age"
        />
        <Select
          label="Occupancy Type"
          required
          options={[
            { value: 'owner', label: 'Owner Occupied' },
            { value: 'tenant', label: 'Tenant / Rental' },
            { value: 'vacant', label: 'Vacant' },
          ]}
          {...register('condition.occupancy')}
          error={ce.occupancy?.message}
          data-testid="occupancy"
        />
        <Input
          label="Estimated Property Value ($)"
          type="number"
          required
          min={50000}
          {...register('condition.estimatedValue', { valueAsNumber: true })}
          error={ce.estimatedValue?.message}
          data-testid="estimated-value"
        />
        <Input
          label="Desired Coverage Amount ($)"
          type="number"
          required
          min={50000}
          {...register('condition.desiredCoverage', { valueAsNumber: true })}
          error={ce.desiredCoverage?.message}
          data-testid="desired-coverage"
        />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Features</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Checkbox
            label="Fire Sprinkler System"
            {...register('condition.hasSprinklers')}
            data-testid="has-sprinklers"
          />
          <Checkbox
            label="Security / Alarm System"
            {...register('condition.hasSecuritySystem')}
            data-testid="has-security"
          />
          <Checkbox
            label="Swimming Pool"
            {...register('condition.hasPool')}
            data-testid="has-pool"
          />
        </div>
      </div>
    </div>
  )
}
