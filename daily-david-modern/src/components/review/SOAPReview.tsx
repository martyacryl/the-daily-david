import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'
import { SOAPData, DailyEntry } from '../../types'
import { BookOpen, Search, Download, X, Edit3, Save } from 'lucide-react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

// Helper function to extract book name from scripture reference
const extractBook = (scripture: string): string => {
  if (!scripture) return ''
  const match = scripture.match(/^([A-Za-z0-9\s]+?)(?:\s*\d+)/)
  return match ? match[1].trim() : ''
}

interface SOAPReviewStats {
  totalSOAPs: number
  uniqueBooks: string[]
  totalWords: number
  averageWordsPerSOAP: number
  mostFrequentBooks: { book: string; count: number }[]
}

export const SOAPReview: React.FC = () => {
  const { entries, loadEntries, isLoading, createEntry } = useDailyStore()
  const { isAuthenticated } = useAuthStore()
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'book' | 'theme'>('date')
  
  // Editing state - following runbook pattern exactly
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [localThoughts, setLocalThoughts] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load entries on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries()
    }
  }, [isAuthenticated, loadEntries])

  // Filter and process SOAP entries - following runbook pattern
  const soapEntries = useMemo(() => {
    const filtered = entries.filter(entry => {
      const hasSOAP = entry.soap && entry.soap.scripture && entry.soap.scripture.trim()
      return hasSOAP
    })
    
    return filtered
      .map(entry => ({
        ...entry,
        soapData: entry.soap,
        additionalNotes: entry.soap?.thoughts || ''
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          case 'book':
            return extractBook(a.soapData.scripture).localeCompare(extractBook(b.soapData.scripture))
          case 'theme':
            return a.soapData.observation.localeCompare(b.soapData.observation)
          default:
            return 0
        }
      })
  }, [entries, sortBy])

  // Filter entries based on search and filters
  const filteredEntries = useMemo(() => {
    let filtered = soapEntries

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.soapData.scripture.toLowerCase().includes(term) ||
        entry.soapData.observation.toLowerCase().includes(term) ||
        entry.soapData.application.toLowerCase().includes(term) ||
        entry.soapData.prayer.toLowerCase().includes(term) ||
        (entry.additionalNotes && entry.additionalNotes.toLowerCase().includes(term))
      )
    }

    // Book filter
    if (selectedBook !== 'all') {
      filtered = filtered.filter(entry => 
        extractBook(entry.soapData.scripture).toLowerCase() === selectedBook.toLowerCase()
      )
    }

    return filtered
  }, [soapEntries, searchTerm, selectedBook])

  // Calculate statistics
  const stats = useMemo((): SOAPReviewStats => {
    const books = new Map<string, number>()
    let totalWords = 0

    filteredEntries.forEach(entry => {
      // Count books
      const book = extractBook(entry.soapData.scripture)
      if (book) {
        books.set(book, (books.get(book) || 0) + 1)
      }

      // Count words
      const words = [
        entry.soapData.scripture,
        entry.soapData.observation,
        entry.soapData.application,
        entry.soapData.prayer,
        entry.additionalNotes || ''
      ].join(' ').split(/\s+/).filter(word => word.length > 0)
      totalWords += words.length
    })

    const uniqueBooks = Array.from(books.keys())
    const mostFrequentBooks = Array.from(books.entries())
      .map(([book, count]) => ({ book, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalSOAPs: filteredEntries.length,
      uniqueBooks,
      totalWords,
      averageWordsPerSOAP: filteredEntries.length > 0 ? Math.round(totalWords / filteredEntries.length) : 0,
      mostFrequentBooks
    }
  }, [filteredEntries])

  // Get unique books for filter dropdown
  const uniqueBooks = useMemo(() => {
    const books = new Set<string>()
    soapEntries.forEach(entry => {
      const book = extractBook(entry.soapData.scripture)
      if (book) books.add(book)
    })
    return Array.from(books).sort()
  }, [soapEntries])

  // Handle input change - following runbook pattern
  const handleThoughtsChange = (value: string) => {
    setLocalThoughts(value)
  }

  // Handle save - following runbook pattern exactly
  const handleSave = async () => {
    if (!editingEntry || isSaving) return

    const entry = soapEntries.find(e => e.id === editingEntry)
    if (!entry) return

    // Only update if there's actually a change
    if (localThoughts !== (entry.additionalNotes || '')) {
      setIsSaving(true)
      try {
        console.log('SOAP Review: Starting save operation', {
          entryId: editingEntry,
          originalThoughts: entry.additionalNotes,
          newThoughts: localThoughts
        })

        // Create updated SOAP data with the new thoughts
        const updatedSOAP: SOAPData = {
          ...entry.soapData,
          thoughts: localThoughts
        }

        // Create complete entry data object - following runbook pattern
        const entryData = {
          date: entry.date,
          goals: entry.goals,
          gratitude: entry.gratitude,
          soap: updatedSOAP,
          dailyIntention: entry.dailyIntention,
          leadershipRating: entry.leadershipRating,
          checkIn: entry.checkIn,
          readingPlan: entry.readingPlan,
          deletedGoalIds: entry.deletedGoalIds || [],
          completed: entry.completed
        }

        console.log('SOAP Review: Calling createEntry with data:', entryData)

        // Use the store's createEntry method
        await createEntry(entryData)
        
        console.log('SOAP Review: Successfully saved thoughts')
        
        // Clear editing state
        setEditingEntry(null)
        setLocalThoughts('')
        
      } catch (error) {
        console.error('SOAP Review: Save error:', error)
        // Could add toast notification here
      } finally {
        setIsSaving(false)
      }
    } else {
      // No changes, just clear editing state
      setEditingEntry(null)
      setLocalThoughts('')
    }
  }

  // Start editing - following runbook pattern
  const startEditing = (entry: any) => {
    setEditingEntry(entry.id)
    setLocalThoughts(entry.additionalNotes || '')
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntry(null)
    setLocalThoughts('')
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedBook('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedBook !== 'all'

  // Export functions
  const exportSOAPs = () => {
    const exportData = filteredEntries.map(entry => ({
      date: entry.date,
      scripture: entry.soapData.scripture,
      observation: entry.soapData.observation,
      application: entry.soapData.application,
      prayer: entry.soapData.prayer,
      additionalNotes: entry.additionalNotes
    }))
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `soap-review-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading SOAP entries...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-amber-400" />
            SOAP Review
          </h1>
          <p className="text-green-200 text-lg">
            Review your Bible study journey and add additional insights
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
                  placeholder="Search SOAP entries..."
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

            {/* Book Filter */}
            <div>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="all">All Books</option>
                {uniqueBooks.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'book' | 'theme')}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="date">Sort by Date</option>
                <option value="book">Sort by Book</option>
                <option value="theme">Sort by Theme</option>
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
            <h3 className="text-amber-400 text-2xl font-bold">{stats.totalSOAPs}</h3>
            <p className="text-green-200 text-sm">Total SOAP Studies</p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">{stats.uniqueBooks.length}</h3>
            <p className="text-green-200 text-sm">Unique Books</p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">{stats.totalWords}</h3>
            <p className="text-green-200 text-sm">Total Words</p>
          </div>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-amber-400 text-2xl font-bold">{stats.averageWordsPerSOAP}</h3>
            <p className="text-green-200 text-sm">Avg Words per SOAP</p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={exportSOAPs}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
        </div>

        {/* SOAP Entries */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No SOAP entries found</h3>
              <p className="text-slate-500">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Start your first SOAP study in the Daily Entry section'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {entry.soapData.scripture}
                    </h3>
                    <p className="text-green-200 text-sm">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {editingEntry !== entry.id && (
                    <button
                      onClick={() => startEditing(entry)}
                      className="text-slate-400 hover:text-amber-400 transition-colors"
                      disabled={isSaving}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Scripture */}
                  <div className="border-l-4 border-l-green-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white">Scripture</h4>
                    <p className="text-white">{entry.soapData.scripture}</p>
                  </div>

                  {/* Observation */}
                  <div className="border-l-4 border-l-blue-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white">Observation</h4>
                    <p className="text-white">{entry.soapData.observation}</p>
                  </div>

                  {/* Application */}
                  <div className="border-l-4 border-l-purple-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white">Application</h4>
                    <p className="text-white">{entry.soapData.application}</p>
                  </div>

                  {/* Prayer */}
                  <div className="border-l-4 border-l-orange-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white">Prayer</h4>
                    <p className="text-white">{entry.soapData.prayer}</p>
                  </div>
                </div>

                {/* Additional Notes Section - following runbook pattern exactly */}
                <div className="mt-6 border-t border-slate-700 pt-6">
                  <h4 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-amber-400" />
                    Additional Notes
                    {isSaving && editingEntry === entry.id && (
                      <span className="text-xs text-green-400 ml-2">Saving...</span>
                    )}
                  </h4>
                  
                  {editingEntry === entry.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={localThoughts}
                        onChange={(e) => handleThoughtsChange(e.target.value)}
                        placeholder="Add additional insights, reflections, or notes about this SOAP study..."
                        className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200 resize-none"
                        rows={4}
                        autoFocus
                        disabled={isSaving}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="min-h-[100px] px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white cursor-pointer hover:border-slate-500 transition-colors"
                      onClick={() => startEditing(entry)}
                    >
                      {entry.additionalNotes || (
                        <span className="text-slate-400 italic">
                          Click here to add additional notes...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}