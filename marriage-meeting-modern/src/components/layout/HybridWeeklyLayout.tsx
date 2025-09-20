import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Target, 
  CheckSquare, 
  Heart, 
  ShoppingCart, 
  AlertTriangle,
  MessageCircle,
  ChevronRight,
  Star,
  Home,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Play,
  BarChart3,
  Settings,
  Plus,
  Edit3,
  Eye
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { WeeklyMeetingContent } from '../WeeklyMeetingContent'
import { FamilyVisionBoard } from '../vision/FamilyVisionBoard'
import { SpiritualGrowthTracker } from '../spiritual/SpiritualGrowthTracker'
import { GuidedMeetingFlow } from '../meeting/GuidedMeetingFlow'
import { EnhancedWeeklyReview } from '../review/EnhancedWeeklyReview'

interface HybridWeeklyLayoutProps {
  currentDate: Date
  weekData: any
  onUpdateWeekData: (data: any) => void
  onSave: () => void
  isSaving?: boolean
  className?: string
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  count?: number
  category: 'practical' | 'vision' | 'spiritual' | 'review'
}

const sidebarItems: SidebarItem[] = [
  // Vision & Foundation
  {
    id: 'vision',
    label: 'Family Vision',
    icon: Home,
    color: 'blue',
    category: 'vision'
  },
  {
    id: 'spiritual',
    label: 'Spiritual Growth',
    icon: BookOpen,
    color: 'purple',
    category: 'spiritual'
  },
  // Practical Planning
  {
    id: 'schedule',
    label: 'Weekly Schedule',
    icon: Calendar,
    color: 'slate',
    count: 0,
    category: 'practical'
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    color: 'green',
    count: 0,
    category: 'practical'
  },
  {
    id: 'todos',
    label: 'Tasks',
    icon: CheckSquare,
    color: 'orange',
    count: 0,
    category: 'practical'
  },
  {
    id: 'prayers',
    label: 'Prayers',
    icon: Heart,
    color: 'pink',
    count: 0,
    category: 'spiritual'
  },
  {
    id: 'grocery',
    label: 'Grocery',
    icon: ShoppingCart,
    color: 'yellow',
    count: 0,
    category: 'practical'
  },
  {
    id: 'unconfessed',
    label: 'Accountability',
    icon: AlertTriangle,
    color: 'red',
    count: 0,
    category: 'spiritual'
  },
  {
    id: 'encouragement',
    label: 'Encouragement',
    icon: MessageCircle,
    color: 'indigo',
    count: 0,
    category: 'spiritual'
  },
  // Review & Analytics
  {
    id: 'review',
    label: 'Week Review',
    icon: BarChart3,
    color: 'purple',
    category: 'review'
  }
]

