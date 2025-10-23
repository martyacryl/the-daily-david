import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bibleService } from '../../lib/bibleService'
import { BibleBook, FetchedVerse } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { BookOpen, Search, Copy, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface BibleVerseSelectorProps {
  onVersesSelected: (verses: FetchedVerse[]) => void
  onInsertIntoPassage: (reference: string) => void
}

export const BibleVerseSelector: React.FC<BibleVerseSelectorProps> = ({
  onVersesSelected,
  onInsertIntoPassage
}) => {
  const [books, setBooks] = useState<BibleBook[]>([])
  const [versions, setVersions] = useState<any[]>([])
  const [selectedBook, setSelectedBook] = useState<string>('GEN')
  const [selectedVersion, setSelectedVersion] = useState<string>('de4e12af7f28f599-02') // ESV
  const [chapter, setChapter] = useState<number | ''>('')
  const [verseStart, setVerseStart] = useState<number | ''>('')
  const [verseEnd, setVerseEnd] = useState<number | ''>('')
  const [fetchedVerses, setFetchedVerses] = useState<FetchedVerse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchParams, setLastFetchParams] = useState<{
    book: string
    chapter: number
    verseStart: number
    verseEnd: number
    version: string
  } | null>(null)

  // Load books and versions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [booksData, versionsData] = await Promise.all([
          bibleService.getBibleBooks(),
          bibleService.getBibleVersions()
        ])
        setBooks(booksData)
        setVersions(versionsData)
        
        // Restore persisted verses from localStorage
        const savedVerses = localStorage.getItem('sermon-notes-fetched-verses')
        const savedParams = localStorage.getItem('sermon-notes-fetch-params')
        
        if (savedVerses && savedParams) {
          try {
            const verses = JSON.parse(savedVerses)
            const params = JSON.parse(savedParams)
            setFetchedVerses(verses)
            setLastFetchParams(params)
            setIsExpanded(true)
            console.log('Restored verses from localStorage:', verses)
          } catch (error) {
            console.error('Error parsing saved verses:', error)
            // Clear invalid data
            localStorage.removeItem('sermon-notes-fetched-verses')
            localStorage.removeItem('sermon-notes-fetch-params')
          }
        }
      } catch (error) {
        console.error('Error loading Bible data:', error)
        setError('Failed to load Bible books')
      }
    }
    loadData()
  }, [])

  // Update chapter and verse limits when book changes
  useEffect(() => {
    const book = books.find(b => b.id === selectedBook)
    if (book) {
      setChapter('')
      setVerseStart('')
      setVerseEnd('')
    }
  }, [selectedBook, books])

  const handleFetchVerses = async () => {
    if (!selectedBook || chapter === '' || verseStart === '' || verseEnd === '') {
      setError('Please fill in all fields')
      return
    }

    const startVerse = Number(verseStart)
    const endVerse = Number(verseEnd)
    const chapterNum = Number(chapter)

    if (startVerse > endVerse) {
      setError('Start verse must be less than or equal to end verse')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const verses = await bibleService.getVerseRange(
        selectedVersion,
        selectedBook,
        chapterNum,
        startVerse,
        endVerse
      )

      if (verses.length === 0) {
        setError('No verses found for the selected range')
        return
      }

      // Save to localStorage for persistence
      const fetchParams = {
        book: selectedBook,
        chapter: chapterNum,
        verseStart: startVerse,
        verseEnd: endVerse,
        version: selectedVersion
      }
      
      localStorage.setItem('sermon-notes-fetched-verses', JSON.stringify(verses))
      localStorage.setItem('sermon-notes-fetch-params', JSON.stringify(fetchParams))
      
      setFetchedVerses(verses)
      setLastFetchParams(fetchParams)
      onVersesSelected(verses)
      setIsExpanded(true)
      
      console.log('Saved verses to localStorage:', verses)
    } catch (error) {
      console.error('Error fetching verses:', error)
      setError('Failed to fetch verses. Please check your selection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyVerses = async () => {
    if (fetchedVerses.length === 0) return

    const text = fetchedVerses.map(v => `${v.reference}: ${v.content}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy verses:', error)
    }
  }

  const handleInsertIntoPassage = () => {
    if (fetchedVerses.length === 0) return

    // Get the book name from the selected book
    const bookName = books.find(b => b.id === selectedBook)?.name || selectedBook
    
    // Use the current input values or fall back to last fetch params
    const currentChapter = chapter !== '' ? chapter : (lastFetchParams?.chapter || 1)
    const currentStart = verseStart !== '' ? verseStart : (lastFetchParams?.verseStart || 1)
    const currentEnd = verseEnd !== '' ? verseEnd : (lastFetchParams?.verseEnd || 1)
    
    const reference = fetchedVerses.length === 1 
      ? `${bookName} ${currentChapter}:${currentStart}`
      : `${bookName} ${currentChapter}:${currentStart}-${currentEnd}`
    
    console.log('Inserting reference:', reference)
    onInsertIntoPassage(reference)
  }

  const handleClearVerses = () => {
    setFetchedVerses([])
    setLastFetchParams(null)
    setIsExpanded(false)
    localStorage.removeItem('sermon-notes-fetched-verses')
    localStorage.removeItem('sermon-notes-fetch-params')
    console.log('Cleared verses from localStorage')
  }

  const selectedBookData = books.find(b => b.id === selectedBook)
  const maxChapter = selectedBookData?.chapters || 1

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Select Bible Verses
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Bible Version */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Bible Version</label>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 cursor-pointer"
          >
            {versions.map(version => (
              <option key={version.id} value={version.id}>
                {version.name} ({version.abbreviation})
              </option>
            ))}
          </select>
        </div>

        {/* Book, Chapter, and Verse Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Book Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Book</label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 cursor-pointer"
            >
              <optgroup label="Old Testament">
                {books.filter(b => b.testament === 'old').map(book => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="New Testament">
                {books.filter(b => b.testament === 'new').map(book => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Chapter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Chapter</label>
            <Input
              type="number"
              min="1"
              max={maxChapter}
              value={chapter}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setChapter('')
                } else {
                  const num = parseInt(value)
                  if (!isNaN(num)) {
                    setChapter(Math.max(1, Math.min(maxChapter, num)))
                  }
                }
              }}
              placeholder="Enter chapter"
              className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>

          {/* Start Verse */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Start Verse</label>
            <Input
              type="number"
              min="1"
              value={verseStart}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setVerseStart('')
                } else {
                  const num = parseInt(value)
                  if (!isNaN(num)) {
                    setVerseStart(Math.max(1, num))
                  }
                }
              }}
              placeholder="Start"
              className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>

          {/* End Verse */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">End Verse</label>
            <Input
              type="number"
              min={typeof verseStart === 'number' ? verseStart : 1}
              value={verseEnd}
              onChange={(e) => {
                const value = e.target.value
                if (value === '') {
                  setVerseEnd('')
                } else {
                  const num = parseInt(value)
                  if (!isNaN(num)) {
                    const minValue = typeof verseStart === 'number' ? verseStart : 1
                    setVerseEnd(Math.max(minValue, num))
                  }
                }
              }}
              placeholder="End"
              className="w-full px-4 py-3 border-2 border-slate-600/50 rounded-lg bg-slate-700/60 text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Fetch Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleFetchVerses}
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Fetch Verses
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>

      {/* Fetched Verses Display */}
      <AnimatePresence>
        {isExpanded && fetchedVerses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-4"
          >
            <div className="bg-slate-900/50 border-2 border-amber-500/30 rounded-xl backdrop-blur-sm p-4 md:p-6">
              {/* Verse Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-amber-400 font-semibold text-sm md:text-base">
                    {fetchedVerses[0]?.reference}
                    {fetchedVerses.length > 1 && ` - ${fetchedVerses[fetchedVerses.length - 1]?.reference.split(':')[1]}`}
                  </h5>
                  {lastFetchParams && (
                    <p className="text-xs text-slate-400 mt-1">
                      Last fetched: {books.find(b => b.id === lastFetchParams.book)?.name} {lastFetchParams.chapter}:{lastFetchParams.verseStart}-{lastFetchParams.verseEnd}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyVerses}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={handleInsertIntoPassage}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Insert
                  </button>
                  <button
                    onClick={handleClearVerses}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Verse Content */}
              <div className="space-y-3">
                {fetchedVerses.map((verse) => (
                  <div key={verse.verseId} className="text-white leading-relaxed text-base md:text-lg">
                    <span className="text-amber-400 font-semibold text-sm">
                      {verse.reference.split(':')[1]} 
                    </span>
                    <span className="ml-2">{verse.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
