import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { SermonNote } from '../../types'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Card } from '../ui/Card'
import { 
  Search, 
  Download, 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  Church, 
  User, 
  BookOpen,
  FileText
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

// Helper function to format dates
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Helper function to parse date string
const parseDateString = (dateString: string): Date => {
  return new Date(dateString)
}

interface SermonNotesListProps {
  onEditNote?: (note: SermonNote) => void
}

export const SermonNotesList: React.FC<SermonNotesListProps> = ({ onEditNote }) => {
  const { token } = useAuthStore()
  
  // State
  const [notes, setNotes] = useState<SermonNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'church' | 'speaker'>('date')
  
  // Simple editing state - following SOAP Review pattern exactly
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load notes on component mount
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    if (!token) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/sermon-notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to load sermon notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save function - following SOAP Review pattern exactly
  const autoSaveToAPI = async (noteData: any) => {
    if (!token) return
    
    try {
      console.log('Sermon Notes: Auto-saving to API:', noteData)
      
      const response = await fetch(`${API_BASE_URL}/api/sermon-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Sermon Notes: Auto-save successful:', data)
      
      // Reload notes after a small delay to ensure data is updated
      setTimeout(async () => {
        await loadNotes()
      }, 100)
      
    } catch (error) {
      console.error('Sermon Notes: Auto-save error:', error)
    }
  }

  // Handle auto-save - following SOAP Review pattern exactly
  useEffect(() => {
    const handleAutoSave = async () => {
      if (editingNoteId && editingNotes !== (notes.find(n => n.id === editingNoteId)?.notes || '')) {
        const note = notes.find(n => n.id === editingNoteId)
        if (note) {
          setIsSaving(true)
          try {
            // Create updated note data with the new notes
            const updatedNote = {
              ...note,
              notes: editingNotes
            }

            await autoSaveToAPI(updatedNote)
            
            // Clear editing state
            setEditingNoteId(null)
            setEditingNotes('')
            
          } catch (error) {
            console.error('Sermon Notes: Auto-save error:', error)
          } finally {
            setIsSaving(false)
          }
        }
      }
    }

    window.addEventListener('triggerSermonNoteSave', handleAutoSave)
    return () => window.removeEventListener('triggerSermonNoteSave', handleAutoSave)
  }, [editingNoteId, editingNotes, notes, token])

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(note => 
        note.churchName.toLowerCase().includes(term) ||
        note.sermonTitle.toLowerCase().includes(term) ||
        note.speakerName.toLowerCase().includes(term) ||
        note.biblePassage.toLowerCase().includes(term) ||
        note.notes.toLowerCase().includes(term)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'church':
          return a.churchName.localeCompare(b.churchName)
        case 'speaker':
          return a.speakerName.localeCompare(b.speakerName)
        default:
          return 0
      }
    })

    return filtered
  }, [notes, searchTerm, sortBy])

  const handleDeleteNote = async (noteId: string) => {
    if (!token) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/sermon-notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleEditNote = (note: SermonNote) => {
    setEditingNoteId(note.id)
    setEditingNotes(note.notes)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingNotes('')
  }

  const handleInputBlur = () => {
    // Trigger auto-save using the same pattern as SOAP Review
    window.dispatchEvent(new CustomEvent('triggerSermonNoteSave'))
  }

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sermon-notes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Sermon Notes ({filteredNotes.length})
          </h2>
          <p className="text-gray-600">Review and manage your sermon notes</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportNotes}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'church' | 'speaker')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="church">Sort by Church</option>
            <option value="speaker">Sort by Speaker</option>
          </select>
        </div>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sermon notes found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first sermon note'}
            </p>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(parseDateString(note.date))}
                      </span>
                      <span className="flex items-center gap-1">
                        <Church className="w-4 h-4" />
                        {note.churchName}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {note.speakerName}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {note.sermonTitle}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-blue-600 font-medium mb-3">
                      <BookOpen className="w-4 h-4" />
                      {note.biblePassage}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {editingNoteId === note.id ? (
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEditNote(note)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <Textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        onBlur={handleInputBlur}
                        rows={4}
                        className="w-full"
                        placeholder="Write your sermon notes here..."
                      />
                      {isSaving && (
                        <p className="text-sm text-blue-600">Saving...</p>
                      )}
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{note.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}