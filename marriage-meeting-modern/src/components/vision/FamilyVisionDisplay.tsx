import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Compass, Calendar, Target, Heart, Users, BookOpen, Star, Edit3, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface FamilyVision {
  id: string
  title: string
  statement: string
  values: string[]
  priorities: string[]
  year: number
  lastUpdated: string
}

interface QuarterlyTheme {
  id: string
  quarter: string
  year: number
  theme: string
  focus: string
  scripture: string
  color: string
  goals: string[]
  progress: number
}

interface AnnualGoal {
  id: string
  title: string
  category: 'marriage' | 'family' | 'spiritual' | 'financial' | 'personal' | 'health' | 'ministry' | 'career'
  progress: number
  status: 'not-started' | 'in-progress' | 'completed' | 'paused'
  priority: 'critical' | 'high' | 'medium' | 'low'
}

const categoryIcons = {
  marriage: Heart,
  family: Users,
  spiritual: BookOpen,
  financial: Target,
  personal: Star,
  health: TrendingUp,
  ministry: BookOpen,
  career: Target
}

const categoryColors = {
  marriage: 'from-pink-500 to-rose-500',
  family: 'from-blue-500 to-cyan-500',
  spiritual: 'from-purple-500 to-violet-500',
  financial: 'from-green-500 to-emerald-500',
  personal: 'from-orange-500 to-amber-500',
  health: 'from-red-500 to-pink-500',
  ministry: 'from-indigo-500 to-purple-500',
  career: 'from-slate-500 to-gray-500'
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

export const FamilyVisionDisplay: React.FC = () => {
  const [vision, setVision] = useState<FamilyVision | null>(null)
  const [quarterlyTheme, setQuarterlyTheme] = useState<QuarterlyTheme | null>(null)
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadFamilyVision()
  }, [])

  const loadFamilyVision = () => {
    // Mock data - in real app, load from API
    const mockVision: FamilyVision = {
      id: '1',
      title: 'Our Family Vision 2024',
      statement: 'To build a Christ-centered home that serves as a beacon of love, faith, and hope in our community, while raising children who know and love God.',
      values: ['Faith', 'Love', 'Integrity', 'Service', 'Growth', 'Unity'],
      priorities: ['Marriage', 'Children', 'Spiritual Growth', 'Community', 'Health', 'Ministry'],
      year: 2024,
      lastUpdated: '2024-01-15'
    }

    const mockQuarterlyTheme: QuarterlyTheme = {
      id: '1',
      quarter: 'Q1',
      year: 2024,
      theme: 'Foundation Building',
      focus: 'Establishing strong habits and routines that will carry us through the year',
      scripture: 'Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock. - Matthew 7:24',
      color: 'from-blue-500 to-cyan-500',
      goals: [
        'Establish weekly date nights',
        'Start daily family devotions',
        'Create consistent morning routines',
        'Set up financial planning system'
      ],
      progress: 65
    }

    const mockAnnualGoals: AnnualGoal[] = [
      {
        id: '1',
        title: 'Strengthen Our Marriage Foundation',
        category: 'marriage',
        progress: 35,
        status: 'in-progress',
        priority: 'critical'
      },
      {
        id: '2',
        title: 'Deepen Our Spiritual Walk',
        category: 'spiritual',
        progress: 20,
        status: 'in-progress',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Build Financial Security',
        category: 'financial',
        progress: 15,
        status: 'in-progress',
        priority: 'high'
      },
      {
        id: '4',
        title: 'Serve Our Community',
        category: 'ministry',
        progress: 5,
        status: 'not-started',
        priority: 'medium'
      }
    ]

    setVision(mockVision)
    setQuarterlyTheme(mockQuarterlyTheme)
    setAnnualGoals(mockAnnualGoals)
  }

  const getCurrentQuarter = () => {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    return `Q${quarter}`
  }

  const getOverallProgress = () => {
    if (annualGoals.length === 0) return 0
    return Math.round(annualGoals.reduce((sum, goal) => sum + goal.progress, 0) / annualGoals.length)
  }

  const getGoalsByStatus = (status: string) => {
    return annualGoals.filter(goal => goal.status === status).length
  }

  const overallProgress = getOverallProgress()
  const completedGoals = getGoalsByStatus('completed')
  const inProgressGoals = getGoalsByStatus('in-progress')

  return (
    <div className="space-y-6">
      {/* Main Vision Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className={`p-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{vision?.title || 'Our Family Vision'}</h1>
                  <p className="text-indigo-100">Last updated: {vision?.lastUpdated || 'Recently'}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="text-white border-white hover:bg-white hover:text-indigo-600"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Vision
              </Button>
            </div>
            
            <p className="text-xl leading-relaxed mb-8 max-w-4xl">
              {vision?.statement || 'Our family vision statement will appear here...'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Our Values
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vision?.values.map((value, index) => (
                    <span key={index} className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                      {value}
                    </span>
                  )) || (
                    <span className="text-indigo-200">Values will be displayed here</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Our Priorities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vision?.priorities.map((priority, index) => (
                    <span key={index} className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                      {priority}
                    </span>
                  )) || (
                    <span className="text-indigo-200">Priorities will be displayed here</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Current Quarter Focus */}
      {quarterlyTheme && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 bg-gradient-to-r ${quarterlyTheme.color} text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{quarterlyTheme.quarter} {quarterlyTheme.year}</h2>
                  <p className="text-sm opacity-90">Current Quarter Focus</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{quarterlyTheme.progress}%</div>
                <div className="text-sm opacity-90">Complete</div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{quarterlyTheme.theme}</h3>
            <p className="text-lg mb-4 opacity-90">{quarterlyTheme.focus}</p>
            
            {quarterlyTheme.scripture && (
              <blockquote className="text-sm italic mb-4 p-3 bg-white bg-opacity-10 rounded-lg">
                "{quarterlyTheme.scripture}"
              </blockquote>
            )}
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Quarterly Progress</span>
                <span>{quarterlyTheme.progress}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quarterlyTheme.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Quarterly Goals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quarterlyTheme.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 opacity-60" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Annual Goals Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Annual Goals Progress
            </h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
          
          {/* Progress Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{inProgressGoals}</div>
              <div className="text-sm text-blue-700">In Progress</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{annualGoals.length - completedGoals - inProgressGoals}</div>
              <div className="text-sm text-gray-700">Not Started</div>
            </div>
          </div>
          
          {/* Goals List */}
          <div className="space-y-4">
            {annualGoals.map((goal) => {
              const Icon = categoryIcons[goal.category]
              const colorClass = categoryColors[goal.category]
              const priorityClass = priorityColors[goal.priority]
              
              return (
                <div key={goal.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityClass}`}>
                        {goal.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{goal.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* Weekly Focus Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            This Week's Focus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">From Your Vision:</h4>
              <p className="text-sm text-gray-600">
                {quarterlyTheme?.focus || 'Focus on your quarterly theme and work toward your annual goals.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Action Items:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Review quarterly goals in weekly meeting</li>
                <li>• Set 2-3 specific actions for the week</li>
                <li>• Check progress on annual goals</li>
                <li>• Celebrate any completed milestones</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
