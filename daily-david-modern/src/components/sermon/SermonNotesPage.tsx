import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SermonNoteForm } from './SermonNoteForm'
import { SermonNotesList } from './SermonNotesList'
import { Button } from '../ui/Button'
import { Plus, List, Cross } from 'lucide-react'

export const SermonNotesPage: React.FC = () => {
  console.log('Sermon Notes Page: Component mounted')
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNoteSaved = () => {
    // Switch to list view and refresh
    setActiveTab('list')
    setRefreshKey(prev => prev + 1)
    
    // Also call the global refresh function
    if ((window as any).refreshSermonNotes) {
      (window as any).refreshSermonNotes()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Cross className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
          Sermon Notes
        </h1>
        <p className="text-green-200 text-base md:text-lg px-4">
          Record and review your spiritual insights and teachings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <button
          onClick={() => {
            console.log('Sermon Notes Page: Switching to form view')
            setActiveTab('form')
          }}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'form' 
              ? 'bg-amber-500 text-white hover:bg-amber-600' 
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
        <button
          onClick={() => {
            console.log('Sermon Notes Page: Switching to list view')
            setActiveTab('list')
          }}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'list' 
              ? 'bg-amber-500 text-white hover:bg-amber-600' 
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
          }`}
        >
          <List className="w-4 h-4" />
          View Notes
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {console.log('Sermon Notes Page: Rendering tab content, activeTab:', activeTab)}
        {activeTab === 'form' ? (
          <SermonNoteForm onSuccess={handleNoteSaved} />
        ) : (
          <SermonNotesList key={refreshKey} />
        )}
      </motion.div>
    </div>
  )
}