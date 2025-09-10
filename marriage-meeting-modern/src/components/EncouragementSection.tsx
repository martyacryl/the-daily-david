import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  MessageCircle,
  BookOpen,
  Lightbulb,
  Calendar
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { Input } from './ui/Input'

export interface EncouragementNote {
  id: number
  text: string
  type: 'encouragement' | 'bible' | 'reminder' | 'love' | 'general'
  createdAt: string
  isRead?: boolean
}

interface EncouragementSectionProps {
  notes: EncouragementNote[]
  onUpdate: (notes: EncouragementNote[]) => void
  className?: string
}

const noteTypes = [
  { id: 'encouragement', label: 'Encouragement', icon: Heart, color: 'text-pink-600' },
  { id: 'bible', label: 'Bible Verse', icon: BookOpen, color: 'text-blue-600' },
  { id: 'reminder', label: 'Reminder', icon: Calendar, color: 'text-orange-600' },
  { id: 'love', label: 'Love Note', icon: MessageCircle, color: 'text-red-600' },
  { id: 'general', label: 'General', icon: Lightbulb, color: 'text-gray-600' }
]

export const EncouragementSection: React.FC<EncouragementSectionProps> = ({ 
  notes, 
  onUpdate, 
  className = '' 
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newNote, setNewNote] = useState({
    text: '',
    type: 'encouragement' as EncouragementNote['type']
  })

  const addNote = () => {
    if (!newNote.text.trim()) return

    const note: EncouragementNote = {
      id: Date.now(),
      text: newNote.text.trim(),
      type: newNote.type,
      createdAt: new Date().toISOString(),
      isRead: false
    }

    onUpdate([note, ...notes])
    setNewNote({ text: '', type: 'encouragement' })
    setIsAdding(false)
  }

  const updateNote = (id: number, text: string, type: EncouragementNote['type']) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, text: text.trim(), type } : note
    )
    onUpdate(updatedNotes)
    setEditingId(null)
  }

  const deleteNote = (id: number) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    onUpdate(updatedNotes)
  }

  const markAsRead = (id: number) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, isRead: true } : note
    )
    onUpdate(updatedNotes)
  }

  const getTypeInfo = (type: EncouragementNote['type']) => {
    return noteTypes.find(t => t.id === type) || noteTypes[0]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Sort notes: unread first, then read, then filter by date (recent first)
  const sortedNotes = [...notes]
    .sort((a, b) => {
      // First sort by read status (unread first)
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      // Then sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .filter(note => {
      // Auto-archive notes older than 7 days
      const noteDate = new Date(note.createdAt)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return noteDate >= sevenDaysAgo
    })

  const unreadCount = sortedNotes.filter(note => !note.isRead).length
  const totalCount = sortedNotes.length

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Encouragement</h3>
          <span className="text-sm text-gray-500">({totalCount})</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              {unreadCount} new
            </span>
          )}
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white p-2 sm:px-3 sm:py-2"
          size="sm"
        >
          <Plus className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Add Note</span>
        </Button>
      </div>

      {/* Add Note Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 bg-pink-50 border-pink-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Add Encouragement</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false)
                      setNewNote({ text: '', type: 'encouragement' })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Note Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {noteTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => setNewNote(prev => ({ ...prev, type: type.id as LoveNote['type'] }))}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            newNote.type === type.id
                              ? 'bg-pink-100 text-pink-700 border border-pink-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <IconComponent className="w-3 h-3" />
                          {type.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Note Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <Textarea
                    value={newNote.text}
                    onChange={(e) => setNewNote(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Write your encouragement, Bible verse, reminder, or love note..."
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {newNote.text.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setNewNote({ text: '', type: 'encouragement' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addNote}
                    disabled={!newNote.text.trim()}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                  <Heart className="w-4 h-4 mr-1" />
                  Add Encouragement
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="space-y-2">
        <AnimatePresence>
          {sortedNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No encouragement yet</p>
              <p className="text-sm">Add your first note to encourage your spouse!</p>
            </motion.div>
          ) : (
            sortedNotes.map((note) => {
              const typeInfo = getTypeInfo(note.type)
              const IconComponent = typeInfo.icon
              const isEditing = editingId === note.id

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`relative transition-all duration-300 ${
                    !note.isRead 
                      ? 'ring-2 ring-pink-200 bg-pink-50 opacity-100' 
                      : 'opacity-60 border border-gray-100'
                  }`}
                >
                  <Card className={`p-4 transition-all duration-300 ${
                    !note.isRead ? 'border-pink-200' : 'border-gray-200'
                  }`}>
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* Edit Form */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Edit Note</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <div className="flex flex-wrap gap-2">
                            {noteTypes.map((type) => {
                              const TypeIcon = type.icon
                              return (
                                <button
                                  key={type.id}
                                  onClick={() => updateNote(note.id, note.text, type.id as LoveNote['type'])}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    note.type === type.id
                                      ? 'bg-pink-100 text-pink-700 border border-pink-300'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <TypeIcon className="w-3 h-3" />
                                  {type.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Text Input */}
                        <Textarea
                          value={note.text}
                          onChange={(e) => {
                            const updatedNotes = notes.map(n =>
                              n.id === note.id ? { ...n, text: e.target.value } : n
                            )
                            onUpdate(updatedNotes)
                          }}
                          className="min-h-[80px] resize-none"
                          maxLength={500}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => updateNote(note.id, note.text, note.type)}
                            className="bg-pink-600 hover:bg-pink-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Note Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className={`w-4 h-4 ${typeInfo.color}`} />
                            <span className={`text-sm font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(note.createdAt)}
                            </span>
                            {!note.isRead ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                New
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <Check className="w-3 h-3 mr-1" />
                                Read
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(note.id)}
                              className="p-1 h-6 w-6"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                              className="p-1 h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Note Content */}
                        <div className={`leading-relaxed whitespace-pre-wrap ${
                          note.isRead ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                          {note.text}
                        </div>

                        {/* Mark as Read Button */}
                        {!note.isRead && (
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(note.id)}
                              className="text-pink-600 border-pink-200 hover:bg-pink-50"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
