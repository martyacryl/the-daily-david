import React from 'react'
import { cn } from '../../lib/utils'
import { useAccentColor } from '../../hooks/useAccentColor'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  useAccentColor?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, useAccentColor: shouldUseAccentColor = false, ...props }, ref) => {
    const { getColor } = useAccentColor()
    // Debug logging for mobile
    console.log('Input component rendering:', { label, value: props.value, placeholder: props.placeholder })
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white',
            shouldUseAccentColor ? `focus:ring-${getColor('primary')}` : 'focus:ring-blue-500',
            error && 'bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:bg-red-50 dark:focus:bg-red-900/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'