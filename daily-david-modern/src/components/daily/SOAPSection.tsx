import { useState, useEffect } from 'react'
import { SOAPData } from '@/types'

interface SOAPSectionProps {
  soap: SOAPData
  onUpdate: (soap: SOAPData) => void
}

export function SOAPSection({ soap, onUpdate }: SOAPSectionProps) {
  const [localSOAP, setLocalSOAP] = useState(soap || {
    scripture: '',
    observation: '',
    application: '',
    prayer: ''
  })

  useEffect(() => {
    setLocalSOAP(soap || {
      scripture: '',
      observation: '',
      application: '',
      prayer: ''
    })
  }, [soap])

  const handleInputChange = (field: keyof SOAPData, value: string) => {
    const newSOAP = { ...localSOAP, [field]: value }
    setLocalSOAP(newSOAP)
  }

  const handleInputBlur = (field: keyof SOAPData) => {
    // Only update if there's actually a change
    if (localSOAP[field] !== soap[field]) {
      onUpdate(localSOAP)
    }
  }

  const soapSections = [
    {
      key: 'scripture' as keyof SOAPData,
      title: '📖 Scripture',
      subtitle: 'Today\'s Bible passage',
      placeholder: 'Enter the Bible verse or passage you\'re studying today...',
      color: 'green'
    },
    {
      key: 'observation' as keyof SOAPData,
      title: '👁️ Observation',
      subtitle: 'What does the passage say?',
      placeholder: 'What do you notice about this passage? What stands out? What context is important?',
      color: 'blue'
    },
    {
      key: 'application' as keyof SOAPData,
      title: '🎯 Application',
      subtitle: 'How does this apply to your life?',
      placeholder: 'How can you apply this passage to your life today? What changes will you make?',
      color: 'purple'
    },
    {
      key: 'prayer' as keyof SOAPData,
      title: '🙏 Prayer',
      subtitle: 'Your response to God',
      placeholder: 'How will you pray based on this passage? What are you asking God for?',
      color: 'orange'
    }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          S.O.A.P. Bible Study
        </h3>
        <p className="text-gray-600 text-lg">
          Scripture • Observation • Application • Prayer
        </p>
        <div className="mt-2 text-sm text-gray-500">
          "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness" - 2 Timothy 3:16
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {soapSections.map((section) => (
          <div key={section.key} className="border-l-4 border-l-green-500 bg-gray-50 rounded-r-lg p-4">
            <h4 className="font-bold text-lg mb-2 text-gray-800">
              {section.title}
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              {section.subtitle}
            </p>
            
            <textarea
              value={localSOAP[section.key] || ''}
              onChange={(e) => handleInputChange(section.key, e.target.value)}
              onBlur={() => handleInputBlur(section.key)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
              placeholder={section.placeholder}
              rows={4}
            />
          </div>
        ))}
      </div>
    </div>
  )
}