import React, { useState, useEffect } from 'react'
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
  Eye,
  ChevronDown,
  ChevronUp,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  X
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { WeeklyMeetingContent } from '../WeeklyMeetingContent'
import { FamilyVisionBoard } from '../vision/FamilyVisionBoard'
import { SpiritualGrowthTracker } from '../spiritual/SpiritualGrowthTracker'
import { GuidedMeetingFlow } from '../meeting/GuidedMeetingFlow'
import { EnhancedWeeklyReview } from '../review/EnhancedWeeklyReview'
import { WeekOverview } from '../WeekOverview'

interface DailyFocusedLayoutProps {
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

// Mock weather data
const getWeatherData = () => ({
  temperature: 72,
  condition: 'Clear',
  feelsLike: 75,
  windSpeed: 5,
  humidity: 45,
  sunrise: '7:15am',
  sunset: '5:30pm',
  icon: 'sun'
})

// Mock daily tasks
const getDailyTasks = () => [
  { id: 1, text: 'Plan date night details', completed: true },
  { id: 2, text: 'Buy groceries for dinner', completed: true },
  { id: 3, text: 'Call mom about weekend', completed: false },
  { id: 4, text: 'Schedule car maintenance', completed: false },
  { id: 5, text: 'Review Bible study lesson', completed: false }
]

// Mock daily prayers
const getDailyPrayers = () => [
  { id: 1, text: 'Wisdom in parenting decisions', category: 'family', priority: 'high' },
  { id: 2, text: 'Healing for grandmother', category: 'health', priority: 'high' },
  { id: 3, text: 'Work-life balance', category: 'work', priority: 'medium' }
]


export const DailyFocusedLayout: React.FC<DailyFocusedLayoutProps> = ({
  currentDate,
  weekData,
  onUpdateWeekData,
  onSave,
  isSaving = false,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState('vision')
  const [showGuidedFlow, setShowGuidedFlow] = useState(false)
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [showSpiritualModal, setShowSpiritualModal] = useState(false)

  const weather = getWeatherData()
  const dailyTasks = getDailyTasks()
  const dailyPrayers = getDailyPrayers() // Force rebuild

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
    console.log('🔄 Section changing from', activeSection, 'to', section)
    setActiveSection(section)
  }

  const handleStartGuidedMeeting = () => {
    setShowGuidedFlow(true)
  }

  const handleCompleteGuidedMeeting = () => {
    setShowGuidedFlow(false)
    setActiveSection('review')
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sun': return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloud': return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rain': return <CloudRain className="w-6 h-6 text-blue-500" />
      default: return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const renderSidebarContent = () => {
    switch (activeSection) {
      case 'vision':
        return (
          <div className="p-4">
            <FamilyVisionBoard />
          </div>
        )

      case 'spiritual':
        return (
          <div className="p-4">
            <SpiritualGrowthTracker
              onBackToVision={() => setActiveSection('vision')}
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
    console.log('🎯 renderMainContent called with activeSection:', activeSection)
    
    // Handle special sections (spiritual, review) - these show their respective content
    if (['spiritual', 'review'].includes(activeSection)) {
      console.log('🎯 Rendering sidebar content for special section:', activeSection)
      return renderSidebarContent()
    }

    // Handle vision section - show three-column layout like home page
    if (activeSection === 'vision') {
      console.log('🎯 Rendering three-column layout for vision section')
      return (
        <div className="h-full flex flex-col">
          {/* Top Section - Weekly Meeting Buttons */}
          <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Foundation & Daily Focus</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
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

          {/* Three Column Layout */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column - Navigation Sidebar */}
            <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
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

            {/* Middle Column - Daily Focus & Weekly Overview */}
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Today's Schedule */}
                <Card className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900">Today's Schedule</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection('schedule')}
                      className="text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Schedule
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(() => {
                      const today = new Date()
                      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                      const todayName = dayNames[today.getDay()]
                      const todaySchedule = weekData?.schedule?.[todayName] || []
                      const filteredSchedule = todaySchedule.filter((item: any) => item && item.trim() !== '')
                      
                      return filteredSchedule.length > 0 ? (
                        filteredSchedule.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <Clock className="w-4 h-4 text-slate-600" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic text-center py-4">No schedule items for today</p>
                      )
                    })()}
                  </div>
                </Card>

                {/* Today's Tasks */}
                <Card className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900">Today's Tasks</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection('todos')}
                      className="text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Task
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(() => {
                      const today = new Date()
                      const todayTasks = (weekData?.todos || []).filter((task: any) => {
                        if (task.dueDate) {
                          const dueDate = new Date(task.dueDate)
                          return dueDate.toDateString() === today.toDateString() || dueDate < today
                        }
                        return task.priority === 'high'
                      }).slice(0, 5)
                      
                      return todayTasks.length > 0 ? (
                        todayTasks.map((task: any) => (
                          <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <button className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              task.completed
                                ? 'bg-slate-500 border-slate-500 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}>
                              {task.completed && <span className="text-xs">✓</span>}
                            </button>
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.text}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic text-center py-4">No tasks for today</p>
                      )
                    })()}
                  </div>
                </Card>

                {/* Week Overview with Popup */}
                <Card className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900">Week Overview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/weekly'}
                      className="text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Day
                    </Button>
                  </div>
                  
                  <WeekOverview 
                    weekData={weekData} 
                    currentDate={currentDate} 
                  />
                </Card>
              </div>
            </div>

            {/* Right Column - Vision & Spiritual Content */}
            <div className="w-full lg:w-80 bg-gradient-to-br from-purple-50 to-indigo-50 border-l border-gray-200 p-4 lg:p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Family Vision */}
                <Card className="p-3 lg:p-4 bg-white/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900">Family Vision</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Mission Statement:</p>
                      <p className="italic">"Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose."</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Core values:</span>
                      <span className="font-medium text-blue-600">Faith, Love, Service</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => setShowVisionModal(true)}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                  >
                    View Full Vision
                  </Button>
                </Card>

                {/* Spiritual Growth */}
                <Card className="p-3 lg:p-4 bg-white/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900">Spiritual Growth</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Prayer requests:</span>
                      <span className="font-medium text-purple-600">3 active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bible reading:</span>
                      <span className="font-medium text-green-600">Day 15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Devotional streak:</span>
                      <span className="font-medium text-blue-600">12 days</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => setActiveSection('spiritual')}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                  >
                    View Spiritual Growth
                  </Button>
                </Card>

                {/* Today's Prayers */}
                <Card className="p-3 lg:p-4 bg-white/70 backdrop-blur-sm">
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-3">Today's Prayers</h3>
                  <div className="space-y-2">
                    {dailyPrayers.slice(0, 3).map((prayer, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-gray-700">{prayer.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSection('prayers')}
                    className="w-full mt-3 text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    Add Prayer Request
                  </Button>
                </Card>

                {/* Quick Actions */}
                <Card className="p-3 lg:p-4 bg-white/70 backdrop-blur-sm">
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveSection('prayers')}
                      className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      Add Prayer Request
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveSection('todos')}
                      className="w-full text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      Add Task
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveSection('goals')}
                      className="w-full text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      Set Goals
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Handle practical sections using WeeklyMeetingContent
    if (['schedule', 'todos', 'goals', 'grocery', 'prayers', 'unconfessed', 'encouragement'].includes(activeSection)) {
      console.log('🎯 Rendering WeeklyMeetingContent for practical section:', activeSection)
      return (
        <WeeklyMeetingContent
          activeSection={activeSection}
          currentDate={currentDate}
          weekData={weekData}
          onUpdateSchedule={onUpdateWeekData}
          onAddScheduleLine={(day, line) => {
            const updatedData = { ...weekData }
            if (!updatedData.schedule) updatedData.schedule = {}
            if (!updatedData.schedule[day]) updatedData.schedule[day] = []
            updatedData.schedule[day].push(line)
            onUpdateWeekData(updatedData)
          }}
          onRemoveScheduleLine={(day, index) => {
            const updatedData = { ...weekData }
            if (updatedData.schedule?.[day]) {
              updatedData.schedule[day].splice(index, 1)
              onUpdateWeekData(updatedData)
            }
          }}
          onUpdateListItem={(type, items) => {
            const updatedData = { ...weekData }
            updatedData[type] = items
            onUpdateWeekData(updatedData)
          }}
          onAddListItem={(type, item) => {
            const updatedData = { ...weekData }
            if (!updatedData[type]) updatedData[type] = []
            updatedData[type].push(item)
            onUpdateWeekData(updatedData)
          }}
          onToggleListItem={(type, id) => {
            const updatedData = { ...weekData }
            if (updatedData[type]) {
              const item = updatedData[type].find((item: any) => item.id === id)
              if (item) {
                item.completed = !item.completed
                onUpdateWeekData(updatedData)
              }
            }
          }}
          onRemoveListItem={(type, id) => {
            const updatedData = { ...weekData }
            if (updatedData[type]) {
              updatedData[type] = updatedData[type].filter((item: any) => item.id !== id)
              onUpdateWeekData(updatedData)
            }
          }}
          onUpdateTasks={(tasks) => {
            const updatedData = { ...weekData, todos: tasks }
            onUpdateWeekData(updatedData)
          }}
          onUpdateGrocery={(grocery) => {
            const updatedData = { ...weekData, grocery }
            onUpdateWeekData(updatedData)
          }}
          onUpdateEncouragementNotes={(notes) => {
            const updatedData = { ...weekData, encouragementNotes: notes }
            onUpdateWeekData(updatedData)
          }}
          onSave={onSave}
          isSaving={isSaving}
        />
      )
    }

    // Default daily overview
    return (
      <div className="space-y-6">
        {/* Today's Overview - Like Dashboard */}
        <Card className="p-4 sm:p-6 bg-white shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              Today's Overview
              <span className="text-sm font-normal text-gray-600">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </h3>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="relative">
                <WeekOverview 
                  weekData={weekData} 
                  currentDate={currentDate}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/weekly'}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Day
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Today's Schedule */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Today's Schedule
              </h4>
              <div className="space-y-2">
                {(() => {
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                  const todayName = dayNames[currentDate.getDay()]
                  const todaySchedule = weekData.schedule?.[todayName as keyof typeof weekData.schedule] || []
                  const filteredSchedule = todaySchedule.filter(item => item && item.trim() !== '' && item !== '')
                  
                  return filteredSchedule.length > 0 ? (
                    filteredSchedule.map((item, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-slate-100 rounded-xl border-l-4 border-slate-400">
                        <span className="text-sm sm:text-base text-slate-800 font-medium">{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic p-3">No schedule items for today</p>
                  )
                })()}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-600" />
                Today's Tasks
              </h4>
              <div className="space-y-2">
                {(() => {
                  const todayTasks = (weekData?.todos || []).filter((todo: any) => !todo.completed).slice(0, 5)
                  
                  return todayTasks.length > 0 ? (
                    todayTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckSquare className={`w-4 h-4 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.text}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.completed ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {task.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic p-3">No tasks for today</p>
                  )
                })()}
              </div>
            </div>
          </div>
        </Card>

        {/* Weather Section */}
        <Card className="p-6 bg-gradient-to-r from-slate-50 to-purple-50 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Weather</h2>
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.icon)}
              <span className="text-3xl font-bold text-gray-900">{weather.temperature}°F</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Condition</div>
              <div className="font-semibold text-gray-900">{weather.condition}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Feels Like</div>
              <div className="font-semibold text-gray-900">{weather.feelsLike}°F</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Wind</div>
              <div className="font-semibold text-gray-900">{weather.windSpeed} mph</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Humidity</div>
              <div className="font-semibold text-gray-900">{weather.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Sunrise className="w-4 h-4" />
              <span>Sunrise: {weather.sunrise}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-4 h-4" />
              <span>Sunset: {weather.sunset}</span>
            </div>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('schedule')}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit Schedule
            </Button>
          </div>
          
          <div className="space-y-3">
            {(() => {
              const today = new Date()
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
              const todayName = dayNames[today.getDay()]
              const todaySchedule = weekData?.schedule?.[todayName] || []
              const filteredSchedule = todaySchedule.filter((item: any) => item && item.trim() !== '')
              
              return filteredSchedule.length > 0 ? (
                filteredSchedule.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No schedule items for today</p>
              )
            })()}
          </div>
        </Card>

        {/* Today's Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('todos')}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
          
          <div className="space-y-3">
            {(() => {
              const today = new Date()
              const todayTasks = (weekData?.todos || []).filter((task: any) => {
                if (task.dueDate) {
                  const dueDate = new Date(task.dueDate)
                  return dueDate.toDateString() === today.toDateString() || dueDate < today
                }
                return task.priority === 'high'
              }).slice(0, 5)
              
              return todayTasks.length > 0 ? (
                todayTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <button className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed
                        ? 'bg-slate-500 border-slate-500 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {task.completed && <span className="text-xs">✓</span>}
                    </button>
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.text}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No tasks for today</p>
              )
            })()}
          </div>
        </Card>

        {/* Today's Prayers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Prayers</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('prayers')}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Prayer
            </Button>
          </div>
          
          <div className="space-y-3">
            {(() => {
              const todayPrayers = (weekData?.prayers || []).filter((prayer: any) => !prayer.completed).slice(0, 3)
              
              return todayPrayers.length > 0 ? (
                todayPrayers.map((prayer: any) => (
                  <div key={prayer.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Heart className="w-4 h-4 text-slate-600" />
                    <span className="flex-1 text-gray-800">{prayer.text}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prayer.priority === 'high' ? 'bg-slate-100 text-slate-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {prayer.priority}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No prayers for today</p>
              )
            })()}
          </div>
        </Card>

        {/* Week Overview with Click-to-Expand Functionality */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Week Overview</h2>
            <WeekOverview 
              weekData={weekData} 
              currentDate={currentDate}
            />
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Weekly Goals</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('goals')}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit Goals
            </Button>
          </div>
          
          <div className="space-y-4">
            {(() => {
              const weeklyGoals = (weekData?.goals || []).slice(0, 3)
              
              return weeklyGoals.length > 0 ? (
                weeklyGoals.map((goal: any) => (
                  <div key={goal.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{goal.text}</span>
                      <span className="text-sm text-gray-600">
                        {goal.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-slate-500 h-2 rounded-full" 
                        style={{ width: goal.completed ? '100%' : '50%' }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No weekly goals set</p>
              )
            })()}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Focused Meeting</h1>
            <p className="text-sm text-gray-600">
              {currentDate.toLocaleDateString('en-US', { 
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
              variant="default"
              onClick={onSave}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
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

        {/* Right Panel - Quick Insights */}
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
                  variant="default"
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
                  variant="default"
                  size="sm"
                  onClick={() => setShowVisionModal(true)}
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
                  variant="default"
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
                    className="w-full justify-start text-pink-600 border-pink-200 hover:bg-slate-50"
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

      {/* Vision Modal */}
      <AnimatePresence>
        {showVisionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVisionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Family Vision Board</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowVisionModal(false)}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </div>
                <FamilyVisionBoard />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
