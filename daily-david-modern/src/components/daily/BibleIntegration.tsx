// Bible Integration Component for SOAP Study
// This demonstrates how we can integrate scripture selection with SOAP study

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { bibleService, BibleVersion, BibleVerse, ReadingPlan } from '../../lib/bibleService';
import { BookOpen, Target, Zap } from 'lucide-react';
import { dbManager } from '../../lib/database';


interface BibleIntegrationProps {
  onVerseSelect: (verse: BibleVerse) => void;
  selectedVerse?: BibleVerse;
  onStartReadingPlan?: (plan: any, bibleId?: string) => void;
  currentReadingPlan?: {
    planId: string
    planName: string
    currentDay: number
    totalDays: number
    startDate: string
    completedDays: number[]
  };
}

export const BibleIntegration: React.FC<BibleIntegrationProps> = ({ 
  onVerseSelect, 
  selectedVerse,
  onStartReadingPlan,
  currentReadingPlan
}) => {

  // Tab toggle state
  const [activeMode, setActiveMode] = useState<'verse' | 'plan'>('plan');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Verse selector state
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [selectedBible, setSelectedBible] = useState<string>('de4e12af7f28f599-02');
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState('GEN');
  const [selectedChapter, setSelectedChapter] = useState<number | ''>('');
  const [selectedVerseStart, setSelectedVerseStart] = useState<number | ''>('');
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<number | ''>('');
  const [availableChapters, setAvailableChapters] = useState<{ chapter: number; verseCount: number }[]>([]);
  const [availableVerses, setAvailableVerses] = useState<{ verse: number }[]>([]);
  const [fetchedVerses, setFetchedVerses] = useState<BibleVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Reading plan state
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Database manager instance (singleton)

  useEffect(() => {
    loadBibleVersions();
    loadReadingPlans();
    loadUserSettings();
    loadBibleBooks();
  }, []);

  // Load chapters when book changes
  useEffect(() => {
    if (selectedBook && books.length > 0) {
      const loadChapters = async () => {
        try {
          const chapters = await bibleService.getBookChapters(selectedBook, selectedBible);
          setAvailableChapters(chapters);
          setSelectedChapter('');
          setSelectedVerseStart('');
          setSelectedVerseEnd('');
          setAvailableVerses([]);
        } catch (error) {
          console.error('Error loading chapters:', error);
        }
      };
      loadChapters();
    }
  }, [selectedBook, selectedBible, books]);

  // Load verses when chapter changes
  useEffect(() => {
    if (selectedBook && selectedChapter && availableChapters.length > 0) {
      const loadVerses = async () => {
        try {
          const verses = await bibleService.getChapterVerses(selectedBook, selectedChapter, selectedBible);
          setAvailableVerses(verses);
          setSelectedVerseStart('');
          setSelectedVerseEnd('');
        } catch (error) {
          console.error('Error loading verses:', error);
        }
      };
      loadVerses();
    }
  }, [selectedBook, selectedChapter, selectedBible, availableChapters]);

  // Load user's preferred mode from database
  const loadUserSettings = async () => {
    try {
      const response = await dbManager.getUserSettings();
      if (response.success && response.settings.soapScriptureMode) {
        setActiveMode(response.settings.soapScriptureMode);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Save mode preference to database
  const handleModeChange = async (mode: 'verse' | 'plan') => {
    setActiveMode(mode);
    try {
      await dbManager.updateUserSettings({ soapScriptureMode: mode });
    } catch (error) {
      console.error('Failed to save mode preference:', error);
    }
  };

  const loadBibleVersions = async () => {
    const versions = await bibleService.getBibleVersions();
    setBibleVersions(versions);
  };

  const loadBibleBooks = async () => {
    try {
      const booksData = await bibleService.getBibleBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading Bible books:', error);
    }
  };

  const loadReadingPlans = async () => {
    const plans = await bibleService.getReadingPlans();
    setReadingPlans(plans);
  };

  const handleVerseSelect = (verse: BibleVerse) => {
    console.log('Selecting verse:', verse);
    onVerseSelect(verse);
  };

  // Verse selector functions
  const handleFetchVerses = async () => {
    if (!selectedBook || !selectedChapter || !selectedVerseStart) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoadingVerses(true);
    try {
      const verses = await bibleService.getVerseRange(
        selectedBible,
        selectedBook,
        parseInt(selectedChapter),
        parseInt(selectedVerseStart),
        parseInt(selectedVerseEnd || selectedVerseStart)
      );
      setFetchedVerses(verses);
    } catch (error) {
      console.error('Error fetching verses:', error);
      alert('Failed to fetch verses. Please try again.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const handleInsertVerse = (verses: BibleVerse[]) => {
    const firstVerse = verses[0];
    const content = verses.map(v => v.content).join(' ');
    onVerseSelect({
      id: 'selected',
      reference: firstVerse.reference,
      content: content,
      copyright: 'Bible'
    });
  };

  // Verse Selector Component
  const VerseSelector = () => (
    <div className="space-y-4">
      {/* Bible Version Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Bible Version
        </label>
        <select
          value={selectedBible}
          onChange={(e) => setSelectedBible(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
        >
          {bibleVersions.map(version => (
            <option key={version.id} value={version.id}>
              {version.name}
            </option>
          ))}
        </select>
      </div>

      {/* Book/Chapter/Verse Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Book</label>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
          >
            {books.map(book => (
              <option key={book.id} value={book.id}>{book.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Chapter</label>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(parseInt(e.target.value) || '')}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
            disabled={!availableChapters.length}
          >
            <option value="">Select Chapter</option>
            {availableChapters.map(chapter => (
              <option key={chapter.chapter} value={chapter.chapter}>
                Chapter {chapter.chapter} ({chapter.verseCount} verses)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Verse Start</label>
          <select
            value={selectedVerseStart}
            onChange={(e) => setSelectedVerseStart(parseInt(e.target.value) || '')}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
            disabled={!availableVerses.length}
          >
            <option value="">Select Start</option>
            {availableVerses.map(verse => (
              <option key={verse.verse} value={verse.verse}>Verse {verse.verse}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Verse End</label>
          <select
            value={selectedVerseEnd}
            onChange={(e) => setSelectedVerseEnd(parseInt(e.target.value) || '')}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
            disabled={!availableVerses.length}
          >
            <option value="">Select End</option>
            {availableVerses.map(verse => (
              <option key={verse.verse} value={verse.verse}>Verse {verse.verse}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fetch Button */}
      <Button 
        onClick={handleFetchVerses} 
        disabled={isLoadingVerses || !selectedBook || !selectedChapter || !selectedVerseStart}
        className="w-full"
      >
        {isLoadingVerses ? 'Loading...' : 'Fetch Verses'}
      </Button>

      {/* Display Fetched Verses */}
      {fetchedVerses.length > 0 && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <h4 className="font-semibold text-white mb-2">
            {fetchedVerses[0].reference}
          </h4>
          <p className="text-slate-200 mb-4 leading-relaxed">
            {fetchedVerses.map(v => v.content).join(' ')}
          </p>
          <Button 
            onClick={() => handleInsertVerse(fetchedVerses)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Insert into Scripture
          </Button>
        </div>
      )}
    </div>
  );

  // Reading Plan Selector Component (existing logic)
  const ReadingPlanSelector = () => (
    <div className="space-y-4">
      {/* Existing reading plan logic here */}
      <div className="text-center text-slate-400">
        Reading plan functionality will be implemented here
      </div>
    </div>
  );

  if (isLoadingSettings) {
    return (
      <Card className="p-6">
        <div className="text-center text-slate-400">
          Loading...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Tab Toggle */}
      <div className="flex border-b border-slate-600 mb-6">
        <button
          onClick={() => handleModeChange('verse')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            activeMode === 'verse'
              ? 'text-white bg-slate-700 border-b-2 border-green-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Verse Selector
        </button>
        <button
          onClick={() => handleModeChange('plan')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
            activeMode === 'plan'
              ? 'text-white bg-slate-700 border-b-2 border-green-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <Target className="w-4 h-4" />
          Reading Plan
        </button>
      </div>

      {/* Content Area */}
      {activeMode === 'verse' ? (
        <VerseSelector />
      ) : (
        <ReadingPlanSelector />
      )}
    </Card>
  );
};