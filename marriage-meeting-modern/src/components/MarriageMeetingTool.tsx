// Marriage Meeting Tool - Main Application Component

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Mountain, CheckCircle, Clock, Save } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useMarriageStore } from '../stores/marriageStore'
import { dbManager, DatabaseManager } from '../lib/database'
import { DayName, ListType } from '../types/marriageTypes'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { GoalsSection } from './GoalsSection'

// Weekly Schedule Component
const WeeklySchedule: React.FC<{
  schedule: any
  onUpdate: (day: DayName, index: number, value: string) => void
  onAddLine: (day: DayName) => void
  onRemoveLine: (day: DayName, index: number) => void
}> = ({ schedule, onUpdate, onAddLine, onRemoveLine }) => {
  const days: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Weekly Schedule
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day} className="space-y-2">
            <h4 className="font-medium text-gray-700 text-sm">{day}</h4>
            <div className="space-y-2">
              {schedule[day]?.map((activity: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={activity}
                    onChange={(e) => onUpdate(day, index, e.target.value)}
                    placeholder={`Activity ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm resize-none"
                    rows={2}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveLine(day, index)}
                    className="px-2 py-1 text-xs"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddLine(day)}
                className="w-full text-xs"
              >
                + Add Activity
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// List Section Component
const ListSection: React.FC<{
  title: string
  listType: ListType
  items: any[]
  onUpdate: (listType: ListType, id: number, text: string) => void
  onAdd: (listType: ListType, text: string) => void
  onToggle: (listType: ListType, id: number) => void
  onRemove: (listType: ListType, id: number) => void
}> = ({ title, listType, items, onUpdate, onAdd, onToggle, onRemove }) => {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(listType, newItem.trim())
      setNewItem('')
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Add new item */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} size="sm">
          Add
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
            <button
              onClick={() => onToggle(listType, item.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                item.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300'
              }`}
            >
              {item.completed && <CheckCircle className="w-3 h-3" />}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => onUpdate(listType, item.id, e.target.value)}
              className={`flex-1 p-1 border-none bg-transparent text-sm ${
                item.completed ? 'line-through text-gray-500' : ''
              }`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(listType, item.id)}
              className="px-2 py-1 text-xs text-red-600 hover:text-red-700"
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Week Navigation Component
const WeekNavigation: React.FC<{
  currentDate: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onCurrentWeek: () => void
}> = ({ currentDate, onPreviousWeek, onNextWeek, onCurrentWeek }) => {
  const formatWeekRange = (date: Date) => {
    const monday = new Date(date)
    const day = monday.getDay()
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1)
    monday.setDate(diff)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onPreviousWeek}>
          ← Previous Week
        </Button>
        <Button variant="outline" onClick={onCurrentWeek}>
          Current Week
        </Button>
        <Button variant="outline" onClick={onNextWeek}>
          Next Week →
        </Button>
      </div>
      <div className="text-lg font-semibold text-gray-700">
        {formatWeekRange(currentDate)}
      </div>
    </div>
  )
}

// Main Marriage Meeting Tool Component
export const MarriageMeetingTool: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const {
    weekData,
    currentDate,
    isLoading,
    error,
    lastSaved,
    setCurrentDate,
    loadWeekData,
    saveWeekData,
    updateSchedule,
    addScheduleLine,
    removeScheduleLine,
    updateListItem,
    addListItem,
    toggleListItem,
    removeListItem,
    updateGoals
  } = useMarriageStore()

  const [isSaving, setIsSaving] = useState(false)

  // Load week data when date changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const weekKey = DatabaseManager.formatWeekKey(currentDate)
      loadWeekData(weekKey)
    }
  }, [currentDate, isAuthenticated, user, loadWeekData])

  // Auto-save functionality
  useEffect(() => {
    if (isAuthenticated && user && weekData) {
      const saveTimeout = setTimeout(async () => {
        setIsSaving(true)
        try {
          const weekKey = DatabaseManager.formatWeekKey(currentDate)
          await saveWeekData(weekKey, weekData)
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }, 1000) // Auto-save after 1 second of inactivity

      return () => clearTimeout(saveTimeout)
    }
  }, [weekData, currentDate, isAuthenticated, user, saveWeekData])

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleCurrentWeek = () => {
    setCurrentDate(new Date())
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Marriage Meeting Tool</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your weekly planning</p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marriage Meeting Tool</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Save className="w-4 h-4 animate-spin" />
                  Saving...
                </div>
              )}
              {lastSaved && (
                <div className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Week Navigation */}
        <WeekNavigation
          currentDate={currentDate}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onCurrentWeek={handleCurrentWeek}
        />

        {/* Weekly Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <WeeklySchedule
            schedule={weekData.schedule}
            onUpdate={updateSchedule}
            onAddLine={addScheduleLine}
            onRemoveLine={removeScheduleLine}
          />
        </motion.div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ListSection
              title="To-Do List"
              listType="todos"
              items={weekData.todos}
              onUpdate={updateListItem}
              onAdd={addListItem}
              onToggle={toggleListItem}
              onRemove={removeListItem}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ListSection
              title="Prayer List"
              listType="prayers"
              items={weekData.prayers}
              onUpdate={updateListItem}
              onAdd={addListItem}
              onToggle={toggleListItem}
              onRemove={removeListItem}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-3"
          >
            <GoalsSection
              goals={weekData.goals}
              onUpdate={updateGoals}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ListSection
              title="Grocery List"
              listType="grocery"
              items={weekData.grocery}
              onUpdate={updateListItem}
              onAdd={addListItem}
              onToggle={toggleListItem}
              onRemove={removeListItem}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ListSection
              title="Unconfessed Sin"
              listType="unconfessedSin"
              items={weekData.unconfessedSin}
              onUpdate={updateListItem}
              onAdd={addListItem}
              onToggle={toggleListItem}
              onRemove={removeListItem}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ListSection
              title="Weekly Winddown"
              listType="weeklyWinddown"
              items={weekData.weeklyWinddown}
              onUpdate={updateListItem}
              onAdd={addListItem}
              onToggle={toggleListItem}
              onRemove={removeListItem}
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
