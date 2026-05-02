import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...props}
          />
          <span className="text-sm text-gray-700">{label}</span>
        </label>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'
