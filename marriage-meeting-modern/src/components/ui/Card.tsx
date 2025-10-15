import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90 landing:backdrop-blur-sm border-0 shadow-sm dark:shadow-gray-900/20 landing:shadow-xl landing:shadow-blue-500/10',
      elevated: 'bg-white dark:bg-gray-800 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90 landing:backdrop-blur-sm border-0 shadow-md hover:shadow-lg dark:shadow-gray-900/20 dark:hover:shadow-gray-900/30 landing:shadow-xl landing:shadow-blue-500/10 landing:hover:shadow-xl landing:hover:shadow-blue-500/20 transition-shadow duration-300',
      outline: 'border border-gray-200 dark:border-gray-700 landing:border-slate-600 bg-white/80 dark:bg-gray-800/80 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90 backdrop-blur-sm'
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