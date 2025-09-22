import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, CheckCircle, TrendingUp, Users, Heart, Home, DollarSign, BookOpen, Zap, ArrowRight, Plus, Edit3, Trash2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface QuarterlyGoal {
  id: string
  category: 'marriage' | 'family' | 'spiritual' | 'financial' | 'personal' | 'health'
  title: string
  description: string
  targetDate: string
  progress: number
  milestones: string[]
  completedMilestones: string[]
  priority: 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed' | 'paused'
}

interface QuarterlyTheme {
  id: string
  quarter: string
  year: number
  theme: string
  focus: string
  scripture: string
  color: string
}

const categoryIcons = {
  marriage: Heart,
  family: Users,
  spiritual: BookOpen,
  financial: DollarSign,
  personal: Zap,
  health: TrendingUp
}

const categoryColors = {
  marriage: 'from-slate-600 to-slate-700',
  family: 'from-slate-500 to-slate-600',
  spiritual: 'from-purple-600 to-purple-700',
  financial: 'from-slate-700 to-slate-800',
  personal: 'from-purple-500 to-purple-600',
  health: 'from-slate-600 to-purple-600'
}

const priorityColors = {
  high: 'bg-slate-100 text-slate-800 border-slate-300',
  medium: 'bg-purple-100 text-purple-800 border-purple-300',
  low: 'bg-slate-50 text-slate-600 border-slate-200'
}

