import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  Flag, 
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  User,
  UserCheck,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { TaskItem } from '../types/marriageTypes'
import { useSettingsStore } from '../stores/settingsStore'

interface TasksSectionProps {
  tasks: TaskItem[]
  onUpdate: (tasks: TaskItem[]) => void
}

export const TasksSection: React.FC<TasksSectionProps> = ({ tasks, onUpdate }) => {
  const { settings, loadSettings } = useSettingsStore()
  
  // Load settings when component mounts
  useEffect(() => {
    loadSettings()
  }, [loadSettings])
  
  // Debug logging
  console.log('TasksSection - Settings:', settings)
  console.log('TasksSection - Spouse1 name:', settings.spouse1?.name)
  console.log('TasksSection - Spouse2 name:', settings.spouse2?.name)
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({
    text: '',
    priority: 'medium',
    dueDate: '',
    estimatedDuration: 30,
    category: '',
    notes: '',
    assignedTo: 'both'
  })
  
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editTaskData, setEditTaskData] = useState<Partial<TaskItem>>({})

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getAssignmentIcon = (assignedTo: string) => {
    switch (assignedTo) {
      case 'both': return <Users className="w-4 h-4" />
      case 'spouse1': return <User className="w-4 h-4" />
      case 'spouse2': return <UserCheck className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getAssignmentLabel = (assignedTo: string) => {
    switch (assignedTo) {
      case 'both': return 'Both Spouses'
      case 'spouse1': return settings.spouse1?.name || 'Loading...'
      case 'spouse2': return settings.spouse2?.name || 'Loading...'
      default: return 'Both Spouses'
    }
  }

  const getAssignmentColor = (assignedTo: string) => {
    switch (assignedTo) {
      case 'both': return 'text-blue-600 bg-blue-100'
      case 'spouse1': return 'text-purple-600 bg-purple-100'
      case 'spouse2': return 'text-green-600 bg-green-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const addTask = () => {
    if (!newTask.text?.trim()) return

    const task: TaskItem = {
      id: Date.now(),
      text: newTask.text,
      completed: false,
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate || undefined,
      estimatedDuration: newTask.estimatedDuration || 30,
      category: newTask.category || undefined,
      notes: newTask.notes || undefined,
      assignedTo: newTask.assignedTo || 'both'
    }

    onUpdate([...tasks, task])
    setNewTask({
      text: '',
      priority: 'medium',
      dueDate: '',
      estimatedDuration: 30,
      category: '',
      notes: '',
      assignedTo: 'both'
    })
  }

  const startEditTask = (task: TaskItem) => {
    setEditingTask(task.id.toString())
    setEditTaskData({
      text: task.text,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate || '',
      estimatedDuration: task.estimatedDuration,
      category: task.category || '',
      notes: task.notes || ''
    })
  }

  const saveEditTask = () => {
    if (!editingTask || !editTaskData.text?.trim()) return

    const updatedTask: Partial<TaskItem> = {
      text: editTaskData.text.trim(),
      priority: editTaskData.priority || 'medium',
      assignedTo: editTaskData.assignedTo || 'both',
      dueDate: editTaskData.dueDate || undefined,
      estimatedDuration: editTaskData.estimatedDuration || 30,
      category: editTaskData.category || undefined,
      notes: editTaskData.notes || undefined
    }

    updateTask(parseInt(editingTask), updatedTask)
    setEditingTask(null)
    setEditTaskData({})
  }

  const cancelEditTask = () => {
    setEditingTask(null)
    setEditTaskData({})
  }

  const updateTask = (id: number, updates: Partial<TaskItem>) => {
    onUpdate(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  const toggleTask = (id: number) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed })
  }

  const removeTask = (id: number) => {
    onUpdate(tasks.filter(task => task.id !== id))
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by priority first (high, medium, low)
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority] || 0
    const bPriority = priorityOrder[b.priority] || 0
    
    if (aPriority !== bPriority) return bPriority - aPriority
    
    // Then by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    
    return 0
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-lg">
            <CheckSquare className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <p className="text-gray-600">Plan and track your tasks with timelines</p>
          </div>
        </div>

        {/* Add New Task Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newTask.text}
                onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value as 'both' | 'spouse1' | 'spouse2' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="both">Both Spouses</option>
                <option value="spouse1">{settings.spouse1?.name || 'Loading...'}</option>
                <option value="spouse2">{settings.spouse2?.name || 'Loading...'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={newTask.estimatedDuration}
                onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) || 30 })}
                min="5"
                step="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                placeholder="e.g., Work, Home, Health"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={newTask.notes}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              placeholder="Additional details..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <Button
            onClick={addTask}
            className="mt-4 bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 bg-white border rounded-lg hover:shadow-sm transition-all ${
                task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
              } ${isOverdue(task.dueDate || '') && !task.completed ? 'border-red-200 bg-red-50' : ''}`}
            >
              {editingTask === task.id.toString() ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTaskData.text || ''}
                      onChange={(e) => setEditTaskData({ ...editTaskData, text: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                      placeholder="Task description"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={saveEditTask}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={cancelEditTask}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={editTaskData.priority || 'medium'}
                        onChange={(e) => setEditTaskData({ ...editTaskData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <select
                        value={editTaskData.assignedTo || 'both'}
                        onChange={(e) => setEditTaskData({ ...editTaskData, assignedTo: e.target.value as 'both' | 'spouse1' | 'spouse2' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="both">Both Spouses</option>
                        <option value="spouse1">{settings.spouse1?.name || 'Loading...'}</option>
                        <option value="spouse2">{settings.spouse2?.name || 'Loading...'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={editTaskData.dueDate || ''}
                        onChange={(e) => setEditTaskData({ ...editTaskData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        value={editTaskData.estimatedDuration || 30}
                        onChange={(e) => setEditTaskData({ ...editTaskData, estimatedDuration: parseInt(e.target.value) || 30 })}
                        min="5"
                        step="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={editTaskData.category || ''}
                        onChange={(e) => setEditTaskData({ ...editTaskData, category: e.target.value })}
                        placeholder="e.g., Work, Home, Health"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={editTaskData.notes || ''}
                      onChange={(e) => setEditTaskData({ ...editTaskData, notes: e.target.value })}
                      placeholder="Additional details..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      task.completed
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => updateTask(task.id, { text: e.target.value })}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)} {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAssignmentColor(task.assignedTo || 'both')}`}>
                          {getAssignmentIcon(task.assignedTo || 'both')} {getAssignmentLabel(task.assignedTo || 'both')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 ${
                          isOverdue(task.dueDate) && !task.completed ? 'text-red-600' : ''
                        }`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && !task.completed && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      )}
                      
                      {task.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(task.estimatedDuration)}
                        </div>
                      )}
                      
                      {task.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {task.category}
                        </div>
                      )}
                    </div>

                    {task.notes && (
                      <div className="mt-2 text-sm text-gray-600 flex items-start gap-1">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{task.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEditTask(task)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50 border-blue-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTask(task.id)}
                      className="text-red-600 hover:bg-red-50 border-red-200"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No tasks yet</p>
              <p className="text-sm">Add your first task above to get started</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
