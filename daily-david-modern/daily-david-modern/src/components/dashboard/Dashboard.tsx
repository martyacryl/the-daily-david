import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Calendar, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { goals } = useDailyStore()

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to The Daily David
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          A modern spiritual growth and discipleship tracking platform. 
          Sign in to start your daily spiritual journey.
        </p>
        <Link to="/login">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Entries',
      value: '24',
      change: '+12%',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Current Streak',
      value: '7 days',
      change: '+3 days',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'This Month',
      value: '18',
      change: '+5',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Goals Completed',
      value: `${goals.daily.filter(g => g.completed).length + goals.weekly.filter(g => g.completed).length + goals.monthly.filter(g => g.completed).length}`,
      change: '+8',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Continue your spiritual growth journey today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Today's Entry
            </h3>
            <p className="text-gray-600 mb-6">
              Begin your daily SOAP study and reflection
            </p>
            <Link to="/daily">
              <Button size="lg" className="w-full">
                Create Entry
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              View Progress
            </h3>
            <p className="text-gray-600 mb-6">
              Track your spiritual growth and achievements
            </p>
            <Link to="/analytics">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed yesterday's entry</span>
              <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Added new goal: "Read through Psalms"</span>
              <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Achieved 7-day streak milestone</span>
              <span className="text-xs text-gray-400 ml-auto">3 days ago</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Goals Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Daily Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Daily Goals</h3>
            <span className="text-sm text-gray-500">
              {goals.daily.filter(g => g.completed).length}/{goals.daily.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {goals.daily.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${goal.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {goals.daily.length === 0 && (
              <div className="text-sm text-gray-500 italic">No daily goals set yet</div>
            )}
          </div>
          <Link to="/daily" className="block mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View all daily goals →
          </Link>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 Weekly Goals</h3>
            <span className="text-sm text-gray-500">
              {goals.weekly.filter(g => g.completed).length}/{goals.weekly.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {goals.weekly.slice(0, 4).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${goal.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {goals.weekly.length === 0 && (
              <div className="text-sm text-gray-500 italic">No weekly goals set yet</div>
            )}
          </div>
          <Link to="/daily" className="block mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View all weekly goals →
          </Link>
        </Card>

        {/* Monthly Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🗓️ Monthly Goals</h3>
            <span className="text-sm text-gray-500">
              {goals.monthly.filter(g => g.completed).length}/{goals.monthly.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {goals.monthly.slice(0, 2).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${goal.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {goals.monthly.length === 0 && (
              <div className="text-sm text-gray-500 italic">No monthly goals set yet</div>
            )}
          </div>
          <Link to="/daily" className="block mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View all monthly goals →
          </Link>
        </Card>
      </motion.div>
    </div>
  )
}