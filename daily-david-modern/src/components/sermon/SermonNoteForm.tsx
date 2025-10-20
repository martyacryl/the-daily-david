import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { SermonNoteFormData } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Card } from '../ui/Card'
import { Church, User, BookOpen, Calendar, FileText, Save, Cross } from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

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
  const { user, token } = useAuthStore()

  const [formData, setFormData] = useState<SermonNoteFormData & { date: string }>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    churchName: initialData?.churchName || '',
    sermonTitle: initialData?.sermonTitle || '',
    speakerName: initialData?.speakerName || '',
    biblePassage: initialData?.biblePassage || '',
    notes: initialData?.notes || ''
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: keyof SermonNoteFormData | 'date', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Auto-save function - following SOAP Review pattern exactly
  const autoSaveToAPI = async (noteData: any) => {
    if (!user?.id || !token) return
    
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
      
    } catch (error) {
      console.error('Sermon Notes: Auto-save error:', error)
    }
  }

  // Handle auto-save - following SOAP Review pattern exactly
  useEffect(() => {
    const handleAutoSave = async () => {
      if (formData.churchName && formData.sermonTitle && formData.speakerName && formData.biblePassage && formData.notes) {
        setIsSaving(true)
        try {
          await autoSaveToAPI(formData)
          
          // Reset form after successful save
          setFormData({
            date: new Date().toISOString().split('T')[0],
            churchName: '',
            sermonTitle: '',
            speakerName: '',
            biblePassage: '',
            notes: ''
          })
          
          onSuccess?.()
          
        } catch (error) {
          console.error('Sermon Notes: Auto-save error:', error)
        } finally {
          setIsSaving(false)
        }
      }
    }

    window.addEventListener('triggerSermonNoteSave', handleAutoSave)
    return () => window.removeEventListener('triggerSermonNoteSave', handleAutoSave)
  }, [formData, onSuccess, user, token])

  // Handle input blur - trigger auto-save following SOAP Review pattern exactly
  const handleInputBlur = () => {
    // Trigger auto-save using the same pattern as SOAP Review
    window.dispatchEvent(new CustomEvent('triggerSermonNoteSave'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.churchName || !formData.sermonTitle || !formData.speakerName || !formData.biblePassage || !formData.notes) {
      return
    }

    // Trigger auto-save instead of manual save
    window.dispatchEvent(new CustomEvent('triggerSermonNoteSave'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Cross className="w-10 h-10 text-amber-400" />
            {editingNoteId ? 'Edit Sermon Note' : 'New Sermon Note'}
          </h1>
          <p className="text-green-200 text-lg">
            {editingNoteId ? 'Update your sermon notes' : 'Record your spiritual insights and teachings'}
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    onBlur={handleInputBlur}
                    className="w-full bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                    required
                  />
                </div>

                {/* Church Name */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Church className="w-4 h-4 text-amber-400" />
                    Church Name
                  </label>
                  <Input
                    type="text"
                    value={formData.churchName}
                    onChange={(e) => handleInputChange('churchName', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter church name..."
                    className="w-full bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                    required
                  />
                </div>

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
                    onBlur={handleInputBlur}
                    placeholder="Enter sermon title..."
                    className="w-full bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                    required
                  />
                </div>

                {/* Speaker Name */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    Speaker Name
                  </label>
                  <Input
                    type="text"
                    value={formData.speakerName}
                    onChange={(e) => handleInputChange('speakerName', e.target.value)}
                    onBlur={handleInputBlur}
                    placeholder="Enter speaker name..."
                    className="w-full bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                    required
                  />
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
                  onBlur={handleInputBlur}
                  placeholder="e.g., John 3:16, Romans 8:28-30..."
                  className="w-full bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
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
                  onBlur={handleInputBlur}
                  placeholder="Write your sermon notes here... What did you learn? What stood out to you? How will you apply this message?"
                  className="w-full min-h-[200px] bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isSaving || !formData.churchName || !formData.sermonTitle || !formData.speakerName || !formData.biblePassage || !formData.notes}
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}