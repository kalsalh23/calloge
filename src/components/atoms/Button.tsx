import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'ghost'
  | 'ghostLight'
  | 'outlineGold'
  | 'danger'
  | 'surface'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base py-3.5',
}

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  ghost: 'btn-ghost',
  ghostLight: 'btn-ghost-light',
  outlineGold: 'btn-outline-gold',
  danger: 'btn bg-accent-burgundy text-white hover:brightness-110',
  surface: 'btn bg-surface-alt text-ink-dark hover:bg-surface-border border border-surface-border',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" className="text-current" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
