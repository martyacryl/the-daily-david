import React, { useEffect } from 'react'
import { useOnboardingStore, shouldShowOnboarding } from '../../stores/onboardingStore'
import { useAuthStore } from '../../stores/authStore'

export const OnboardingTrigger: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { startTour, isFirstTime } = useOnboardingStore()

  useEffect(() => {
    // Only trigger onboarding for authenticated users
    if (isAuthenticated && user && isFirstTime) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        if (shouldShowOnboarding()) {
          console.log('🎯 Starting onboarding tour for first-time user:', user.name)
          startTour()
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, isFirstTime, startTour])

  // This component doesn't render anything
  return null
}
