import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Calendar, 
  Heart, 
  BarChart3, 
  Settings,
  ChevronRight,
  Clock,
  Users,
  Target,
  BookOpen,
  MessageCircle,
  Star,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FamilyVisionBoard } from '../vision/FamilyVisionBoard'
import { SpiritualGrowthTracker } from '../spiritual/SpiritualGrowthTracker'
import { GuidedMeetingFlow } from '../meeting/GuidedMeetingFlow'
import { WeeklyMeetingContent } from '../WeeklyMeetingContent'
import { WeeklyReview } from '../WeeklyReview'

interface EnhancedWeeklyLayoutProps {
  currentDate: Date
  weekData: any
  onUpdateWeekData: (data: any) => void
  onSave: () => void
  isSaving?: boolean
  className?: string
}

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}

const tabs: TabItem[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    icon: Home,
    color: 'blue',
    description: 'Prayer, Vision & Mission'
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: Calendar,
    color: 'green',
    description: 'Schedule, Goals & Tasks'
  },
  {
    id: 'connection',
    label: 'Connection',
    icon: Heart,
    color: 'pink',
    description: 'Marriage, Family & Spiritual'
  },
  {
    id: 'review',
    label: 'Review',
    icon: BarChart3,
    color: 'purple',
    description: 'Analytics & Insights'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    color: 'gray',
    description: 'Preferences & Admin'
  }
]

export const EnhancedWeeklyLayout: React.FC<EnhancedWeeklyLayoutProps> = ({
  currentDate,
  weekData,
  onUpdateWeekData,
  onSave,
  isSaving = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('foundation')
  const [showGuidedFlow, setShowGuidedFlow] = useState(false)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleStartGuidedMeeting = () => {
    setShowGuidedFlow(true)
  }

  const handleCompleteGuidedMeeting = () => {
    setShowGuidedFlow(false)
    setActiveTab('review')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'foundation':
        return (
          <div className="space-y-6">
            {/* Quick Start Section */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Week's Foundation</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Week of {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <Button
                  onClick={handleStartGuidedMeeting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Guided Meeting
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Opening Prayer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Begin with God's presence</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Vision Check</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Align with family mission</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Reflection</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Review the past week</p>
                </div>
              </div>
            </Card>

            {/* Family Vision Board */}
            <FamilyVisionBoard
              missionStatement="Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose."
              oneYearGoals={[
                { id: 1, text: "Complete family Bible study program", category: 'spiritual', completed: false, progress: 60 },
                { id: 2, text: "Plan monthly family outings", category: 'family', completed: false, progress: 30 },
                { id: 3, text: "Establish emergency fund", category: 'financial', completed: false, progress: 45 }
              ]}
              fiveYearGoals={[
                { id: 1, text: "Lead a small group ministry", category: 'ministry', completed: false },
                { id: 2, text: "Purchase family home", category: 'family', completed: false },
                { id: 3, text: "Complete marriage enrichment program", category: 'personal', completed: false }
              ]}
              tenYearGoals={[
                { id: 1, text: "Send children to Christian college", category: 'family', completed: false },
                { id: 2, text: "Start family business", category: 'financial', completed: false },
                { id: 3, text: "Mission trip as family", category: 'ministry', completed: false }
              ]}
              coreValues={['Faith', 'Love', 'Service', 'Growth', 'Unity', 'Integrity']}
            />
          </div>
        )

      case 'planning':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Planning</h2>
              </div>
              <WeeklyMeetingContent
                activeSection="schedule"
                currentDate={currentDate}
                weekData={weekData}
                onUpdateSchedule={() => {}}
                onAddScheduleLine={() => {}}
                onRemoveScheduleLine={() => {}}
                onUpdateListItem={() => {}}
                onAddListItem={() => {}}
                onToggleListItem={() => {}}
                onRemoveListItem={() => {}}
                onUpdateTasks={() => {}}
                onUpdateGrocery={() => {}}
                onUpdateEncouragementNotes={() => {}}
                onSave={onSave}
                isSaving={isSaving}
              />
            </Card>
          </div>
        )

      case 'connection':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Marriage & Family Connection</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spiritual Growth */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spiritual Growth</h3>
                  <SpiritualGrowthTracker
                    prayerRequests={[
                      { id: 1, text: "Wisdom in parenting decisions", category: 'family', priority: 'high', dateAdded: '2024-01-15' },
                      { id: 2, text: "Healing for grandmother", category: 'health', priority: 'high', dateAdded: '2024-01-14' },
                      { id: 3, text: "Work-life balance", category: 'work', priority: 'medium', dateAdded: '2024-01-13' }
                    ]}
                    praiseReports={[
                      { id: 1, text: "God provided unexpected financial blessing", date: '2024-01-15', category: 'provision' },
                      { id: 2, text: "Children are growing in their faith", date: '2024-01-14', category: 'blessing' }
                    ]}
                    bibleReadingPlan={{
                      id: '1',
                      name: 'Read Through the Bible in a Year',
                      description: 'Daily reading plan',
                      startDate: '2024-01-01',
                      endDate: '2024-12-31',
                      currentDay: 15,
                      totalDays: 365,
                      dailyReading: 'Genesis 15-17, Matthew 5:1-26',
                      completed: false
                    }}
                    devotionalSchedule={{
                      id: '1',
                      name: 'Morning Devotions',
                      time: '7:00 AM',
                      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                      currentStreak: 12,
                      longestStreak: 30,
                      completedToday: true
                    }}
                    spiritualGoals={[
                      { id: 1, text: "Pray together daily", category: 'prayer', timeframe: 'daily', target: 30, current: 15, completed: false, startDate: '2024-01-01', endDate: '2024-01-31' },
                      { id: 2, text: "Read Bible together weekly", category: 'bible_study', timeframe: 'weekly', target: 4, current: 2, completed: false, startDate: '2024-01-01', endDate: '2024-01-31' }
                    ]}
                  />
                </div>

                {/* Marriage Connection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Marriage Connection</h3>
                  <div className="space-y-4">
                    <Card className="p-4 bg-pink-50 border-pink-200">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Date Night Ideas</h4>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>• Cook dinner together</li>
                        <li>• Take a walk in the park</li>
                        <li>• Watch a movie at home</li>
                        <li>• Try a new restaurant</li>
                      </ul>
                    </Card>
                    
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Appreciation Notes</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-white">
                          "Thank you for always making me coffee in the morning ❤️"
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-white">
                          "I love how you play with the kids after work"
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <WeeklyReview
              onBack={() => setActiveTab('foundation')}
              onNavigateToSection={(section) => {
                if (section === 'schedule') setActiveTab('planning')
                if (section === 'goals') setActiveTab('foundation')
                if (section === 'prayers') setActiveTab('connection')
              }}
            />
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings & Preferences</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Settings panel would go here...</p>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Marriage Meeting</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            <Button
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Tab Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? `bg-${tab.color}-50 border-2 border-${tab.color}-200 text-${tab.color}-700`
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive 
                      ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/20` 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      isActive 
                        ? `text-${tab.color}-600 dark:text-${tab.color}-400` 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{tab.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform text-gray-400 dark:text-gray-500 ${
                    isActive ? 'rotate-90' : ''
                  }`} />
                </motion.button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Guided Meeting Flow Modal */}
      <AnimatePresence>
        {showGuidedFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGuidedFlow(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <GuidedMeetingFlow
                onComplete={handleCompleteGuidedMeeting}
                onSkip={() => setShowGuidedFlow(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

