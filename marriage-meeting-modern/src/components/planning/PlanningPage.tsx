import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, Compass, ArrowRight, BookOpen, Users, Heart, TrendingUp } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { QuarterlyPlanning } from './QuarterlyPlanning'
import { AnnualPlanning } from './AnnualPlanning'
import { FamilyVisionDisplay } from '../vision/FamilyVisionDisplay'

type PlanningTab = 'vision' | 'annual' | 'quarterly' | 'integration'

export const PlanningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlanningTab>('vision')

  const tabs = [
    {
      id: 'vision' as PlanningTab,
      label: 'Family Vision',
      icon: Heart,
      description: 'Your vision, quarterly focus, and annual goals'
    },
    {
      id: 'annual' as PlanningTab,
      label: 'Annual Planning',
      icon: Compass,
      description: 'Set your vision, themes, and goals for the year'
    },
    {
      id: 'quarterly' as PlanningTab,
      label: 'Quarterly Planning',
      icon: Calendar,
      description: 'Break down annual goals into quarterly milestones'
    },
    {
      id: 'integration' as PlanningTab,
      label: 'Integration Guide',
      icon: ArrowRight,
      description: 'How to use planning in your weekly meetings'
    }
  ]

  const renderIntegrationGuide = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planning Integration Guide</h1>
        <p className="text-lg text-gray-600">
          How to use your annual and quarterly planning in weekly meetings
        </p>
      </div>

      {/* Planning Hierarchy */}
      <Card className="p-8 bg-gradient-to-r from-slate-50 to-purple-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Planning Hierarchy</h2>
        <div className="space-y-6">
          {/* Annual Level */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-purple-600 rounded-full flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Annual Planning</h3>
              <p className="text-gray-600">Vision, themes, and major goals for the year</p>
            </div>
            <div className="text-sm text-gray-500">
              <div>• Family vision statement</div>
              <div>• Annual theme & verse</div>
              <div>• 3-5 major goals</div>
              <div>• Quarterly breakdown</div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Quarterly Level */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-purple-500 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Quarterly Planning</h3>
              <p className="text-gray-600">Specific goals and themes for each quarter</p>
            </div>
            <div className="text-sm text-gray-500">
              <div>• Quarterly theme</div>
              <div>• 2-3 quarterly goals</div>
              <div>• Monthly milestones</div>
              <div>• Progress tracking</div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Monthly Level */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-slate-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Planning</h3>
              <p className="text-gray-600">Focus areas and actions for the month</p>
            </div>
            <div className="text-sm text-gray-500">
              <div>• Monthly focus areas</div>
              <div>• Specific actions</div>
              <div>• Weekly priorities</div>
              <div>• Progress reviews</div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Weekly Level */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-700 to-purple-700 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Meetings</h3>
              <p className="text-gray-600">Daily actions and progress tracking</p>
            </div>
            <div className="text-sm text-gray-500">
              <div>• Weekly action items</div>
              <div>• Progress updates</div>
              <div>• Goal check-ins</div>
              <div>• Celebration & adjustment</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Meeting Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Weekly Meeting Agenda
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Vision Check (5 min)</h4>
                <p className="text-sm text-gray-600">Review annual vision and quarterly theme</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Goal Progress (10 min)</h4>
                <p className="text-sm text-gray-600">Check progress on quarterly goals and celebrate wins</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Weekly Actions (15 min)</h4>
                <p className="text-sm text-gray-600">Set specific actions for the week toward your goals</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Regular Meeting (20 min)</h4>
                <p className="text-sm text-gray-600">Continue with your normal weekly meeting agenda</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Monthly Review Process
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-slate-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Progress Assessment</h4>
                <p className="text-sm text-gray-600">Review what was accomplished and what wasn't</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-slate-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Goal Adjustment</h4>
                <p className="text-sm text-gray-600">Modify goals if needed based on progress</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-slate-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Next Month Planning</h4>
                <p className="text-sm text-gray-600">Set focus areas and priorities for next month</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-slate-600">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Celebration</h4>
                <p className="text-sm text-gray-600">Acknowledge wins and progress made</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quarterly Review Process */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Quarterly Review Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Week 1: Assessment</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Review quarterly goals</li>
              <li>• Assess progress made</li>
              <li>• Identify challenges</li>
              <li>• Celebrate achievements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Week 2: Planning</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Set next quarter's goals</li>
              <li>• Choose quarterly theme</li>
              <li>• Plan monthly milestones</li>
              <li>• Update annual goals if needed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Week 3: Integration</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Update weekly meeting agenda</li>
              <li>• Set up tracking systems</li>
              <li>• Communicate new focus</li>
              <li>• Begin new quarter strong</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Tips for Success */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          Tips for Success
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Keep It Simple</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-1">✓</span>
                Start with 2-3 annual goals maximum
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-1">✓</span>
                Focus on one quarterly goal per month
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-1">✓</span>
                Keep weekly actions specific and achievable
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Stay Flexible</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                Adjust goals as life changes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                Don't be afraid to pause or modify
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✓</span>
                Focus on progress, not perfection
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 pt-20 sm:pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Strategic Planning</h1>
          <p className="text-lg text-gray-600 mb-6">
            Plan your year, break it into quarters, and execute through weekly meetings
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-2 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-slate-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'vision' && <FamilyVisionDisplay />}
          {activeTab === 'annual' && <AnnualPlanning />}
          {activeTab === 'quarterly' && <QuarterlyPlanning />}
          {activeTab === 'integration' && renderIntegrationGuide()}
        </motion.div>
      </div>
    </div>
  )
}
