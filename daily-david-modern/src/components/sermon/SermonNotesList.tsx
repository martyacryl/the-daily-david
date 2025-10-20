import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { SermonNote } from '../../types'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
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
  FileText,
  Cross
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

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading sermon notes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Cross className="w-10 h-10 text-amber-400" />
            Sermon Notes
          </h1>
          <p className="text-green-200 text-lg">
            Review your spiritual journey and sermon insights
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search sermon notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'church' | 'speaker')}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="date">Sort by Date</option>
                <option value="church">Sort by Church</option>
                <option value="speaker">Sort by Speaker</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex items-center">
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">{filteredNotes.length}</h3>
            <p className="text-green-200 text-sm">Total Sermon Notes</p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">
              {new Set(notes.map(n => n.churchName)).size}
            </h3>
            <p className="text-green-200 text-sm">Unique Churches</p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">
              {new Set(notes.map(n => n.speakerName)).size}
            </h3>
            <p className="text-green-200 text-sm">Unique Speakers</p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">
              {notes.reduce((total, note) => total + note.notes.split(' ').length, 0)}
            </h3>
            <p className="text-green-200 text-sm">Total Words</p>
          </div>
        </div>

        {/* Export and Refresh Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={exportNotes}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button
            onClick={() => loadNotes()}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Cross className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No sermon notes found</h3>
              <p className="text-slate-500">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Start your first sermon note in the New Note section'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
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
                      
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {note.sermonTitle}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-amber-400 font-medium mb-3">
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
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <label className="text-white font-medium">Notes</label>
                        <Textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          onBlur={handleInputBlur}
                          rows={4}
                          className="w-full bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                          placeholder="Write your sermon notes here..."
                        />
                        {isSaving && (
                          <p className="text-sm text-amber-400">Saving...</p>
                        )}
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <p className="text-slate-300 whitespace-pre-wrap">{note.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}