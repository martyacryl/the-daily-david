import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSermonNotesStore } from '../../stores/sermonNotesStore'
import { SermonNoteFormData } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Card } from '../ui/Card'
import { Church, User, BookOpen, Calendar, FileText, Save } from 'lucide-react'

interface SermonNoteFormProps {
  onSuccess?: () => void
  initialData?: Partial<SermonNoteFormData & { date: string }>
  editingNoteId?: string
}

export const SermonNoteForm: React.FC<SermonNoteFormProps> = ({ 
  onSuccess, 
  initialData,
  editingNoteId 
}) => {
  const { 
    createNote, 
    updateNote, 
    loadChurches, 
    loadSpeakers, 
    churches, 
    speakers, 
    isLoading 
  } = useSermonNotesStore()

  const [formData, setFormData] = useState<SermonNoteFormData & { date: string }>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    churchName: initialData?.churchName || '',
    sermonTitle: initialData?.sermonTitle || '',
    speakerName: initialData?.speakerName || '',
    biblePassage: initialData?.biblePassage || '',
    notes: initialData?.notes || ''
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showChurchDropdown, setShowChurchDropdown] = useState(false)
  const [showSpeakerDropdown, setShowSpeakerDropdown] = useState(false)
  const [filteredChurches, setFilteredChurches] = useState<string[]>([])
  const [filteredSpeakers, setFilteredSpeakers] = useState<string[]>([])

  // Load churches and speakers on mount
  useEffect(() => {
    loadChurches()
    loadSpeakers()
  }, [loadChurches, loadSpeakers])

  // Update filtered lists when form data changes
  useEffect(() => {
    if (formData.churchName) {
      setFilteredChurches(
        churches.filter(church => 
          church.toLowerCase().includes(formData.churchName.toLowerCase())
        )
      )
    } else {
      setFilteredChurches(churches)
    }
  }, [formData.churchName, churches])

  useEffect(() => {
    if (formData.speakerName) {
      setFilteredSpeakers(
        speakers.filter(speaker => 
          speaker.toLowerCase().includes(formData.speakerName.toLowerCase())
        )
      )
    } else {
      setFilteredSpeakers(speakers)
    }
  }, [formData.speakerName, speakers])

  const handleInputChange = (field: keyof SermonNoteFormData | 'date', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleChurchSelect = (church: string) => {
    setFormData(prev => ({ ...prev, churchName: church }))
    setShowChurchDropdown(false)
  }

  const handleSpeakerSelect = (speaker: string) => {
    setFormData(prev => ({ ...prev, speakerName: speaker }))
    setShowSpeakerDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.churchName || !formData.sermonTitle || !formData.speakerName || !formData.biblePassage || !formData.notes) {
      return
    }

    setIsSaving(true)
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, formData)
      } else {
        await createNote(formData)
      }
      
      // Reset form if creating new note
      if (!editingNoteId) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          churchName: '',
          sermonTitle: '',
          speakerName: '',
          biblePassage: '',
          notes: ''
        })
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Error saving sermon note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-amber-400" />
            {editingNoteId ? 'Edit Sermon Note' : 'New Sermon Note'}
          </h2>
          <p className="text-green-200 text-lg">
            Record your sermon notes and insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Church Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-white font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Church Name */}
            <div className="space-y-2 relative">
              <label className="text-white font-medium flex items-center gap-2">
                <Church className="w-4 h-4 text-amber-400" />
                Church Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.churchName}
                  onChange={(e) => {
                    handleInputChange('churchName', e.target.value)
                    setShowChurchDropdown(true)
                  }}
                  onFocus={() => setShowChurchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowChurchDropdown(false), 200)}
                  placeholder="Enter church name..."
                  className="w-full"
                  required
                />
                {showChurchDropdown && filteredChurches.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredChurches.map((church, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleChurchSelect(church)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {church}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sermon Title and Speaker Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sermon Title */}
            <div className="space-y-2">
              <label className="text-white font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Sermon Title
              </label>
              <Input
                type="text"
                value={formData.sermonTitle}
                onChange={(e) => handleInputChange('sermonTitle', e.target.value)}
                placeholder="Enter sermon title..."
                className="w-full"
                required
              />
            </div>

            {/* Speaker Name */}
            <div className="space-y-2 relative">
              <label className="text-white font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Speaker Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.speakerName}
                  onChange={(e) => {
                    handleInputChange('speakerName', e.target.value)
                    setShowSpeakerDropdown(true)
                  }}
                  onFocus={() => setShowSpeakerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSpeakerDropdown(false), 200)}
                  placeholder="Enter speaker name..."
                  className="w-full"
                  required
                />
                {showSpeakerDropdown && filteredSpeakers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSpeakers.map((speaker, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSpeakerSelect(speaker)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {speaker}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bible Passage */}
          <div className="space-y-2">
            <label className="text-white font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Bible Passage
            </label>
            <Input
              type="text"
              value={formData.biblePassage}
              onChange={(e) => handleInputChange('biblePassage', e.target.value)}
              placeholder="e.g., John 3:16, Romans 8:28-30..."
              className="w-full"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-white font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Write your sermon notes here... What did you learn? What stood out to you? How will you apply this message?"
              className="w-full min-h-[200px]"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-8 py-3"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}