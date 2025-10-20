import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SermonNoteForm } from './SermonNoteForm'
import { SermonNotesList } from './SermonNotesList'
import { Button } from '../ui/Button'
import { Plus, List, Cross } from 'lucide-react'

export const SermonNotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNoteSaved = () => {
    // Switch to list view and refresh
    setActiveTab('list')
    setRefreshKey(prev => prev + 1)
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
            Record and review your spiritual insights and teachings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('form')}
            variant={activeTab === 'form' ? 'default' : 'outline'}
            className="flex items-center gap-2 px-6 py-3"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
          <Button
            onClick={() => setActiveTab('list')}
            variant={activeTab === 'list' ? 'default' : 'outline'}
            className="flex items-center gap-2 px-6 py-3"
          >
            <List className="w-4 h-4" />
            View Notes
          </Button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'form' ? (
            <SermonNoteForm onSuccess={handleNoteSaved} />
          ) : (
            <SermonNotesList key={refreshKey} />
          )}
        </motion.div>
      </div>
    </div>
  )
}