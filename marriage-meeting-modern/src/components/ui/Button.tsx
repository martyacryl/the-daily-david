import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAccentColor } from '../../hooks/useAccentColor'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => {
    const { getColor } = useAccentColor()
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variants = {
      default: `bg-${getColor('primary')} landing:bg-gradient-to-r landing:from-blue-600 landing:via-purple-600 landing:to-blue-700 text-white hover:bg-${getColor('primary')} landing:hover:from-blue-700 landing:hover:via-purple-700 landing:hover:to-blue-800 focus:ring-${getColor('primary')} landing:focus:ring-blue-500 shadow-sm hover:shadow-md landing:shadow-lg landing:hover:shadow-xl landing:shadow-blue-500/25 landing:hover:shadow-blue-500/30`,
      outline: 'border border-gray-200 dark:border-gray-600 landing:border-slate-600 text-gray-700 dark:text-gray-300 landing:text-slate-200 hover:bg-gray-50 dark:hover:bg-gray-700 landing:hover:bg-slate-700/50 hover:border-gray-300 dark:hover:border-gray-500 landing:hover:border-slate-500 focus:ring-gray-500 landing:focus:ring-blue-500 bg-white dark:bg-gray-800 landing:bg-slate-800/50',
      ghost: 'text-gray-700 dark:text-gray-300 landing:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-700 landing:hover:bg-slate-700/50 focus:ring-gray-500 landing:focus:ring-blue-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className, {
          'opacity-50 cursor-not-allowed': disabled || loading
        })}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'