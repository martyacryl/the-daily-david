import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, TrendingUp, Users, Target, Award } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ProgressAnalytics } from './ProgressAnalytics'
import { WeeklyMeetingAnalytics } from './WeeklyMeetingAnalytics'

type AnalyticsTab = 'overview' | 'weekly-meetings'

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')

  const tabs = [
    {
      id: 'overview' as AnalyticsTab,
      label: 'Overview',
      icon: BarChart3,
      description: 'General marriage progress and consistency metrics'
    },
    {
      id: 'weekly-meetings' as AnalyticsTab,
      label: 'Weekly Meetings',
      icon: Calendar,
      description: 'Detailed weekly meeting analytics and trends'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100 pt-20 sm:pt-24">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Marriage Analytics</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 px-4">
            Track your marriage progress and weekly meeting performance
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="p-1 sm:p-2 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                      activeTab === tab.id
                        ? 'bg-slate-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="p-3 sm:p-6 bg-white shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Progress Overview</h2>
                    <p className="text-xs sm:text-sm text-slate-600">General marriage progress and consistency metrics</p>
                  </div>
                </div>
                <ProgressAnalytics />
              </Card>
            </div>
          )}

          {activeTab === 'weekly-meetings' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="p-3 sm:p-6 bg-white shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">Weekly Meeting Analytics</h2>
                    <p className="text-xs sm:text-sm text-slate-600">Detailed weekly meeting analytics with monthly, quarterly, and annual views</p>
                  </div>
                </div>
                <WeeklyMeetingAnalytics />
              </Card>
            </div>
          )}
        </motion.div>

        {/* Quick Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8"
        >
          <Card className="p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              Analytics Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-800">Progress Tracking</h4>
                  <p className="text-xs sm:text-sm text-slate-600">Monitor completion rates and consistency over time</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-800">Time Periods</h4>
                  <p className="text-xs sm:text-sm text-slate-600">View data by month, quarter, or year</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-800">Goal Analysis</h4>
                  <p className="text-xs sm:text-sm text-slate-600">Track goal achievement and identify growth areas</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-800">Meeting Insights</h4>
                  <p className="text-xs sm:text-sm text-slate-600">Analyze meeting patterns and effectiveness</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-800">Visual Charts</h4>
                  <p className="text-xs sm:text-sm text-slate-600">Clear visualizations of your progress data</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-slate-800">Recommendations</h4>
                  <p className="text-xs sm:text-sm text-slate-600">Personalized insights and growth suggestions</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
