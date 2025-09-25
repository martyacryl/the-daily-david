import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { calendarService } from '../../lib/calendarService'
import { useAccentColor } from '../../hooks/useAccentColor'
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
  ArrowLeft,
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
import { FamilyCreedDisplay } from '../FamilyCreedDisplay'
import { FamilyVisionDisplay } from '../vision/FamilyVisionDisplay'
import { WeatherSection } from '../WeatherSection'

interface DailyFocusedLayoutProps {
  currentDate: Date
  weekData: any
  onUpdateWeekData: (data: any) => void
  onSave: () => void
  isSaving?: boolean
  className?: string
  initialSection?: string
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
  className = '',
  initialSection = 'vision'
}) => {
  const { getColor, accentColor } = useAccentColor()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Get the correct gradient classes based on accent color
  const getGradientClasses = () => {
    switch (accentColor) {
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-200 dark:from-green-900/30 dark:to-green-800/50'
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/50'
      case 'slate':
        return 'bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800/30 dark:to-slate-700/50'
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-200 dark:from-red-900/30 dark:to-red-800/50'
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/50'
      default: // purple
        return 'bg-gradient-to-br from-purple-50 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/50'
    }
  }
  const [activeSection, setActiveSection] = useState(initialSection)
  const [showGuidedFlow, setShowGuidedFlow] = useState(false)
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [showSpiritualModal, setShowSpiritualModal] = useState(false)

  // Check for section parameter in URL or use saved section from localStorage
  useEffect(() => {
    const sectionParam = searchParams.get('section')
    console.log('🎯 URL section parameter:', sectionParam)
    
    if (sectionParam) {
      console.log('🎯 URL section parameter found, setting activeSection to:', sectionParam)
      setActiveSection(sectionParam)
      // Only save non-vision sections to localStorage
      if (sectionParam !== 'vision') {
        localStorage.setItem('lastActiveSection', sectionParam)
      }
    } else {
      // No URL parameter, check localStorage for last active section
      const lastSection = localStorage.getItem('lastActiveSection')
      console.log('🎯 No URL parameter, checking localStorage:', lastSection)
      
      if (lastSection && lastSection !== 'vision') {
        console.log('🎯 Using saved section from localStorage:', lastSection)
        setActiveSection(lastSection)
      } else {
        // Default to vision if no saved section or if saved section is vision
        console.log('🎯 Defaulting to vision section')
        setActiveSection('vision')
      }
    }
  }, [searchParams])

  // Save active section to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    // Only save if we're not in the initial render cycle and not from URL parameter
    const sectionParam = searchParams.get('section')
    console.log('🎯 Second useEffect - activeSection:', activeSection, 'sectionParam:', sectionParam, 'initialSection:', initialSection)
    
    if (activeSection && activeSection !== 'vision' && activeSection !== initialSection && !sectionParam) {
      console.log('🎯 Saving activeSection to localStorage:', activeSection)
      localStorage.setItem('lastActiveSection', activeSection)
    }
  }, [activeSection, initialSection, searchParams])

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
      console.log('🎯 Rendering full content for special section:', activeSection)
      return renderSidebarContent()
    }

    // Handle vision section - show three-column layout like home page
    if (activeSection === 'vision') {
      console.log('🎯 Rendering three-column layout for vision section')
      return (
        <div className="h-full flex flex-col pt-20 sm:pt-24">
          {/* Top Section - Weekly Meeting Buttons */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 lg:p-4 sticky top-14 sm:top-16 z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Foundation & Daily Focus</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="sm:hidden">{currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  onClick={handleStartGuidedMeeting}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs sm:text-sm"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Guided Meeting</span>
                  <span className="sm:hidden">Meeting</span>
                </Button>
                
                {isSaving && (
                  <div className="flex items-center gap-1 sm:gap-2 text-blue-600">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Saving...</span>
                  </div>
                )}
                
                <Button
                  onClick={onSave}
                  size="sm"
                  className="bg-slate-600 hover:bg-slate-700 text-xs sm:text-sm"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Family Creed Section */}
          <div className="bg-slate-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 lg:p-4">
            <FamilyCreedDisplay />
          </div>

          {/* Three Column Layout */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column - Navigation Sidebar */}
            <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1">Meeting Sections</h2>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Navigate between sections</p>
              </div>

              {/* Sidebar Navigation */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  {/* Vision & Foundation Section */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-2">
                      Foundation
                    </h3>
                    {sidebarItems.filter(item => item.category === 'vision').map((item) => {
                      const IconComponent = item.icon
                      const isActive = activeSection === item.id
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'schedule') {
                              navigate('/weekly?section=schedule')
                            } else {
                              handleSectionChange(item.id)
                            }
                          }}
                          className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-left transition-all duration-200 ${
                            isActive
                              ? 'bg-slate-50 dark:bg-slate-700 border-2 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            isActive ? 'bg-slate-100 dark:bg-slate-700' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{item.label}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">Vision & Mission</div>
                          </div>
                          <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${
                            isActive ? 'rotate-90' : ''
                          }`} />
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Practical Planning Section */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-2">
                      Planning
                    </h3>
                    {sidebarItems.filter(item => item.category === 'practical').map((item) => {
                      const IconComponent = item.icon
                      const isActive = activeSection === item.id
                      const count = sectionCounts[item.id as keyof typeof sectionCounts] || 0
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'schedule') {
                              navigate('/weekly?section=schedule')
                            } else {
                              handleSectionChange(item.id)
                            }
                          }}
                          className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-left transition-all duration-200 ${
                            isActive
                              ? 'bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            isActive ? 'bg-slate-100 dark:bg-slate-700' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isActive ? 'text-slate-600 dark:text-slate-400' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{item.label}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              {item.id === 'schedule' && 'Weekly planning'}
                              {item.id === 'goals' && 'Short & long-term goals'}
                              {item.id === 'todos' && 'Tasks & responsibilities'}
                              {item.id === 'grocery' && 'Shopping lists'}
                            </div>
                          </div>
                          {count > 0 && (
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              isActive
                                ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                            }`}>
                              {count}
                            </span>
                          )}
                          <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${
                            isActive ? 'rotate-90' : ''
                          }`} />
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Spiritual Growth Section */}
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-2">
                      Spiritual
                    </h3>
                    {sidebarItems.filter(item => item.category === 'spiritual').map((item) => {
                      const IconComponent = item.icon
                      const isActive = activeSection === item.id
                      const count = sectionCounts[item.id as keyof typeof sectionCounts] || 0
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'schedule') {
                              navigate('/weekly?section=schedule')
                            } else {
                              handleSectionChange(item.id)
                            }
                          }}
                          className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-left transition-all duration-200 ${
                            isActive
                              ? `bg-slate-50 border-2 border-${getColor('border')} text-${getColor('text')}`
                              : 'hover:bg-gray-50 text-gray-700 dark:text-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            isActive ? 'bg-slate-100 dark:bg-slate-700' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isActive ? `text-${getColor('primary')} dark:text-${getColor('primary')}` : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{item.label}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              {item.id === 'prayers' && 'Prayer requests & praise'}
                              {item.id === 'unconfessed' && 'Accountability & growth'}
                              {item.id === 'encouragement' && 'Love notes & encouragement'}
                            </div>
                          </div>
                          {count > 0 && (
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              isActive
                                ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                            }`}>
                              {count}
                            </span>
                          )}
                          <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${
                            isActive ? 'rotate-90' : ''
                          }`} />
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Review Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-2">
                      Review
                    </h3>
                    {sidebarItems.filter(item => item.category === 'review').map((item) => {
                      const IconComponent = item.icon
                      const isActive = activeSection === item.id
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'schedule') {
                              navigate('/weekly?section=schedule')
                            } else {
                              handleSectionChange(item.id)
                            }
                          }}
                          className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg text-left transition-all duration-200 ${
                            isActive
                              ? 'bg-slate-50 border-2 border-green-200 text-green-700'
                              : 'hover:bg-gray-50 text-gray-700 dark:text-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            isActive ? 'bg-slate-100 dark:bg-slate-700' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{item.label}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">Analytics & insights</div>
                          </div>
                          <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${
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
                {/* Weather Section */}
                <WeatherSection />

                {/* Today's Schedule */}
                <Card className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/weekly?section=schedule')}
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
                      
                      // Get calendar events for today using the same logic as weekly schedule
                      const todayCalendarEvents = calendarService.getEventsForDay(weekData?.calendarEvents || [], today)
                      
                      return (
                        <div className="space-y-2">
                          {/* Calendar Events - same style as weekly schedule */}
                          {todayCalendarEvents.map((event, index) => (
                            <div key={`calendar-${index}`} className="flex gap-2 sm:gap-3 items-start">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                                  {calendarService.formatEventForDisplay(event)}
                                </div>
                                {event.location && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    📍 {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* Custom Schedule Items - same style as weekly schedule */}
                          {filteredSchedule.map((item, index) => (
                            <div key={`schedule-${index}`} className="flex gap-2 sm:gap-3 items-start">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                                  {item}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {todayCalendarEvents.length === 0 && filteredSchedule.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No schedule items or events for today</p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </Card>

                {/* Today's Tasks */}
                <Card className="p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Today's Tasks</h2>
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
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Week Overview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/weekly?section=schedule')}
                      className="text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit Week
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
            <div className="w-full lg:w-80 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-l border-gray-200 dark:border-gray-600 p-4 lg:p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Family Vision Quick View */}
                <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Family Vision</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 italic">
                    "Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose."
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">1-Year Goals:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">3 active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Values lived:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">Faith, Love, Service</span>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowVisionModal(true)}
                    className="w-full mt-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-400 text-white"
                  >
                    View Full Vision
                  </Button>
                </Card>

                {/* Spiritual Growth */}
                <Card className="p-3 lg:p-4 bg-white dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className={`w-4 h-4 lg:w-5 lg:h-5 text-${getColor('primary')} dark:text-${getColor('primary')}`} />
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Spiritual Growth</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Prayer requests:</span>
                      <span className={`font-medium text-${getColor('primary')} dark:text-${getColor('primary')}`}>3 active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Bible reading:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Day 15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Devotional streak:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">12 days</span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveSection('spiritual')
                      // Update URL to preserve state on refresh
                      const newSearchParams = new URLSearchParams(searchParams)
                      newSearchParams.set('section', 'spiritual')
                      navigate(`?${newSearchParams.toString()}`, { replace: true })
                    }}
                    className={`w-full mt-3 bg-${getColor('primary')} hover:bg-${getColor('primary')} dark:bg-${getColor('primary')} dark:hover:bg-${getColor('primary')}`}
                  >
                    View Spiritual Growth
                  </Button>
                </Card>

                {/* Today's Prayers */}
                <Card className="p-3 lg:p-4 bg-white dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-3">Today's Prayers</h3>
                  <div className="space-y-2">
                    {dailyPrayers.slice(0, 3).map((prayer, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-600">
                        <Heart className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{prayer.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveSection('spiritual')
                      // Navigate to prayer tab in spiritual section
                      navigate('/daily?section=spiritual&tab=prayer')
                    }}
                    className={`w-full mt-3 text-${getColor('primary')} dark:text-${getColor('primary')} border-${getColor('border')} dark:border-${getColor('border')} hover:bg-${getColor('secondary')} dark:hover:bg-${getColor('secondary')}`}
                  >
                    Add Prayer Request
                  </Button>
                </Card>

                {/* Quick Actions */}
                <Card className="p-3 lg:p-4 bg-white dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                      setActiveSection('spiritual')
                      // Navigate to prayer tab in spiritual section
                      navigate('/daily?section=spiritual&tab=prayer')
                    }}
                      className={`w-full text-${getColor('primary')} border-${getColor('border')} hover:bg-${getColor('secondary')}`}
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
      
      // For mobile, show a simplified version when coming from vision page
      const isMobile = window.innerWidth < 1024
      const isFromVision = searchParams.get('from') === 'vision'
      
      if (isMobile && isFromVision && activeSection === 'schedule') {
        return (
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSearchParams = new URLSearchParams(searchParams)
                    newSearchParams.delete('from')
                    newSearchParams.set('section', 'vision')
                    navigate(`?${newSearchParams.toString()}`, { replace: true })
                  }}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  ← Back
                </Button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Edit Schedule</h1>
              </div>
              <Button
                onClick={onSave}
                size="sm"
                className="bg-slate-600 hover:bg-slate-700"
              >
                Save
              </Button>
            </div>

            {/* Mobile Schedule Content */}
            <div className="flex-1 overflow-y-auto p-4">
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
            </div>
          </div>
        )
      }
      
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
        <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              Today's Overview
              <span className="text-sm font-normal text-gray-600 dark:text-gray-300">
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
                onClick={() => navigate('/weekly?section=schedule')}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Week
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Today's Schedule */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                Today's Schedule
              </h4>
              <div className="space-y-2">
                {(() => {
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                  const todayName = dayNames[currentDate.getDay()]
                  const todaySchedule = weekData.schedule?.[todayName as keyof typeof weekData.schedule] || []
                  const filteredSchedule = todaySchedule.filter(item => item && item.trim() !== '' && item !== '')
                  
                  // Get calendar events for today using the same logic as weekly schedule
                  const todayCalendarEvents = calendarService.getEventsForDay(weekData?.calendarEvents || [], currentDate)
                  
                  return (
                    <div className="space-y-2">
                      {/* Calendar Events - same style as weekly schedule */}
                      {todayCalendarEvents.map((event, index) => (
                        <div key={`calendar-${index}`} className="flex gap-2 sm:gap-3 items-start">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                              {calendarService.formatEventForDisplay(event)}
                            </div>
                            {event.location && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom Schedule Items - same style as weekly schedule */}
                      {filteredSchedule.map((item, index) => (
                        <div key={`schedule-${index}`} className="flex gap-2 sm:gap-3 items-start">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                              {item}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {todayCalendarEvents.length === 0 && filteredSchedule.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic p-3">No schedule items for today</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
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
                          task.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
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
        <Card className={`p-6 bg-gradient-to-r from-slate-50 ${getGradientClasses().replace('bg-gradient-to-br from-', 'to-').replace('50', '50')} border-2 border-slate-200`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Weather</h2>
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.icon)}
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{weather.temperature}°F</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Condition</div>
              <div className="font-semibold text-gray-900 dark:text-white">{weather.condition}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Feels Like</div>
              <div className="font-semibold text-gray-900 dark:text-white">{weather.feelsLike}°F</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Wind</div>
              <div className="font-semibold text-gray-900 dark:text-white">{weather.windSpeed} mph</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Humidity</div>
              <div className="font-semibold text-gray-900 dark:text-white">{weather.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/weekly?section=schedule')}
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
              
              // Get calendar events for today using the same logic as weekly schedule
              const todayCalendarEvents = calendarService.getEventsForDay(weekData?.calendarEvents || [], today)
              
              return (
                <div className="space-y-2">
                  {/* Calendar Events - same style as weekly schedule */}
                  {todayCalendarEvents.map((event, index) => (
                    <div key={`calendar-${index}`} className="flex gap-2 sm:gap-3 items-start">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                          {calendarService.formatEventForDisplay(event)}
                        </div>
                        {event.location && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            📍 {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Custom Schedule Items - same style as weekly schedule */}
                  {filteredSchedule.map((item, index) => (
                    <div key={`schedule-${index}`} className="flex gap-2 sm:gap-3 items-start">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                          {item}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {todayCalendarEvents.length === 0 && filteredSchedule.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No schedule items or events for today</p>
                  )}
                </div>
              )
            })()}
          </div>
        </Card>

        {/* Today's Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Tasks</h2>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Prayers</h2>
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
                      prayer.priority === 'high' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Week Overview</h2>
            <WeekOverview 
              weekData={weekData} 
              currentDate={currentDate}
            />
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Goals</h2>
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
                      <span className="font-medium text-gray-900 dark:text-white">{goal.text}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
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
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 ${getGradientClasses().replace('bg-gradient-to-br from-', 'to-').replace('50', '50')} dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="flex h-screen">
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

        {/* Right Panel - Quick Insights */}
        {!['vision', 'spiritual', 'review', 'schedule'].includes(activeSection) && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Quick Spiritual Check-in */}
              <Card className={`p-4 bg-gradient-to-br ${getGradientClasses().replace('bg-gradient-to-br from-', 'from-').replace('50', '50')} to-blue-50`}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className={`w-5 h-5 text-${getColor('primary')}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Quick Spiritual Check-in</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Prayer streak:</span>
                    <span className={`font-medium text-${getColor('primary')}`}>12 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Bible reading:</span>
                    <span className="font-medium text-blue-600">6/7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Active prayers:</span>
                    <span className="font-medium text-green-600">3 requests</span>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setActiveSection('spiritual')
                    // Update URL to preserve state on refresh
                    const newSearchParams = new URLSearchParams(searchParams)
                    newSearchParams.set('section', 'spiritual')
                    navigate(`?${newSearchParams.toString()}`, { replace: true })
                  }}
                  className={`w-full mt-3 bg-${getColor('primary')} hover:bg-${getColor('primary')} dark:bg-${getColor('primary')} dark:hover:bg-${getColor('primary')}`}
                >
                  View Spiritual Growth
                </Button>
              </Card>

              {/* Family Vision Quick View */}
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Family Vision</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 italic">
                  "Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose."
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">1-Year Goals:</span>
                    <span className="font-medium text-blue-600">3 active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Values lived:</span>
                    <span className="font-medium text-green-600">Faith, Love, Service</span>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowVisionModal(true)}
                  className={`w-full mt-3 bg-${getColor('primary')} hover:bg-${getColor('primary')} dark:bg-${getColor('primary')} dark:hover:bg-${getColor('primary')}`}
                >
                  View Full Vision
                </Button>
              </Card>

              {/* Week Progress */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Week Progress</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">Tasks completed</span>
                      <span className="font-medium">5/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '71%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">Goals progress</span>
                      <span className="font-medium">3/8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">Meeting consistency</span>
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
                  className={`w-full mt-3 bg-${getColor('primary')} hover:bg-${getColor('primary')} dark:bg-${getColor('primary')} dark:hover:bg-${getColor('primary')}`}
                >
                  View Full Review
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveSection('spiritual')
                      // Navigate to prayer tab in spiritual section
                      navigate('/daily?section=spiritual&tab=prayer')
                    }}
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-2">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Family Vision Board</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowVisionModal(false)}
                    className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
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
