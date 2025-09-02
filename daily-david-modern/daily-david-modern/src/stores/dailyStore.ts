import { create } from 'zustand'
import { DailyState, DailyEntry, Goal } from '../types'
import { formatDateKey } from '../lib/utils'

interface DailyStore extends DailyState {
  createEntry: (entry: Omit<DailyEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, updates: Partial<DailyEntry>) => void
  deleteEntry: (id: string) => void
  getEntryByDate: (date: Date) => DailyEntry | null
  setCurrentEntry: (entry: DailyEntry | null) => void
  updateGoals: (type: 'daily' | 'weekly' | 'monthly', goals: Goal[]) => void
  clearError: () => void
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  entries: [
    {
      id: '1',
      userId: 'demo-user-123',
      user_id: 'demo-user-123',
      date: '2025-09-01',
      dateKey: '2025-09-01',
      date_key: '2025-09-01',
      checkIn: {
        emotions: ['happy', 'excited'],
        feeling: 'Feeling grateful and energized today'
      },
      gratitude: ['Family time', 'Good health', 'Faith community'],
      soap: {
        scripture: 'Psalm 23:1 - The Lord is my shepherd, I shall not want.',
        observation: 'This verse reminds me of God\'s provision and care.',
        application: 'I will trust in God\'s guidance and provision today.',
        prayer: 'Thank you Lord for being my shepherd and provider.'
      },
      goals: {
        daily: [
          { id: '1', text: 'Read today\'s scripture', completed: true, priority: 'high' as const, category: 'spiritual' as const },
          { id: '2', text: 'Pray for family', completed: true, priority: 'medium' as const, category: 'spiritual' as const }
        ],
        weekly: [
          { id: '3', text: 'Attend Bible study', completed: false, priority: 'high' as const, category: 'spiritual' as const },
          { id: '4', text: 'Call a friend', completed: true, priority: 'medium' as const, category: 'personal' as const }
        ],
        monthly: [
          { id: '5', text: 'Read through Psalms', completed: false, priority: 'high' as const, category: 'spiritual' as const },
          { id: '6', text: 'Volunteer at church', completed: false, priority: 'medium' as const, category: 'personal' as const }
        ]
      },
      dailyIntention: 'Focus on gratitude and trust in God today',
      growthQuestion: 'How can I better serve others in my community?',
      leadershipRating: {
        wisdom: 7,
        courage: 6,
        patience: 8,
        integrity: 9
      },
      completed: true,
      createdAt: new Date('2025-09-01'),
      created_at: new Date('2025-09-01'),
      updatedAt: new Date('2025-09-01'),
      updated_at: new Date('2025-09-01')
    }
  ],
  currentEntry: null,
  goals: {
    daily: [
      { id: '1', text: 'Read today\'s scripture', completed: false, priority: 'high' as const, category: 'spiritual' as const },
      { id: '2', text: 'Pray for family', completed: true, priority: 'medium' as const, category: 'spiritual' as const }
    ],
    weekly: [
      { id: '3', text: 'Attend Bible study', completed: false, priority: 'high' as const, category: 'spiritual' as const },
      { id: '4', text: 'Call a friend', completed: false, priority: 'medium' as const, category: 'personal' as const }
    ],
    monthly: [
      { id: '5', text: 'Read through Psalms', completed: false, priority: 'high' as const, category: 'spiritual' as const },
      { id: '6', text: 'Volunteer at church', completed: false, priority: 'medium' as const, category: 'personal' as const }
    ]
  },
  isLoading: false,
  error: null,

  createEntry: (entryData) => {
    const newEntry: DailyEntry = {
      ...entryData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    set(state => ({
      entries: [...state.entries, newEntry],
      currentEntry: newEntry
    }))
  },

  updateEntry: (id, updates) => {
    set(state => ({
      entries: state.entries.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      ),
      currentEntry: state.currentEntry?.id === id 
        ? { ...state.currentEntry, ...updates, updatedAt: new Date() }
        : state.currentEntry
    }))
  },

  deleteEntry: (id) => {
    set(state => ({
      entries: state.entries.filter(entry => entry.id !== id),
      currentEntry: state.currentEntry?.id === id ? null : state.currentEntry
    }))
  },

  getEntryByDate: (date) => {
    const dateKey = formatDateKey(date)
    return get().entries.find(entry => entry.date === dateKey) || null
  },

  setCurrentEntry: (entry) => {
    set({ currentEntry: entry })
  },

  updateGoals: (type, goals) => {
    set(state => ({
      goals: {
        ...state.goals,
        [type]: goals
      }
    }))
  },

  clearError: () => {
    set({ error: null })
  }
}))
