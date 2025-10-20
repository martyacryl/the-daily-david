import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSermonNotesStore } from '../../stores/sermonNotesStore'
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
  FileText,
  Filter
} from 'lucide-react'

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
  const { 
    notes, 
    isLoading, 
    loadNotes, 
    deleteNote, 
    loadStats, 
    stats,
    churches,
    speakers,
    loadChurches,
    loadSpeakers
  } = useSermonNotesStore()

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChurch, setSelectedChurch] = useState('all')
  const [selectedSpeaker, setSelectedSpeaker] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'church' | 'speaker' | 'title'>('date')
  
  // Editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadNotes()
    loadStats()
    loadChurches()
    loadSpeakers()
  }, [loadNotes, loadStats, loadChurches, loadSpeakers])

  // Filter and process notes
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

    // Church filter
    if (selectedChurch !== 'all') {
      filtered = filtered.filter(note => 
        note.churchName === selectedChurch
      )
    }

    // Speaker filter
    if (selectedSpeaker !== 'all') {
      filtered = filtered.filter(note => 
        note.speakerName === selectedSpeaker
      )
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'church':
          return a.churchName.localeCompare(b.churchName)
        case 'speaker':
          return a.speakerName.localeCompare(b.speakerName)
        case 'title':
          return a.sermonTitle.localeCompare(b.sermonTitle)
        default:
          return 0
      }
    })
  }, [notes, searchTerm, selectedChurch, selectedSpeaker, sortBy])

  // Auto-save function
  const autoSaveToAPI = async (noteId: string, updatedNotes: string) => {
    try {
      const { updateNote } = useSermonNotesStore.getState()
      await updateNote(noteId, { notes: updatedNotes })
    } catch (error) {
      console.error('Auto-save error:', error)
    }
  }

  // Handle auto-save
  useEffect(() => {
    const handleAutoSave = async () => {
      if (editingNoteId && editingNotes !== (notes.find(n => n.id === editingNoteId)?.notes || '')) {
        setIsSaving(true)
        try {
          await autoSaveToAPI(editingNoteId, editingNotes)
          setEditingNoteId(null)
          setEditingNotes('')
        } catch (error) {
          console.error('Auto-save error:', error)
        } finally {
          setIsSaving(false)
        }
      }
    }

    window.addEventListener('triggerSermonNoteSave', handleAutoSave)
    return () => window.removeEventListener('triggerSermonNoteSave', handleAutoSave)
  }, [editingNoteId, editingNotes, notes])

  // Handle input change
  const handleNotesChange = (value: string) => {
    setEditingNotes(value)
  }

  // Handle blur - trigger auto-save
  const handleNotesBlur = () => {
    window.dispatchEvent(new CustomEvent('triggerSermonNoteSave'))
  }

  // Start editing
  const startEditing = (note: SermonNote) => {
    setEditingNoteId(note.id)
    setEditingNotes(note.notes)
  }

  // Handle delete
  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this sermon note?')) {
      await deleteNote(noteId)
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedChurch('all')
    setSelectedSpeaker('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedChurch !== 'all' || selectedSpeaker !== 'all'

  // Export functions
  const exportNotes = () => {
    const exportData = filteredNotes.map(note => ({
      date: note.date,
      churchName: note.churchName,
      sermonTitle: note.sermonTitle,
      speakerName: note.speakerName,
      biblePassage: note.biblePassage,
      notes: note.notes,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }))
    
    const dataStr = JSON.stringify(exportData, null, 2)
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
            <FileText className="w-10 h-10 text-amber-400" />
            Sermon Notes
          </h1>
          <p className="text-green-200 text-lg">
            Review and manage your sermon notes
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

            {/* Church Filter */}
            <div>
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="all">All Churches</option>
                {churches.map(church => (
                  <option key={church} value={church}>{church}</option>
                ))}
              </select>
            </div>

            {/* Speaker Filter */}
            <div>
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="all">All Speakers</option>
                {speakers.map(speaker => (
                  <option key={speaker} value={speaker}>{speaker}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'church' | 'speaker' | 'title')}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="date">Sort by Date</option>
                <option value="church">Sort by Church</option>
                <option value="speaker">Sort by Speaker</option>
                <option value="title">Sort by Title</option>
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
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-amber-400 text-2xl font-bold">{stats.totalNotes}</h3>
              <p className="text-green-200 text-sm">Total Notes</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-amber-400 text-2xl font-bold">{stats.uniqueChurches.length}</h3>
              <p className="text-green-200 text-sm">Unique Churches</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-amber-400 text-2xl font-bold">{stats.uniqueSpeakers.length}</h3>
              <p className="text-green-200 text-sm">Unique Speakers</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-amber-400 text-2xl font-bold">{stats.totalWords}</h3>
              <p className="text-green-200 text-sm">Total Words</p>
            </Card>
          </div>
        )}

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

        {/* Sermon Notes */}
        <div className="space-y-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
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
              >
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {note.sermonTitle}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-green-200">
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
                    </div>
                    <div className="flex gap-2">
                      {editingNoteId !== note.id && (
                        <button
                          onClick={() => startEditing(note)}
                          className="text-slate-400 hover:text-amber-400 transition-colors"
                          disabled={isSaving}
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Bible Passage */}
                  <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border-l-4 border-l-amber-500">
                    <h4 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-400" />
                      Bible Passage
                    </h4>
                    <p className="text-white">{note.biblePassage}</p>
                  </div>

                  {/* Notes Section */}
                  <div className="border-t border-slate-700 pt-6">
                    <h4 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      Notes
                      {isSaving && editingNoteId === note.id && (
                        <span className="text-xs text-green-400 ml-2">Auto-saving...</span>
                      )}
                    </h4>
                    
                    {editingNoteId === note.id ? (
                      <Textarea
                        value={editingNotes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Write your sermon notes here..."
                        className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200 resize-none"
                        rows={6}
                        autoFocus
                        disabled={isSaving}
                      />
                    ) : (
                      <div 
                        className="min-h-[150px] px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white cursor-pointer hover:border-slate-500 transition-colors whitespace-pre-wrap"
                        onClick={() => startEditing(note)}
                      >
                        {note.notes || (
                          <span className="text-slate-400 italic">
                            Click here to add notes...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}