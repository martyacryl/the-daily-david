import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'
import { SOAPData, DailyEntry } from '../../types'
import { BookOpen, Search, Filter, Download, X, ChevronDown, ChevronUp, Edit3, Save, X as CancelIcon } from 'lucide-react'
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
  uniqueVerses: number
  totalWords: number
  averageWordsPerSOAP: number
  mostFrequentBooks: { book: string; count: number }[]
  completionRate: number
  recentActivity: { date: string; count: number }[]
  mostStudiedVerses: { verse: string; count: number }[]
}

export const SOAPReview: React.FC = () => {
  const { entries, loadEntries, isLoading } = useDailyStore()
  const { isAuthenticated, user } = useAuthStore()
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState('all')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'thisMonth' | 'thisYear'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'book' | 'theme'>('date')
  
  // Editing state - using the same pattern as DailyEntry
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [localThoughts, setLocalThoughts] = useState('')
  const [localSOAP, setLocalSOAP] = useState<SOAPData | null>(null)
  

  // Load entries on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries()
    }
  }, [isAuthenticated, loadEntries])


  // Filter and process SOAP entries - same pattern as daily entry
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

    // Date filter
    const now = new Date()
    switch (filterBy) {
      case 'recent':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(entry => new Date(entry.date) >= weekAgo)
        break
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        filtered = filtered.filter(entry => new Date(entry.date) >= monthStart)
        break
      case 'thisYear':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        filtered = filtered.filter(entry => new Date(entry.date) >= yearStart)
        break
    }

    return filtered
  }, [soapEntries, searchTerm, selectedBook, filterBy])

  // Calculate statistics based on filtered entries
  const stats = useMemo((): SOAPReviewStats => {
    const books = new Map<string, number>()
    const verses = new Map<string, number>()
    let totalWords = 0
    const recentActivityMap = new Map<string, number>()
    const mostStudiedVersesMap = new Map<string, number>()

    filteredEntries.forEach(entry => {
      // Count books
      const book = extractBook(entry.soapData.scripture)
      if (book) {
        books.set(book, (books.get(book) || 0) + 1)
      }

      // Count verses
      const verse = entry.soapData.scripture
      if (verse) {
        verses.set(verse, (verses.get(verse) || 0) + 1)
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

      // Recent activity
      const date = entry.date
      recentActivityMap.set(date, (recentActivityMap.get(date) || 0) + 1)

      // Most studied verses
      if (entry.soapData.scripture) {
        mostStudiedVersesMap.set(entry.soapData.scripture, (mostStudiedVersesMap.get(entry.soapData.scripture) || 0) + 1)
      }
    })

    const uniqueBooks = Array.from(books.keys())
    const mostFrequentBooks = Array.from(books.entries())
      .map(([book, count]) => ({ book, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const mostStudiedVerses = Array.from(mostStudiedVersesMap.entries())
      .map(([verse, count]) => ({ verse, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const recentActivity = Array.from(recentActivityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)

    return {
      totalSOAPs: filteredEntries.length,
      uniqueBooks,
      uniqueVerses: verses.size,
      totalWords,
      averageWordsPerSOAP: filteredEntries.length > 0 ? Math.round(totalWords / filteredEntries.length) : 0,
      mostFrequentBooks,
      completionRate: 100, // All entries with SOAP are considered completed
      recentActivity,
      mostStudiedVerses
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



  // Handle input change - EXACTLY like SOAPSection
  const handleThoughtsChange = (value: string) => {
    setLocalThoughts(value)
    if (localSOAP) {
      const newSOAP = { ...localSOAP, thoughts: value }
      setLocalSOAP(newSOAP)
    }
  }

  // Handle input blur - Use store update method
  const handleThoughtsBlur = async () => {
    if (!localSOAP || !editingEntry) return

    const entry = soapEntries.find(e => e.id === editingEntry)
    if (!entry) return

    // Only update if there's actually a change
    if (localSOAP.thoughts !== (entry.additionalNotes || '')) {
      try {
        const currentEntry = entries.find(e => e.id === editingEntry)
        if (!currentEntry) return

        // Create a complete entry data object for saving
        const entryData = {
          date: currentEntry.date,
          goals: currentEntry.goals,
          gratitude: currentEntry.gratitude,
          soap: localSOAP, // This includes the updated thoughts
          dailyIntention: currentEntry.dailyIntention,
          leadershipRating: currentEntry.leadershipRating,
          checkIn: currentEntry.checkIn,
          readingPlan: currentEntry.readingPlan,
          deletedGoalIds: currentEntry.deletedGoalIds || [],
          completed: currentEntry.completed
        }

        // Use the store's createEntry method which will handle the save/update logic
        await useDailyStore.getState().createEntry(entryData)
        
      } catch (error) {
        console.error('Save error:', error)
      }
    }

    // Clear editing state
    setEditingEntry(null)
    setLocalThoughts('')
    setLocalSOAP(null)
  }

  // Start editing - EXACTLY like DailyEntry
  const startEditing = (entry: any) => {
    setEditingEntry(entry.id)
    setLocalThoughts(entry.additionalNotes || '')
    setLocalSOAP({
      ...entry.soapData,
      thoughts: entry.additionalNotes || ''
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedBook('all')
    setFilterBy('all')
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedBook !== 'all' || filterBy !== 'all'

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

  const exportSOAPsAsMarkdown = () => {
    const markdown = filteredEntries.map(entry => {
      const date = new Date(entry.date).toLocaleDateString()
      return `# ${entry.soapData.scripture} - ${date}

**Observation:** ${entry.soapData.observation}

**Application:** ${entry.soapData.application}

**Prayer:** ${entry.soapData.prayer}

${entry.additionalNotes ? `**Additional Notes:** ${entry.additionalNotes}` : ''}

---
`
    }).join('\n')
    
    const dataBlob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `soap-review-${new Date().toISOString().split('T')[0]}.md`
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-2">
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

            {/* Date Filter */}
            <div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'thisMonth' | 'thisYear')}
                className="w-full px-2 py-2 text-sm bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="all">All Time</option>
                <option value="recent">Recent (7 days)</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
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

        {/* Export Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={exportSOAPs}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button
            onClick={exportSOAPsAsMarkdown}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Markdown
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
                  <button
                    onClick={() => startEditing(entry)}
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Scripture */}
                  <div className="border-l-4 border-l-green-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                      Scripture
                    </h4>
                    <p className="text-green-200 text-sm mb-4">Today's Bible passage</p>
                    <p className="text-white">{entry.soapData.scripture}</p>
                  </div>

                  {/* Observation */}
                  <div className="border-l-4 border-l-blue-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                      Observation
                    </h4>
                    <p className="text-green-200 text-sm mb-4">What does the passage say?</p>
                    <p className="text-white">{entry.soapData.observation}</p>
                  </div>

                  {/* Application */}
                  <div className="border-l-4 border-l-purple-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                      Application
                    </h4>
                    <p className="text-green-200 text-sm mb-4">How does this apply to your life?</p>
                    <p className="text-white">{entry.soapData.application}</p>
                  </div>

                  {/* Prayer */}
                  <div className="border-l-4 border-l-orange-500 bg-slate-700/50 rounded-r-lg p-4">
                    <h4 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                      Prayer
                    </h4>
                    <p className="text-green-200 text-sm mb-4">Your response to God</p>
                    <p className="text-white">{entry.soapData.prayer}</p>
                  </div>
                </div>

                {/* Additional Notes Section - exactly like DailyEntry pattern */}
                <div className="mt-6 border-t border-slate-700 pt-6">
                  <h4 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-amber-400" />
                    Additional Notes
                  </h4>
                  
                  {editingEntry === entry.id ? (
                    <div>
                      <p className="text-green-400 text-sm mb-2">Editing mode - click away to save</p>
                      <Textarea
                        value={localThoughts}
                        onChange={(e) => handleThoughtsChange(e.target.value)}
                        onBlur={handleThoughtsBlur}
                        placeholder="Add additional insights, reflections, or notes about this SOAP study..."
                        className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200 resize-none"
                        rows={4}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="relative">
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