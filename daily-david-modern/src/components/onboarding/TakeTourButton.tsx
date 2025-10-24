import React from 'react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { Play, HelpCircle } from 'lucide-react'

interface TakeTourButtonProps {
  variant?: 'button' | 'link' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const TakeTourButton: React.FC<TakeTourButtonProps> = ({ 
  variant = 'button', 
  size = 'md',
  className = ''
}) => {
  const { restartTour, hasSeenTour } = useOnboardingStore()

  const handleTakeTour = () => {
    restartTour()
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleTakeTour}
        className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors ${className}`}
        title={hasSeenTour ? "Take the guided tour again" : "Take the guided tour to learn about the app"}
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    )
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleTakeTour}
        className={`text-green-400 hover:text-green-300 underline transition-colors ${className}`}
      >
        {hasSeenTour ? "Take tour again" : "Take the tour"}
      </button>
    )
  }

  // Default button variant
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={handleTakeTour}
      className={`
        ${sizeClasses[size]}
        bg-green-600 hover:bg-green-700 
        text-white font-medium 
        rounded-lg 
        flex items-center space-x-2
        transition-colors
        ${className}
      `}
    >
      <Play className="w-4 h-4" />
      <span>{hasSeenTour ? "Take Tour Again" : "Take Tour"}</span>
    </button>
  )
}
