import React from 'react'
import { SpiritualGrowthTracker } from './spiritual/SpiritualGrowthTracker'

export const SpiritualPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <SpiritualGrowthTracker className="pt-0" />
        </div>
      </div>
    </div>
  )
}
