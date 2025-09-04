// Marriage Meeting Tool - Main Application Component

import React from 'react'
import { useAuthStore } from '../stores/authStore'
import { WeeklyMeetingSidebarLayout } from './WeeklyMeetingSidebarLayout'

export const MarriageMeetingTool: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return null
  }

  return <WeeklyMeetingSidebarLayout />
}