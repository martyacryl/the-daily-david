// Bible Integration Component for SOAP Study
// This demonstrates how we can integrate scripture selection with SOAP study

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { bibleService, BibleVersion, BibleVerse, ReadingPlan } from '../../lib/bibleService';
import { BookOpen, Target, Zap } from 'lucide-react';
import { dbManager } from '../../lib/database';

// Static Bible books data (from sermon notes)
const BIBLE_BOOKS = [
  { id: 'GEN', name: 'Genesis' },
  { id: 'EXO', name: 'Exodus' },
  { id: 'LEV', name: 'Leviticus' },
  { id: 'NUM', name: 'Numbers' },
  { id: 'DEU', name: 'Deuteronomy' },
  { id: 'JOS', name: 'Joshua' },
  { id: 'JDG', name: 'Judges' },
  { id: 'RUT', name: 'Ruth' },
  { id: '1SA', name: '1 Samuel' },
  { id: '2SA', name: '2 Samuel' },
  { id: '1KI', name: '1 Kings' },
  { id: '2KI', name: '2 Kings' },
  { id: '1CH', name: '1 Chronicles' },
  { id: '2CH', name: '2 Chronicles' },
  { id: 'EZR', name: 'Ezra' },
  { id: 'NEH', name: 'Nehemiah' },
  { id: 'EST', name: 'Esther' },
  { id: 'JOB', name: 'Job' },
  { id: 'PSA', name: 'Psalms' },
  { id: 'PRO', name: 'Proverbs' },
  { id: 'ECC', name: 'Ecclesiastes' },
  { id: 'SNG', name: 'Song of Songs' },
  { id: 'ISA', name: 'Isaiah' },
  { id: 'JER', name: 'Jeremiah' },
  { id: 'LAM', name: 'Lamentations' },
  { id: 'EZK', name: 'Ezekiel' },
  { id: 'DAN', name: 'Daniel' },
  { id: 'HOS', name: 'Hosea' },
  { id: 'JOL', name: 'Joel' },
  { id: 'AMO', name: 'Amos' },
  { id: 'OBA', name: 'Obadiah' },
  { id: 'JON', name: 'Jonah' },
  { id: 'MIC', name: 'Micah' },
  { id: 'NAH', name: 'Nahum' },
  { id: 'HAB', name: 'Habakkuk' },
  { id: 'ZEP', name: 'Zephaniah' },
  { id: 'HAG', name: 'Haggai' },
  { id: 'ZEC', name: 'Zechariah' },
  { id: 'MAL', name: 'Malachi' },
  { id: 'MAT', name: 'Matthew' },
  { id: 'MRK', name: 'Mark' },
  { id: 'LUK', name: 'Luke' },
  { id: 'JHN', name: 'John' },
  { id: 'ACT', name: 'Acts' },
  { id: 'ROM', name: 'Romans' },
  { id: '1CO', name: '1 Corinthians' },
  { id: '2CO', name: '2 Corinthians' },
  { id: 'GAL', name: 'Galatians' },
  { id: 'EPH', name: 'Ephesians' },
  { id: 'PHP', name: 'Philippians' },
  { id: 'COL', name: 'Colossians' },
  { id: '1TH', name: '1 Thessalonians' },
  { id: '2TH', name: '2 Thessalonians' },
  { id: '1TI', name: '1 Timothy' },
  { id: '2TI', name: '2 Timothy' },
  { id: 'TIT', name: 'Titus' },
  { id: 'PHM', name: 'Philemon' },
  { id: 'HEB', name: 'Hebrews' },
  { id: 'JAS', name: 'James' },
  { id: '1PE', name: '1 Peter' },
  { id: '2PE', name: '2 Peter' },
  { id: '1JN', name: '1 John' },
  { id: '2JN', name: '2 John' },
  { id: '3JN', name: '3 John' },
  { id: 'JUD', name: 'Jude' },
  { id: 'REV', name: 'Revelation' }
];

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
  const [selectedBook, setSelectedBook] = useState('GEN');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerseStart, setSelectedVerseStart] = useState('');
  const [selectedVerseEnd, setSelectedVerseEnd] = useState('');
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
  }, []);

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
            {BIBLE_BOOKS.map(book => (
              <option key={book.id} value={book.id}>{book.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Chapter</label>
          <input
            type="number"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Verse Start</label>
          <input
            type="number"
            value={selectedVerseStart}
            onChange={(e) => setSelectedVerseStart(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Verse End</label>
          <input
            type="number"
            value={selectedVerseEnd}
            onChange={(e) => setSelectedVerseEnd(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none"
          />
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