import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SermonNoteForm } from './SermonNoteForm'
import { SermonNotesList } from './SermonNotesList'
import { Button } from '../ui/Button'
import { Plus, List } from 'lucide-react'

export const SermonNotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNoteSaved = () => {
    // Switch to list view and refresh
    setActiveTab('list')
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setActiveTab('form')}
          variant={activeTab === 'form' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
        <Button
          onClick={() => setActiveTab('list')}
          variant={activeTab === 'list' ? 'default' : 'outline'}
          className="flex items-center gap-2"
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
  )
}