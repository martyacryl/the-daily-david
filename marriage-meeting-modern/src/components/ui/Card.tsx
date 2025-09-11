import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border-0 shadow-sm',
      elevated: 'bg-white border-0 shadow-md hover:shadow-lg transition-shadow duration-300',
      outline: 'border border-gray-200 bg-white/80 backdrop-blur-sm'
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