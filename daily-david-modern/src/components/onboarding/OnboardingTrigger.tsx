import React, { useEffect } from 'react'
import { useOnboardingStore, shouldShowOnboarding } from '../../stores/onboardingStore'
import { useAuthStore } from '../../stores/authStore'

export const OnboardingTrigger: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { startTour, isFirstTime, forceResetForNewUser } = useOnboardingStore()

  useEffect(() => {
    console.log('🎯 OnboardingTrigger: Effect triggered', { 
      isAuthenticated, 
      user: user?.name, 
      userId: user?.id,
      isFirstTime,
      shouldShow: shouldShowOnboarding()
    })
    
    // Force reset onboarding state for new user
    if (isAuthenticated && user?.id) {
      console.log('🎯 OnboardingTrigger: User authenticated, checking if new user')
      forceResetForNewUser(user.id)
    }
    
    // Only trigger onboarding for authenticated users
    if (isAuthenticated && user && isFirstTime) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        const shouldShow = shouldShowOnboarding()
        console.log('🎯 OnboardingTrigger: After delay, shouldShow:', shouldShow)
        
        if (shouldShow) {
          console.log('🎯 Starting onboarding tour for first-time user:', user.name)
          startTour()
        } else {
          console.log('🎯 OnboardingTrigger: Not starting tour - conditions not met')
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, isFirstTime, startTour, forceResetForNewUser])

  // This component doesn't render anything
  return null
}
