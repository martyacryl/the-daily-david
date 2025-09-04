
import { useState, useEffect } from 'react'
import { CheckInData, EmotionType } from '../../types'

interface CheckInSectionProps {
  checkIn: CheckInData
  onUpdate: (checkIn: CheckInData) => void
}

export function CheckInSection({ checkIn, onUpdate }: CheckInSectionProps) {
  const emotionOptions: { key: EmotionType; label: string }[] = [
    { key: 'sad', label: 'Sad' },
    { key: 'angry', label: 'Angry' },
    { key: 'scared', label: 'Scared' },
    { key: 'happy', label: 'Happy' },
    { key: 'excited', label: 'Excited' },
    { key: 'tender', label: 'Tender' }
  ]

  // Local state for emotions - initialize from props
  const [localEmotions, setLocalEmotions] = useState(checkIn.emotions || [])
  const [localFeeling, setLocalFeeling] = useState(checkIn.feeling || '')

  // Update local state when props change (on page load/navigation)
  useEffect(() => {
    console.log('CheckIn: useEffect for emotions triggered')
    console.log('CheckIn: Received checkIn.emotions:', checkIn.emotions)
    console.log('CheckIn: checkIn.emotions type:', typeof checkIn.emotions)
    console.log('CheckIn: checkIn.emotions isArray:', Array.isArray(checkIn.emotions))
    console.log('CheckIn: Setting localEmotions to:', checkIn.emotions || [])
    setLocalEmotions(checkIn.emotions || [])
  }, [checkIn.emotions])

  useEffect(() => {
    console.log('CheckIn: useEffect for feeling triggered')
    console.log('CheckIn: Received checkIn.feeling:', checkIn.feeling)
    console.log('CheckIn: Setting localFeeling to:', checkIn.feeling || '')
    setLocalFeeling(checkIn.feeling || '')
  }, [checkIn.feeling])

  const handleEmotionToggle = (emotion: EmotionType) => {
    const newEmotions = localEmotions.includes(emotion)
      ? localEmotions.filter(e => e !== emotion)
      : [...localEmotions, emotion]
    
    setLocalEmotions(newEmotions)
    
    console.log('CheckIn: Emotion toggled:', emotion)
    console.log('CheckIn: New emotions:', newEmotions)
    
    // Update parent immediately with new emotions - SIMPLIFIED APPROACH
    onUpdate({ emotions: newEmotions, feeling: localFeeling })
  }

  const handleFeelingChange = (value: string) => {
    setLocalFeeling(value)
    // Update parent immediately on change - SIMPLIFIED APPROACH
    onUpdate({ emotions: localEmotions, feeling: value })
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        💭 Check In
      </h3>
      <p className="text-gray-600 text-sm mb-6">
        How are you feeling today?
      </p>

      {/* Emotion Checkboxes */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Select your emotions:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {emotionOptions.map((emotion) => (
            <label 
              key={emotion.key} 
              className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-50"
              style={{
                borderColor: localEmotions.includes(emotion.key) ? '#10b981' : '#e5e7eb',
                backgroundColor: localEmotions.includes(emotion.key) ? '#ecfdf5' : 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={localEmotions.includes(emotion.key)}
                onChange={() => handleEmotionToggle(emotion.key)}
                className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span 
                className="font-medium"
                style={{
                  color: localEmotions.includes(emotion.key) ? '#059669' : '#4b5563'
                }}
              >
                {emotion.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Feeling Text Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling? (optional)
        </label>
        <textarea
          value={localFeeling}
          onChange={(e) => handleFeelingChange(e.target.value)}
          placeholder="Describe how you're feeling today..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}