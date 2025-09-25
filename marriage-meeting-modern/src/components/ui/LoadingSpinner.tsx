import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAccentColor } from '../../hooks/useAccentColor'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const { getColor } = useAccentColor()
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <Loader2 className={cn('animate-spin text-green-600', sizes[size], className)} />
  )
}