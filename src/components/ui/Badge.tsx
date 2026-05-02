import { clsx } from 'clsx'
import type { QuoteStatus, InsuranceType } from '../../types'

interface StatusBadgeProps {
  status: QuoteStatus
}

interface TypeBadgeProps {
  type: InsuranceType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', {
        'bg-yellow-100 text-yellow-800': status === 'pending',
        'bg-green-100 text-green-800': status === 'approved',
        'bg-red-100 text-red-800': status === 'rejected',
        'bg-gray-100 text-gray-600': status === 'expired',
      })}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const icon = { car: '🚗', house: '🏠', health: '🏥' }[type]
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
      {icon} {type}
    </span>
  )
}
