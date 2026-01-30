import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'luxury' | 'minimal'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = 'default', padding = 'md', hover = false, ...props }, ref) => {
    const baseClasses = 'rounded-lg transition-all duration-200'
    
    const variantClasses = {
      default: 'bg-white border border-neutral-200',
      elevated: 'bg-white shadow-elegant',
      luxury: 'bg-white shadow-luxury border border-neutral-100',
      minimal: 'bg-neutral-50 border border-neutral-100',
    }

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    }

    const hoverClasses = hover ? 'hover:shadow-luxury hover:-translate-y-1' : ''

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle = ({ children, className, as: Component = 'h3' }: CardTitleProps) => {
  return (
    <Component className={cn('font-display font-semibold text-primary-900', className)}>
      {children}
    </Component>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={cn('text-neutral-600', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div className={cn('mt-6 pt-4 border-t border-neutral-100', className)}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter }