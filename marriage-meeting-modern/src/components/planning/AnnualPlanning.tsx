import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, CheckCircle, TrendingUp, Users, Heart, Home, DollarSign, BookOpen, Zap, ArrowRight, Plus, Edit3, Trash2, Star, Award, Mountain, Compass } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAccentColor } from '../../hooks/useAccentColor'

interface AnnualGoal {
  id: string
  category: 'marriage' | 'family' | 'spiritual' | 'financial' | 'personal' | 'health' | 'ministry' | 'career'
  title: string
  description: string
  targetDate: string
  progress: number
  quarterlyBreakdown: {
    Q1: string[]
    Q2: string[]
    Q3: string[]
    Q4: string[]
  }
  completedMilestones: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed' | 'paused'
  vision: string
  impact: string
}

interface AnnualTheme {
  id: string
  year: number
  theme: string
  verse: string
  focus: string
  color: string
  quarterlyThemes: {
    Q1: string
    Q2: string
    Q3: string
    Q4: string
  }
}

interface VisionStatement {
  id: string
  title: string
  statement: string
  values: string[]
  priorities: string[]
}

const categoryIcons = {
  marriage: Heart,
  family: Users,
  spiritual: BookOpen,
  financial: DollarSign,
  personal: Zap,
  health: TrendingUp,
  ministry: Star,
  career: Mountain
}

export const AnnualPlanning: React.FC = () => {
  const { getColor, accentColor } = useAccentColor()
  
  // Get the correct gradient classes based on accent color
  const getGradientClasses = () => {
    switch (accentColor) {
      case 'green':
        return 'to-green-100 dark:to-green-800'
      case 'blue':
        return 'to-blue-100 dark:to-blue-800'
      case 'slate':
        return 'to-slate-100 dark:to-slate-800'
      case 'red':
        return 'to-red-100 dark:to-red-800'
      case 'orange':
        return 'to-orange-100 dark:to-orange-800'
      default: // purple
        return 'to-purple-100 dark:to-purple-800'
    }
  }
  
  const getCategoryColors = () => ({
    marriage: 'from-slate-600 to-slate-700',
    family: 'from-slate-500 to-slate-600',
    spiritual: `from-${getColor('primary')} to-${getColor('primary')}`,
    financial: 'from-slate-700 to-slate-800',
    personal: `from-${getColor('primary')} to-${getColor('primary')}`,
    health: `from-slate-600 to-${getColor('primary')}`,
    ministry: `from-${getColor('primary')} to-${getColor('primary')}`,
    career: `from-slate-500 to-${getColor('primary')}`
  })

  const getPriorityColors = () => ({
    critical: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
    high: `bg-${getColor('secondary')} text-${getColor('text')} border-${getColor('border')}`,
    medium: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600',
    low: 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
  })
  const [goals, setGoals] = useState<AnnualGoal[]>([])
  const [themes, setThemes] = useState<AnnualTheme[]>([])
  const [vision, setVision] = useState<VisionStatement | null>(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isAddingTheme, setIsAddingTheme] = useState(false)
  const [isEditingVision, setIsEditingVision] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<AnnualGoal>>({
    category: 'marriage',
    priority: 'medium',
    status: 'not-started',
    progress: 0,
    quarterlyBreakdown: { Q1: [], Q2: [], Q3: [], Q4: [] },
    completedMilestones: []
  })
  const [newTheme, setNewTheme] = useState<Partial<AnnualTheme>>({
    year: currentYear,
    color: 'from-blue-500 to-cyan-500',
    quarterlyThemes: { Q1: '', Q2: '', Q3: '', Q4: '' }
  })
  const [newVision, setNewVision] = useState<Partial<VisionStatement>>({
    values: [],
    priorities: []
  })

  useEffect(() => {
    loadAnnualData()
  }, [])

  const loadAnnualData = () => {
    // Mock data - in real app, load from API
    const mockGoals: AnnualGoal[] = [
      {
        id: '1',
        category: 'marriage',
        title: 'Strengthen Our Marriage Foundation',
        description: 'Build a stronger, more intimate marriage through consistent practices and growth',
        targetDate: '2025-12-31',
        progress: 35,
        quarterlyBreakdown: {
          Q1: ['Establish weekly date nights', 'Start couples devotionals'],
          Q2: ['Plan marriage retreat', 'Improve communication'],
          Q3: ['Focus on intimacy', 'Resolve conflicts better'],
          Q4: ['Reflect and celebrate', 'Plan next year']
        },
        completedMilestones: ['Establish weekly date nights', 'Start couples devotionals'],
        priority: 'critical',
        status: 'in-progress',
        vision: 'A marriage that glorifies God and serves as an example to others',
        impact: 'Stronger family foundation, better parenting, ministry opportunities'
      },
      {
        id: '2',
        category: 'spiritual',
        title: 'Deepen Our Spiritual Walk',
        description: 'Grow closer to God individually and as a couple',
        targetDate: '2025-12-31',
        progress: 20,
        quarterlyBreakdown: {
          Q1: ['Daily individual prayer', 'Weekly family devotions'],
          Q2: ['Join small group', 'Serve in ministry'],
          Q3: ['Read through Bible', 'Attend conference'],
          Q4: ['Mentor others', 'Plan spiritual goals']
        },
        completedMilestones: ['Daily individual prayer'],
        priority: 'high',
        status: 'in-progress',
        vision: 'A family that seeks God first in all decisions',
        impact: 'Better decision making, peace in trials, spiritual leadership'
      }
    ]

    const mockThemes: AnnualTheme[] = [
      {
        id: '1',
        year: 2025,
        theme: 'Building on the Rock',
        verse: 'Therefore everyone who hears these words of mine and puts them into practice is like a wise man who built his house on the rock. - Matthew 7:24',
        focus: 'Establishing strong foundations in all areas of life',
        color: 'from-blue-500 to-cyan-500',
        quarterlyThemes: {
          Q1: 'Foundation Building',
          Q2: 'Growth & Development',
          Q3: 'Fruitfulness & Impact',
          Q4: 'Reflection & Planning'
        }
      }
    ]

    const mockVision: VisionStatement = {
      id: '1',
      title: 'Our Family Vision 2025',
      statement: 'To build a Christ-centered home that serves as a beacon of love, faith, and hope in our community, while raising children who know and love God.',
      values: ['Faith', 'Love', 'Integrity', 'Service', 'Growth', 'Unity'],
      priorities: ['Marriage', 'Children', 'Spiritual Growth', 'Community', 'Health', 'Ministry']
    }

    setGoals(mockGoals)
    setThemes(mockThemes)
    setVision(mockVision)
  }

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.description) return

    const goal: AnnualGoal = {
      id: Date.now().toString(),
      category: newGoal.category || 'marriage',
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate || '',
      progress: 0,
      quarterlyBreakdown: newGoal.quarterlyBreakdown || { Q1: [], Q2: [], Q3: [], Q4: [] },
      completedMilestones: [],
      priority: newGoal.priority || 'medium',
      status: 'not-started',
      vision: newGoal.vision || '',
      impact: newGoal.impact || ''
    }

    setGoals([...goals, goal])
    setNewGoal({
      category: 'marriage',
      priority: 'medium',
      status: 'not-started',
      progress: 0,
      quarterlyBreakdown: { Q1: [], Q2: [], Q3: [], Q4: [] },
      completedMilestones: []
    })
    setIsAddingGoal(false)
  }

  const handleAddTheme = () => {
    if (!newTheme.theme || !newTheme.focus) return

    const theme: AnnualTheme = {
      id: Date.now().toString(),
      year: newTheme.year || currentYear,
      theme: newTheme.theme,
      verse: newTheme.verse || '',
      focus: newTheme.focus,
      color: newTheme.color || 'from-blue-500 to-cyan-500',
      quarterlyThemes: newTheme.quarterlyThemes || { Q1: '', Q2: '', Q3: '', Q4: '' }
    }

    setThemes([...themes, theme])
    setNewTheme({
      year: currentYear,
      color: 'from-blue-500 to-cyan-500',
      quarterlyThemes: { Q1: '', Q2: '', Q3: '', Q4: '' }
    })
    setIsAddingTheme(false)
  }

  const handleUpdateVision = () => {
    if (!newVision.title || !newVision.statement) return

    const visionStatement: VisionStatement = {
      id: Date.now().toString(),
      title: newVision.title,
      statement: newVision.statement,
      values: newVision.values || [],
      priorities: newVision.priorities || []
    }

    setVision(visionStatement)
    setNewVision({ values: [], priorities: [] })
    setIsEditingVision(false)
  }

  const getAnnualStats = () => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const inProgressGoals = goals.filter(g => g.status === 'in-progress').length
    const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals) : 0
    const criticalGoals = goals.filter(g => g.priority === 'critical').length

    return { totalGoals, completedGoals, inProgressGoals, avgProgress, criticalGoals }
  }

  const stats = getAnnualStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Annual Planning</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Set your vision, themes, and goals for the year ahead
        </p>
      </div>

      {/* Vision Statement */}
      <Card className={`p-6 bg-gradient-to-br from-slate-100 ${getGradientClasses()} border-slate-300 dark:border-slate-600 relative overflow-hidden`}>
        <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-slate-600" />
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200">Our Family Vision</h2>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsEditingVision(true)}
            className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
        
        {vision ? (
          <div>
            <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-200">{vision.title}</h3>
            <p className="text-base mb-6 leading-relaxed text-slate-600 dark:text-slate-300">{vision.statement}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">Our Values</h4>
                <div className="flex flex-wrap gap-2">
                  {vision.values.map((value, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-300">Our Priorities</h4>
                <div className="flex flex-wrap gap-2">
                  {vision.priorities.map((priority, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300">
                      {priority}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">No vision statement yet</p>
            <Button onClick={() => setIsEditingVision(true)}>
              Create Our Vision
            </Button>
          </div>
        )}
        </div>
      </Card>

      {/* Edit Vision Form */}
      {isEditingVision && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Vision Statement</h3>
          <div className="space-y-4">
            <Input
              label="Vision Title"
              value={newVision.title || ''}
              onChange={(e) => setNewVision({ ...newVision, title: e.target.value })}
              placeholder="e.g., Our Family Vision 2025"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vision Statement</label>
              <textarea
                value={newVision.statement || ''}
                onChange={(e) => setNewVision({ ...newVision, statement: e.target.value })}
                placeholder="Describe your family's vision for the year..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Values (comma-separated)</label>
                <Input
                  value={newVision.values?.join(', ') || ''}
                  onChange={(e) => setNewVision({ ...newVision, values: e.target.value.split(',').map(v => v.trim()).filter(v => v) })}
                  placeholder="Faith, Love, Integrity, Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorities (comma-separated)</label>
                <Input
                  value={newVision.priorities?.join(', ') || ''}
                  onChange={(e) => setNewVision({ ...newVision, priorities: e.target.value.split(',').map(p => p.trim()).filter(p => p) })}
                  placeholder="Marriage, Children, Spiritual Growth"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUpdateVision}>Save Vision</Button>
              <Button variant="outline" onClick={() => setIsEditingVision(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Annual Theme */}
      {themes.length > 0 && (
        <Card className={`p-6 bg-gradient-to-br from-slate-50/60 ${getGradientClasses().replace('to-', 'to-').replace('100', '50/40').replace('800', '800/40')} dark:from-slate-700/60 border-slate-200/60 dark:border-slate-600/60`}>
          <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">{themes[0].theme}</h2>
          <p className="text-lg mb-3 text-slate-700 dark:text-slate-300">{themes[0].focus}</p>
          {themes[0].verse && (
            <p className="text-sm italic text-slate-600 dark:text-slate-400 mb-4">"{themes[0].verse}"</p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(themes[0].quarterlyThemes).map(([quarter, theme]) => (
              <div key={quarter} className="text-center">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{quarter}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{theme}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGoals}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Goals</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedGoals}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className={`w-12 h-12 ${getGradientClasses().replace('to-', 'bg-').replace('100', '100')} dark:${getGradientClasses().replace('to-', 'bg-').replace('100', '900/20')} rounded-full flex items-center justify-center mx-auto mb-3`}>
            <TrendingUp className={`w-6 h-6 text-${getColor('primary')} dark:text-${getColor('primary')}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgressGoals}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">In Progress</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className={`w-12 h-12 ${getGradientClasses().replace('to-', 'bg-').replace('100', '100')} dark:${getGradientClasses().replace('to-', 'bg-').replace('100', '900/20')} rounded-full flex items-center justify-center mx-auto mb-3`}>
            <Calendar className={`w-6 h-6 text-${getColor('primary')} dark:text-${getColor('primary')}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgProgress}%</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Avg Progress</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.criticalGoals}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Critical</p>
        </Card>
      </div>

      {/* Goals Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Annual Goals</h2>
          <Button onClick={() => setIsAddingGoal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add New Annual Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Goal Title"
                value={newGoal.title || ''}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Strengthen Our Marriage Foundation"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={newGoal.category || 'marriage'}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="marriage">Marriage</option>
                  <option value="family">Family</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="financial">Financial</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="ministry">Ministry</option>
                  <option value="career">Career</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe your goal in detail..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <Input
                label="Target Date"
                type="date"
                value={newGoal.targetDate || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={newGoal.priority || 'medium'}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vision (Why this goal matters)</label>
                <textarea
                  value={newGoal.vision || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, vision: e.target.value })}
                  placeholder="Why is this goal important to your family's vision?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Impact (What this will achieve)</label>
                <textarea
                  value={newGoal.impact || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, impact: e.target.value })}
                  placeholder="What positive impact will achieving this goal have?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
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
            const colorClass = getCategoryColors()[goal.category]
            const priorityClass = getPriorityColors()[goal.priority]
            
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
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
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{goal.description}</p>
                  
                  {/* Vision & Impact */}
                  {goal.vision && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Vision</h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{goal.vision}</p>
                    </div>
                  )}
                  
                  {goal.impact && (
                    <div className={`mb-4 p-3 ${getGradientClasses().replace('to-', 'bg-').replace('100', '50')} dark:${getGradientClasses().replace('to-', 'bg-').replace('100', '900/20')} rounded-lg`}>
                      <h4 className={`text-sm font-medium text-${getColor('text')} dark:text-${getColor('text')} mb-1`}>Impact</h4>
                      <p className="text-xs text-${getColor('primary')} dark:text-${getColor('primary')}">{goal.impact}</p>
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Quarterly Breakdown */}
                  <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quarterly Breakdown</h4>
                    {Object.entries(goal.quarterlyBreakdown).map(([quarter, milestones]) => (
                      <div key={quarter} className="text-xs">
                        <span className="font-medium text-gray-600 dark:text-gray-400">{quarter}:</span>
                        <ul className="ml-2 mt-1 space-y-1">
                          {milestones.map((milestone, index) => (
                            <li key={index} className="text-gray-500 dark:text-gray-400">• {milestone}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Target: {goal.targetDate}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                        goal.status === 'in-progress' ? `${getGradientClasses().replace('to-', 'bg-').replace('100', '100')} dark:${getGradientClasses().replace('to-', 'bg-').replace('100', '900/20')} text-${getColor('text')} dark:text-${getColor('text')}` :
                        'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
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

      {/* Integration Guide */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How This Guides Your Planning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Annual → Quarterly</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <ArrowRight className={`w-4 h-4 text-${getColor('primary')} mt-0.5 flex-shrink-0`} />
                Break annual goals into quarterly milestones
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className={`w-4 h-4 text-${getColor('primary')} mt-0.5 flex-shrink-0`} />
                Set quarterly themes that support annual vision
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className={`w-4 h-4 text-${getColor('primary')} mt-0.5 flex-shrink-0`} />
                Review and adjust quarterly goals monthly
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Quarterly → Monthly</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                Focus on 2-3 quarterly goals per month
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                Plan specific actions for the month
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                Track progress and celebrate wins
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Monthly → Weekly</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <ArrowRight className={`w-4 h-4 text-${getColor('primary')} mt-0.5 flex-shrink-0`} />
                Set weekly actions toward monthly goals
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className={`w-4 h-4 text-${getColor('primary')} mt-0.5 flex-shrink-0`} />
                Review quarterly theme in weekly meetings
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className={`w-4 h-4 text-${getColor('primary')} mt-0.5 flex-shrink-0`} />
                Adjust plans based on progress
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