export const HybridWeeklyLayout: React.FC<HybridWeeklyLayoutProps> = ({
  currentDate,
  weekData,
  onUpdateWeekData,
  onSave,
  isSaving = false,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState('schedule')
  const [showGuidedFlow, setShowGuidedFlow] = useState(false)
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [showSpiritualModal, setShowSpiritualModal] = useState(false)

  // Calculate section counts
  const sectionCounts = {
    schedule: Object.values(weekData.schedule || {}).flat().filter((item: any) => item && item.trim()).length,
    todos: (weekData.todos || []).length,
    prayers: (weekData.prayers || []).length,
    grocery: (weekData.grocery || []).reduce((total: number, storeList: any) => total + (storeList.items?.length || 0), 0),
    unconfessed: (weekData.unconfessedSin || []).length,
    encouragement: (weekData.encouragementNotes || []).length
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const handleStartGuidedMeeting = () => {
    setShowGuidedFlow(true)
  }

  const handleCompleteGuidedMeeting = () => {
    setShowGuidedFlow(false)
    setActiveSection('review')
  }

  const renderSidebarContent = () => {
    switch (activeSection) {
      case 'vision':
        return (
          <div className="p-4">
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

      case 'spiritual':
        return (
          <div className="p-4">
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
        )

      case 'review':
        return (
          <div className="p-4">
            <EnhancedWeeklyReview
              onBack={() => setActiveSection('schedule')}
              onNavigateToSection={(section) => setActiveSection(section)}
              weekData={weekData}
            />
          </div>
        )

      default:
        return null
    }
  }

  const renderMainContent = () => {
    if (['vision', 'spiritual', 'review'].includes(activeSection)) {
      return renderSidebarContent()
    }

    return (
      <WeeklyMeetingContent
        activeSection={activeSection}
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
    )
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      vision: 'bg-slate-50 border-slate-200 text-slate-700',
      spiritual: 'bg-slate-50 border-slate-200 text-slate-700',
      practical: 'bg-slate-50 border-slate-200 text-slate-700',
      review: 'bg-slate-50 border-slate-200 text-slate-700'
    }
    return colors[category as keyof typeof colors] || colors.practical
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Weekly Marriage Meeting</h1>
            <p className="text-sm text-gray-600">
              Week of {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleStartGuidedMeeting}
              variant="outline"
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Guided Meeting
            </Button>
            
            {isSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            
            <Button
              onClick={onSave}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Meeting Sections</h2>
            <p className="text-sm text-gray-600">Navigate between sections</p>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {/* Vision & Foundation Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Foundation
                </h3>
                {sidebarItems.filter(item => item.category === 'vision').map((item) => {
                  const IconComponent = item.icon
                  const isActive = activeSection === item.id
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-50 border-2 border-blue-200 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-slate-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">Vision & Mission</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Practical Planning Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Planning
                </h3>
                {sidebarItems.filter(item => item.category === 'practical').map((item) => {
                  const IconComponent = item.icon
                  const isActive = activeSection === item.id
                  const count = sectionCounts[item.id as keyof typeof sectionCounts] || 0
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-50 border-2 border-slate-200 text-slate-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-slate-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isActive ? 'text-slate-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">
                          {item.id === 'schedule' && 'Weekly planning'}
                          {item.id === 'goals' && 'Short & long-term goals'}
                          {item.id === 'todos' && 'Tasks & responsibilities'}
                          {item.id === 'grocery' && 'Shopping lists'}
                        </div>
                      </div>
                      {count > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Spiritual Growth Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Spiritual
                </h3>
                {sidebarItems.filter(item => item.category === 'spiritual').map((item) => {
                  const IconComponent = item.icon
                  const isActive = activeSection === item.id
                  const count = sectionCounts[item.id as keyof typeof sectionCounts] || 0
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-50 border-2 border-purple-200 text-purple-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-slate-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isActive ? 'text-purple-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">
                          {item.id === 'prayers' && 'Prayer requests & praise'}
                          {item.id === 'unconfessed' && 'Accountability & growth'}
                          {item.id === 'encouragement' && 'Love notes & encouragement'}
                        </div>
                      </div>
                      {count > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Review Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Review
                </h3>
                {sidebarItems.filter(item => item.category === 'review').map((item) => {
                  const IconComponent = item.icon
                  const isActive = activeSection === item.id
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-50 border-2 border-green-200 text-green-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-slate-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isActive ? 'text-green-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">Analytics & insights</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`} />
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Panel - Quick Insights & Spiritual Growth */}
        {!['vision', 'spiritual', 'review'].includes(activeSection) && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Quick Spiritual Check-in */}
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Quick Spiritual Check-in</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prayer streak:</span>
                    <span className="font-medium text-purple-600">12 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bible reading:</span>
                    <span className="font-medium text-blue-600">6/7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active prayers:</span>
                    <span className="font-medium text-green-600">3 requests</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveSection('spiritual')}
                  className="w-full mt-3 bg-slate-600 hover:bg-slate-700"
                >
                  View Spiritual Growth
                </Button>
              </Card>

              {/* Family Vision Quick View */}
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Family Vision</h3>
                </div>
                <p className="text-sm text-gray-700 mb-3 italic">
                  "Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose."
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">1-Year Goals:</span>
                    <span className="font-medium text-blue-600">3 active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Values lived:</span>
                    <span className="font-medium text-green-600">Faith, Love, Service</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveSection('vision')}
                  className="w-full mt-3 bg-slate-600 hover:bg-slate-700"
                >
                  View Full Vision
                </Button>
              </Card>

              {/* Week Progress */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Week Progress</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Tasks completed</span>
                      <span className="font-medium">5/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '71%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Goals progress</span>
                      <span className="font-medium">3/8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Meeting consistency</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveSection('review')}
                  className="w-full mt-3 bg-slate-600 hover:bg-slate-700"
                >
                  View Full Review
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSection('prayers')}
                    className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add Prayer Request
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSection('encouragement')}
                    className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Write Encouragement
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSection('todos')}
                    className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