export const QuarterlyPlanning: React.FC = () => {
  const [goals, setGoals] = useState<QuarterlyGoal[]>([])
  const [themes, setThemes] = useState<QuarterlyTheme[]>([])
  const [currentQuarter, setCurrentQuarter] = useState('')
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isAddingTheme, setIsAddingTheme] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<QuarterlyGoal>>({
    category: 'marriage',
    priority: 'medium',
    status: 'not-started',
    progress: 0,
    milestones: [],
    completedMilestones: []
  })
  const [newTheme, setNewTheme] = useState<Partial<QuarterlyTheme>>({
    quarter: currentQuarter,
    year: new Date().getFullYear(),
    color: 'from-blue-500 to-cyan-500'
  })

  useEffect(() => {
    // Initialize current quarter
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    setCurrentQuarter(`Q${quarter}`)
    setNewTheme(prev => ({ ...prev, quarter: `Q${quarter}` }))
    
    // Load existing data (in real app, this would come from API)
    loadQuarterlyData()
  }, [])

  const loadQuarterlyData = () => {
    // Mock data - in real app, load from API
    const mockGoals: QuarterlyGoal[] = [
      {
        id: '1',
        category: 'marriage',
        title: 'Weekly Date Nights',
        description: 'Establish consistent weekly date nights to strengthen our relationship',
        targetDate: '2024-03-31',
        progress: 60,
        milestones: ['Plan 12 date nights', 'Try 3 new activities', 'Create date night budget'],
        completedMilestones: ['Plan 12 date nights', 'Try 3 new activities'],
        priority: 'high',
        status: 'in-progress'
      },
      {
        id: '2',
        category: 'spiritual',
        title: 'Daily Devotion Together',
        description: 'Read and discuss scripture together every morning',
        targetDate: '2024-03-31',
        progress: 80,
        milestones: ['Choose devotional book', 'Set morning routine', 'Track consistency'],
        completedMilestones: ['Choose devotional book', 'Set morning routine', 'Track consistency'],
        priority: 'high',
        status: 'in-progress'
      }
    ]

    const mockThemes: QuarterlyTheme[] = [
      {
        id: '1',
        quarter: 'Q1',
        year: 2024,
        theme: 'Foundation Building',
        focus: 'Establishing strong habits and routines',
        scripture: 'Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock. - Matthew 7:24',
        color: 'from-blue-500 to-cyan-500'
      }
    ]

    setGoals(mockGoals)
    setThemes(mockThemes)
  }

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.description) return

    const goal: QuarterlyGoal = {
      id: Date.now().toString(),
      category: newGoal.category || 'marriage',
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate || '',
      progress: 0,
      milestones: newGoal.milestones || [],
      completedMilestones: [],
      priority: newGoal.priority || 'medium',
      status: 'not-started'
    }

    setGoals([...goals, goal])
    setNewGoal({
      category: 'marriage',
      priority: 'medium',
      status: 'not-started',
      progress: 0,
      milestones: [],
      completedMilestones: []
    })
    setIsAddingGoal(false)
  }

  const handleAddTheme = () => {
    if (!newTheme.theme || !newTheme.focus) return

    const theme: QuarterlyTheme = {
      id: Date.now().toString(),
      quarter: newTheme.quarter || currentQuarter,
      year: newTheme.year || new Date().getFullYear(),
      theme: newTheme.theme,
      focus: newTheme.focus,
      scripture: newTheme.scripture || '',
      color: newTheme.color || 'from-blue-500 to-cyan-500'
    }

    setThemes([...themes, theme])
    setNewTheme({
      quarter: currentQuarter,
      year: new Date().getFullYear(),
      color: 'from-blue-500 to-cyan-500'
    })
    setIsAddingTheme(false)
  }

  const handleUpdateProgress = (goalId: string, progress: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress, status: progress === 100 ? 'completed' : 'in-progress' }
        : goal
    ))
  }

  const handleToggleMilestone = (goalId: string, milestone: string) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal
      
      const isCompleted = goal.completedMilestones.includes(milestone)
      const completedMilestones = isCompleted
        ? goal.completedMilestones.filter(m => m !== milestone)
        : [...goal.completedMilestones, milestone]
      
      const progress = Math.round((completedMilestones.length / goal.milestones.length) * 100)
      
      return {
        ...goal,
        completedMilestones,
        progress,
        status: progress === 100 ? 'completed' : 'in-progress'
      }
    }))
  }

  const getQuarterlyStats = () => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const inProgressGoals = goals.filter(g => g.status === 'in-progress').length
    const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals) : 0

    return { totalGoals, completedGoals, inProgressGoals, avgProgress }
  }

  const stats = getQuarterlyStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quarterly Planning</h1>
        <p className="text-lg text-gray-600 mb-6">
          Set 3-month goals and themes to guide your weekly meetings
        </p>
        
        {/* Current Quarter Theme */}
        {themes.length > 0 && (
          <Card className={`p-6 bg-gradient-to-r from-slate-600 to-purple-600 text-white mb-6 relative overflow-hidden`}>
          {/* Background Pattern - Mountain Outlines */}
          <div className="absolute inset-0 opacity-5">
            <svg className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16" viewBox="0 0 100 100" fill="none">
              <path d="M10 80 L25 60 L40 70 L55 45 L70 55 L85 35 L90 80 Z" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </svg>
            <svg className="absolute bottom-0 left-0 w-24 h-24 translate-y-12 -translate-x-12" viewBox="0 0 100 100" fill="none">
              <path d="M15 70 L30 50 L45 60 L60 35 L75 45 L85 70 Z" stroke="currentColor" strokeWidth="0.4" fill="none"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">{themes[0].theme}</h2>
            <p className="text-lg mb-3">{themes[0].focus}</p>
            {themes[0].scripture && (
              <p className="text-sm italic opacity-90">"{themes[0].scripture}"</p>
            )}
          </div>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalGoals}</h3>
          <p className="text-sm text-gray-600">Total Goals</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.completedGoals}</h3>
          <p className="text-sm text-gray-600">Completed</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.inProgressGoals}</h3>
          <p className="text-sm text-gray-600">In Progress</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</h3>
          <p className="text-sm text-gray-600">Avg Progress</p>
        </Card>
      </div>

      {/* Goals Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Quarterly Goals</h2>
          <Button onClick={() => setIsAddingGoal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Quarterly Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Goal Title"
                value={newGoal.title || ''}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Weekly Date Nights"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newGoal.category || 'marriage'}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="marriage">Marriage</option>
                  <option value="family">Family</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="financial">Financial</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>
              <Input
                label="Target Date"
                type="date"
                value={newGoal.targetDate || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newGoal.priority || 'medium'}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddGoal}>Add Goal</Button>
              <Button variant="outline" onClick={() => setIsAddingGoal(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Goals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const Icon = categoryIcons[goal.category]
            const colorClass = categoryColors[goal.category]
            const priorityClass = priorityColors[goal.priority]
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${priorityClass}`}>
                          {goal.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-slate-600 hover:text-slate-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  {goal.milestones.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
                      {goal.milestones.map((milestone, index) => {
                        const isCompleted = goal.completedMilestones.includes(milestone)
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleMilestone(goal.id, milestone)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-slate-500 border-slate-500 text-white' 
                                  : 'border-gray-300 hover:border-slate-500'
                              }`}
                            >
                              {isCompleted && <CheckCircle className="w-3 h-3" />}
                            </button>
                            <span className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {milestone}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Target: {goal.targetDate}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-slate-100 text-slate-800' :
                        goal.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Weekly Meeting Integration */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Meeting Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">How to Use in Weekly Meetings:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Review quarterly theme and focus
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Check progress on quarterly goals
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Set weekly actions toward goals
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Celebrate milestone completions
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Monthly Reviews:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                Assess goal progress and adjust
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                Plan next month's priorities
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                Update quarterly theme if needed
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
