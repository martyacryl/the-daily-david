import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border-0 shadow-sm dark:shadow-gray-900/20',
      elevated: 'bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg dark:shadow-gray-900/20 dark:hover:shadow-gray-900/30 transition-shadow duration-300',
      outline: 'border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
    }

    return (
      <motion.div
        ref={ref}
        className={cn('rounded-xl p-6', variants[variant], className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'