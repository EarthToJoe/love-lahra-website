import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface FormProps {
  children: ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
}

const Form = ({ children, className, onSubmit }: FormProps) => {
  return (
    <form className={cn('space-y-6', className)} onSubmit={onSubmit}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: ReactNode
  className?: string
}

const FormField = ({ children, className }: FormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

interface FormLabelProps {
  children: ReactNode
  className?: string
  htmlFor?: string
  required?: boolean
}

const FormLabel = ({ children, className, htmlFor, required }: FormLabelProps) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-neutral-700', className)}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  variant?: 'default' | 'elegant'
  describedBy?: string
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, variant = 'default', describedBy, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2'
    
    const variantClasses = {
      default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
      elegant: 'border-neutral-200 bg-neutral-50 focus:bg-white focus:border-accent-400 focus:ring-accent-400/20',
    }

    const errorClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : variantClasses[variant]

    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperTextId = describedBy ? `${inputId}-helper` : undefined

    return (
      <div>
        <input
          ref={ref}
          id={inputId}
          className={cn(baseClasses, errorClasses, className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperTextId, describedBy].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  variant?: 'default' | 'elegant'
  describedBy?: string
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, variant = 'default', describedBy, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 resize-vertical'
    
    const variantClasses = {
      default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
      elegant: 'border-neutral-200 bg-neutral-50 focus:bg-white focus:border-accent-400 focus:ring-accent-400/20',
    }

    const errorClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : variantClasses[variant]

    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${textareaId}-error` : undefined
    const helperTextId = describedBy ? `${textareaId}-helper` : undefined

    return (
      <div>
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(baseClasses, errorClasses, className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperTextId, describedBy].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  variant?: 'default' | 'elegant'
  children: ReactNode
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2'
    
    const variantClasses = {
      default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
      elegant: 'border-neutral-200 bg-neutral-50 focus:bg-white focus:border-accent-400 focus:ring-accent-400/20',
    }

    const errorClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : variantClasses[variant]

    return (
      <div>
        <select
          ref={ref}
          className={cn(baseClasses, errorClasses, className)}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'

interface FormErrorProps {
  children: ReactNode
  className?: string
}

const FormError = ({ children, className }: FormErrorProps) => {
  return (
    <p className={cn('text-sm text-red-600', className)}>
      {children}
    </p>
  )
}

interface FormHelperTextProps {
  children: ReactNode
  className?: string
}

const FormHelperText = ({ children, className }: FormHelperTextProps) => {
  return (
    <p className={cn('text-sm text-neutral-500', className)}>
      {children}
    </p>
  )
}

export { 
  Form, 
  FormField, 
  FormLabel, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormError, 
  FormHelperText 
}