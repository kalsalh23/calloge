import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ------------------------------------------------------------------- Input
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-light">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn('input', leftIcon && 'pr-10', error && 'border-accent-burgundy focus:border-accent-burgundy focus:ring-accent-burgundy/10', className)}
            {...props}
          />
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-accent-burgundy">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ------------------------------------------------------------------ Select
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn('select', error && 'border-accent-burgundy', className)}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-light">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-accent-burgundy">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// --------------------------------------------------------------- Textarea
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn('input min-h-28 resize-y', error && 'border-accent-burgundy', className)}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-medium text-accent-burgundy">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
