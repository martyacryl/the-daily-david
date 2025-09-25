import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Heart, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  Users,
  Clock,
  Star,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Edit3,
  Eye,
  ArrowRight,
  Flame,
  BookOpen,
  MessageCircle,
  Home,
  BarChart3
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface EnhancedWeeklyReviewProps {
  onBack: () => void
  onNavigateToSection?: (section: string) => void
  weekData?: any
  className?: string
}

interface ReviewInsights {
  weekSummary: string
  accomplishments: string[]
  growthAreas: string[]
  encouragement: string
  prayerHighlights: string[]
  goalProgress: {
    completed: number
    total: number
    percentage: number
  }
  taskCompletion: {
    completed: number
    total: number
    percentage: number
  }
  spiritualGrowth: {
    prayersShared: number
    bibleReadingDays: number
    devotionalStreak: number
    spiritualGoalsMet: number
  }
  familyConnection: {
    dateNights: number
    familyActivities: number
    qualityTimeHours: number
    appreciationNotes: number
  }
  consistencyScore: number
  meetingStreak: number
  topPriorities: string[]
  nextWeekFocus: string[]
  visionAlignment: {
    missionCheck: boolean
    valuesLived: string[]
    longTermProgress: number
  }
}

export const EnhancedWeeklyReview: React.FC<EnhancedWeeklyReviewProps> = ({ 
  onBack, 
  onNavigateToSection,
  weekData,
  className = ''
}) => {
  const [insights, setInsights] = useState<ReviewInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState<string | null>(null)

  useEffect(() => {
    generateInsights()
  }, [weekData])

  const generateInsights = () => {
    // Simulate data processing
    setTimeout(() => {
      const mockInsights: ReviewInsights = {
        weekSummary: "This week, you both showed incredible dedication to your marriage meeting routine and spiritual growth. You accomplished 3 key milestones: completed 5 tasks together, shared 4 prayer requests, and maintained your devotional streak. Your spiritual connection was strengthened through daily prayer and Bible reading. There are opportunities to grow in 2 areas: increasing family activities and setting more specific long-term goals, which shows your commitment to continuous improvement. Your intentional approach to marriage is building a strong foundation for your future together.",
        accomplishments: [
          "Completed 5 tasks together",
          "Shared 4 prayer requests",
          "Maintained 12-day devotional streak",
          "Had 2 meaningful date nights",
          "Set 3 new family goals"
        ],
        growthAreas: [
          "Consider planning more family activities together",
          "Set more specific long-term vision goals",
          "Increase weekly quality time by 2 hours"
        ],
        encouragement: "Your commitment to regular meetings and spiritual growth shows incredible dedication to your relationship! Every conversation, every prayer, every goal shared brings you closer together. Keep going! 🌟",
        prayerHighlights: [
          "Wisdom in parenting decisions",
          "Healing for grandmother",
          "Work-life balance"
        ],
        goalProgress: {
          completed: 3,
          total: 8,
          percentage: 38
        },
        taskCompletion: {
          completed: 5,
          total: 7,
          percentage: 71
        },
        spiritualGrowth: {
          prayersShared: 4,
          bibleReadingDays: 6,
          devotionalStreak: 12,
          spiritualGoalsMet: 2
        },
        familyConnection: {
          dateNights: 2,
          familyActivities: 3,
          qualityTimeHours: 8,
          appreciationNotes: 5
        },
        consistencyScore: 85,
        meetingStreak: 4,
        topPriorities: [
          "Complete family Bible study",
          "Plan weekend family outing",
          "Review financial goals"
        ],
        nextWeekFocus: [
          "Maintain excellent meeting consistency",
          "Plan more family activities",
          "Set specific long-term goals"
        ],
        visionAlignment: {
          missionCheck: true,
          valuesLived: ['Faith', 'Love', 'Service'],
          longTermProgress: 45
        }
      }
      
      setInsights(mockInsights)
      setIsLoading(false)
    }, 1000)
  }

  const getSectionButton = (section: string, label: string, icon: React.ReactNode, variant: 'primary' | 'outline' = 'outline') => (
    <Button
      variant={variant}
      size="sm"
      onClick={() => onNavigateToSection?.(section)}
      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
    >
      {icon}
      <span className="hidden xs:inline">{label}</span>
      <span className="xs:hidden">{label.split(' ')[0]}</span>
      <ArrowRight className="w-3 h-3 flex-shrink-0" />
    </Button>
  )

  const getMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string, onClick?: () => void) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        activeMetric === title.toLowerCase().replace(/\s+/g, '-')
          ? `border-${color}-400 bg-${color}-50`
          : `border-${color}-200 bg-white hover:bg-${color}-50`
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          {icon}
        </div>
        <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 pt-32 sm:pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating your enhanced weekly review...</p>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-slate-100 pt-32 sm:pt-20 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h2>
          <p className="text-gray-600 mb-6">Start using your weekly meetings to see your enhanced review!</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-slate-100 pt-32 sm:pt-20 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Weekly Review</h1>
            <p className="text-gray-600">Comprehensive insights into your family's growth and progress</p>
          </div>
        </div>

        {/* Week Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-8 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Star className="w-6 h-6 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Week Summary</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">{insights.weekSummary}</p>
          </Card>
        </motion.div>

        {/* Key Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Key Metrics Dashboard</h3>
              <div className="flex gap-2">
                {getSectionButton('foundation', 'View Vision', <Home className="w-4 h-4" />)}
                {getSectionButton('planning', 'View Planning', <Calendar className="w-4 h-4" />)}
                {getSectionButton('connection', 'View Connection', <Heart className="w-4 h-4" />)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getMetricCard(
                "Goal Progress",
                `${insights.goalProgress.percentage}%`,
                `${insights.goalProgress.completed} of ${insights.goalProgress.total} goals`,
                <Target className="w-5 h-5 text-green-600" />,
                "green",
                () => setActiveMetric(activeMetric === 'goal-progress' ? null : 'goal-progress')
              )}
              
              {getMetricCard(
                "Task Completion",
                `${insights.taskCompletion.percentage}%`,
                `${insights.taskCompletion.completed} of ${insights.taskCompletion.total} tasks`,
                <CheckCircle className="w-5 h-5 text-blue-600" />,
                "blue",
                () => setActiveMetric(activeMetric === 'task-completion' ? null : 'task-completion')
              )}
              
              {getMetricCard(
                "Spiritual Growth",
                `${insights.spiritualGrowth.devotionalStreak} days`,
                `${insights.spiritualGrowth.prayersShared} prayers shared`,
                <BookOpen className="w-5 h-5 text-purple-600" />,
                "purple",
                () => setActiveMetric(activeMetric === 'spiritual-growth' ? null : 'spiritual-growth')
              )}
              
              {getMetricCard(
                "Family Connection",
                `${insights.familyConnection.qualityTimeHours} hours`,
                `${insights.familyConnection.dateNights} date nights`,
                <Users className="w-5 h-5 text-pink-600" />,
                "pink",
                () => setActiveMetric(activeMetric === 'family-connection' ? null : 'family-connection')
              )}
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {/* Accomplishments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <Card className="p-4 sm:p-6 flex-1 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Accomplishments</h3>
                </div>
                {insights.accomplishments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getSectionButton('planning', 'View Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />, 'primary')}
                    {getSectionButton('foundation', 'View Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />, 'primary')}
                    {getSectionButton('connection', 'View Prayers', <Heart className="w-3 h-3 sm:w-4 sm:h-4" />, 'primary')}
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:space-y-3">
                {insights.accomplishments.map((accomplishment, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{accomplishment}</span>
                  </div>
                ))}
                {insights.accomplishments.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-500 italic mb-4">No specific accomplishments recorded this week</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getSectionButton('planning', 'Add Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />)}
                      {getSectionButton('foundation', 'Set Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Growth Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col"
          >
            <Card className="p-4 sm:p-6 flex-1 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Growth Opportunities</h3>
                </div>
                {insights.growthAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getSectionButton('planning', 'Improve Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    {getSectionButton('foundation', 'Refine Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    {getSectionButton('connection', 'Add Prayers', <Heart className="w-3 h-3 sm:w-4 sm:h-4" />)}
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:space-y-3">
                {insights.growthAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{area}</span>
                  </div>
                ))}
                {insights.growthAreas.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-500 italic mb-4">You're doing great! Keep up the excellent work</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getSectionButton('planning', 'View Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />)}
                      {getSectionButton('foundation', 'Set Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Spiritual Growth Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Spiritual Growth</h3>
              </div>
              <div className="flex gap-2">
                {getSectionButton('connection', 'View Spiritual', <BookOpen className="w-4 h-4" />)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Prayers Shared</h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  {insights.spiritualGrowth.prayersShared}
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Bible Reading</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {insights.spiritualGrowth.bibleReadingDays}
                </p>
                <p className="text-sm text-gray-600">Days this week</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Devotional Streak</h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {insights.spiritualGrowth.devotionalStreak}
                </p>
                <p className="text-sm text-gray-600">Days in a row</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Spiritual Goals</h4>
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {insights.spiritualGrowth.spiritualGoalsMet}
                </p>
                <p className="text-sm text-gray-600">Goals met this week</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Family Connection Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Family Connection</h3>
              </div>
              <div className="flex gap-2">
                {getSectionButton('connection', 'View Family', <Users className="w-4 h-4" />)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Date Nights</h4>
                <p className="text-2xl font-bold text-pink-600 mb-1">
                  {insights.familyConnection.dateNights}
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Family Activities</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {insights.familyConnection.familyActivities}
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Quality Time</h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {insights.familyConnection.qualityTimeHours}h
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Appreciation Notes</h4>
                <p className="text-2xl font-bold text-yellow-600 mb-1">
                  {insights.familyConnection.appreciationNotes}
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Vision Alignment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Home className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Vision Alignment</h3>
              </div>
              <div className="flex gap-2">
                {getSectionButton('foundation', 'View Vision', <Home className="w-4 h-4" />)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  insights.visionAlignment.missionCheck ? 'bg-slate-100' : 'bg-slate-100'
                }`}>
                  <CheckCircle className={`w-8 h-8 ${
                    insights.visionAlignment.missionCheck ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Mission Check</h4>
                <p className={`text-sm font-medium ${
                  insights.visionAlignment.missionCheck ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insights.visionAlignment.missionCheck ? 'Aligned' : 'Needs Attention'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Values Lived</h4>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {insights.visionAlignment.valuesLived.length}
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Long-term Progress</h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  {insights.visionAlignment.longTermProgress}%
                </p>
                <p className="text-sm text-gray-600">Overall progress</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Encouragement & Next Week Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Encouragement</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">{insights.encouragement}</p>
            </Card>
          </motion.div>

          {/* Next Week Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Next Week Focus</h3>
              </div>
              <div className="space-y-2">
                {insights.nextWeekFocus.map((focus, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-gray-700">{focus}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
