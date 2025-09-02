import { motion } from 'framer-motion'
import { TrendingUp, Target, Award, Clock, Heart, Zap } from 'lucide-react'
import { Card } from '../ui/Card'

export function ProgressAnalytics() {
  // Mock data - replace with actual data from store/database
  const mockData = {
    currentStreak: 7,
    longestStreak: 23,
    totalEntries: 45,
    goalCompletion: {
      daily: { completed: 12, total: 15, percentage: 80 },
      weekly: { completed: 8, total: 12, percentage: 67 },
      monthly: { completed: 3, total: 6, percentage: 50 }
    },
    categoryBreakdown: [
      { category: 'Spiritual', count: 18, color: 'bg-blue-500' },
      { category: 'Health', count: 12, color: 'bg-green-500' },
      { category: 'Personal', count: 8, color: 'bg-purple-500' },
      { category: 'Work', count: 5, color: 'bg-orange-500' },
      { category: 'Family', count: 2, color: 'bg-pink-500' }
    ],
    monthlyProgress: [
      { month: 'Jan', entries: 8, goals: 12 },
      { month: 'Feb', entries: 12, goals: 15 },
      { month: 'Mar', entries: 15, goals: 18 },
      { month: 'Apr', entries: 10, goals: 12 }
    ],
    leadershipScores: {
      wisdom: 7.5,
      courage: 8.2,
      patience: 6.8,
      integrity: 9.1
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Progress Analytics</h1>
        <p className="text-xl text-gray-600">Track your spiritual journey and growth patterns</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{mockData.currentStreak}</h3>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-xs text-green-600 mt-1">🔥 Keep it up!</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{mockData.totalEntries}</h3>
            <p className="text-sm text-gray-600">Total Entries</p>
            <p className="text-xs text-blue-600 mt-1">📝 Consistent!</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{mockData.longestStreak}</h3>
            <p className="text-sm text-gray-600">Longest Streak</p>
            <p className="text-xs text-purple-600 mt-1">🏆 Personal best!</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">78%</h3>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <p className="text-xs text-orange-600 mt-1">📈 Growing!</p>
          </Card>
        </motion.div>
      </div>

      {/* Goal Completion Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              🎯 Goal Completion Rates
            </h3>
            <div className="space-y-4">
              {Object.entries(mockData.goalCompletion).map(([type, data]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{type} Goals</span>
                    <span className="text-gray-600">{data.completed}/{data.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500">{data.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              📊 Category Breakdown
            </h3>
            <div className="space-y-4">
              {mockData.categoryBreakdown.map((category) => (
                <div key={category.category} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                  <span className="flex-1 text-sm text-gray-700">{category.category}</span>
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(category.count / 45) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Leadership Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            👑 Leadership Growth Tracker
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(mockData.leadershipScores).map(([trait, score]) => (
              <div key={trait} className="text-center">
                <h4 className="font-medium text-gray-900 capitalize mb-2">{trait}</h4>
                <div className="relative">
                  <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${score * 10}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{score}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">/ 10</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Monthly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            📈 Monthly Progress
          </h3>
          <div className="h-64 flex items-end space-x-4">
            {mockData.monthlyProgress.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative">
                  <div
                    className="bg-gradient-to-t from-green-500 to-green-600 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(month.entries / 18) * 200}px` }}
                  ></div>
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(month.goals / 18) * 200}px` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{month.month}</span>
                <div className="text-xs text-gray-500 text-center">
                  <div>Entries: {month.entries}</div>
                  <div>Goals: {month.goals}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Goals</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            💡 Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Strong Spiritual Focus</h4>
                  <p className="text-sm text-gray-600">Your spiritual goals are consistently completed. Consider adding more health and family goals for balance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Consistent Streak</h4>
                  <p className="text-sm text-gray-600">You're on a 7-day streak! Try to maintain this momentum for the next milestone.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Monthly Goals Need Attention</h4>
                  <p className="text-sm text-gray-600">Only 50% of monthly goals are completed. Break them down into smaller weekly tasks.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Leadership Growth</h4>
                  <p className="text-sm text-gray-600">Your integrity score is excellent (9.1). Focus on patience (6.8) for balanced growth.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
