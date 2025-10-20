import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SermonNoteForm } from './SermonNoteForm'
import { SermonNotesList } from './SermonNotesList'
import { Button } from '../ui/Button'
import { FileText, Plus, List } from 'lucide-react'

export const SermonNotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new')
  const [editingNote, setEditingNote] = useState<any>(null)

  const handleNoteCreated = () => {
    setActiveTab('list')
  }

  const handleEditNote = (note: any) => {
    setEditingNote(note)
    setActiveTab('new')
  }

  const handleEditComplete = () => {
    setEditingNote(null)
    setActiveTab('list')
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
            Record and review your sermon notes
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-lg p-1 flex">
            <Button
              onClick={() => setActiveTab('new')}
              variant={activeTab === 'new' ? 'default' : 'ghost'}
              className={`flex items-center gap-2 px-6 py-3 ${
                activeTab === 'new' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              New Note
            </Button>
            <Button
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'default' : 'ghost'}
              className={`flex items-center gap-2 px-6 py-3 ${
                activeTab === 'list' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              View All Notes
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'new' ? (
            <SermonNoteForm
              onSuccess={handleNoteCreated}
              initialData={editingNote}
              editingNoteId={editingNote?.id}
            />
          ) : (
            <SermonNotesList onEditNote={handleEditNote} />
          )}
        </motion.div>
      </div>
    </div>
  )
}