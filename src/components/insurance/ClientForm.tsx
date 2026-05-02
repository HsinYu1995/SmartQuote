import { useFormContext } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { US_STATES } from '../../utils/constants'

export function ClientForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const ce = (errors.client ?? {}) as Record<string, { message?: string }>

  return (
    <div className="space-y-4" data-testid="client-form">
      <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">Client Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          required
          {...register('client.firstName')}
          error={ce.firstName?.message}
          data-testid="client-firstName"
        />
        <Input
          label="Last Name"
          required
          {...register('client.lastName')}
          error={ce.lastName?.message}
          data-testid="client-lastName"
        />
        <Input
          label="Date of Birth"
          type="date"
          required
          {...register('client.dateOfBirth')}
          error={ce.dateOfBirth?.message}
          data-testid="client-dob"
        />
        <Input
          label="Email"
          type="email"
          required
          {...register('client.email')}
          error={ce.email?.message}
          data-testid="client-email"
        />
        <Input
          label="Phone"
          type="tel"
          required
          placeholder="5551234567"
          {...register('client.phone')}
          error={ce.phone?.message}
          data-testid="client-phone"
        />
        <Input
          label="Address"
          required
          {...register('client.address')}
          error={ce.address?.message}
          data-testid="client-address"
        />
        <Input
          label="City"
          required
          {...register('client.city')}
          error={ce.city?.message}
          data-testid="client-city"
        />
        <Select
          label="State"
          required
          options={US_STATES}
          placeholder="Select state"
          {...register('client.state')}
          error={ce.state?.message}
          data-testid="client-state"
        />
        <Input
          label="ZIP Code"
          required
          placeholder="12345"
          {...register('client.zipCode')}
          error={ce.zipCode?.message}
          data-testid="client-zip"
        />
      </div>
    </div>
  )
}
