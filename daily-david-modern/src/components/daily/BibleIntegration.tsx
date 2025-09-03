// Bible Integration Component for SOAP Study
// This demonstrates how we can integrate scripture selection with SOAP study

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { bibleService, BibleVersion, BibleVerse, ReadingPlan } from '../../lib/bibleService';

interface BibleIntegrationProps {
  onVerseSelect: (verse: BibleVerse) => void;
  selectedVerse?: BibleVerse;
}

export const BibleIntegration: React.FC<BibleIntegrationProps> = ({ 
  onVerseSelect, 
  selectedVerse 
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'plans'>('search');
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [selectedBible, setSelectedBible] = useState<string>('de4e12af7f28f599-02');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadBibleVersions();
    loadReadingPlans();
  }, []);

  const loadBibleVersions = async () => {
    const versions = await bibleService.getBibleVersions();
    setBibleVersions(versions);
  };

  const loadReadingPlans = async () => {
    const plans = await bibleService.getReadingPlans();
    setReadingPlans(plans);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    const results = await bibleService.searchVerses(selectedBible, searchQuery);
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleVerseSelect = (verse: BibleVerse) => {
    console.log('Selecting verse:', verse);
    onVerseSelect(verse);
  };

  const handleTabChange = (tab: 'search' | 'plans') => {
    setActiveTab(tab);
    // Clear search results when switching tabs
    if (tab === 'search') {
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleYouVersionLink = (verse: BibleVerse) => {
    const link = bibleService.generateYouVersionLink(verse.id);
    window.open(link, '_blank');
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📖 Scripture Selection
        </h3>
        
        {/* API Key Notice */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Setup Required:</strong> To use real scripture data, you need an API.Bible key. 
            <a href="https://scripture.api.bible/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              Get your free API key here →
            </a>
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => handleTabChange('search')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Search Scripture
          </button>
          <button
            onClick={() => handleTabChange('plans')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'plans'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📚 Reading Plans
          </button>
        </div>

        {/* Bible Version Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bible Version
          </label>
          <select
            value={selectedBible}
            onChange={(e) => setSelectedBible(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {bibleVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.name} ({version.abbreviation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex space-x-2">
            <Input
              placeholder="Search for verses (e.g., 'love', 'faith', 'John 3:16')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Search Results:</h4>
              {searchResults.map((verse) => (
                <div
                  key={verse.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-blue-600">{verse.reference}</h5>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerseSelect(verse)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Select for SOAP
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleYouVersionLink(verse)}
                      >
                        Open in YouVersion
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-2">"{verse.content}"</p>
                  <p className="text-xs text-gray-500">{verse.copyright}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Reading Plans Tab */}
      {activeTab === 'plans' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Manly Devotional Tracks:</h4>
            {readingPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">{plan.name}</h5>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {plan.duration} days
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📖 Scripture-based</span>
                      <span>🎯 Manly themes</span>
                      <span>💪 Strength & courage</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={async () => {
                        setLoadingPlan(plan.id);
                        try {
                          console.log('Loading devotion for plan:', plan.id);
                          const devotion = await bibleService.getTodaysDevotion(plan.id);
                          console.log('Devotion loaded:', devotion);
                          if (devotion && devotion.verses.length > 0) {
                            handleVerseSelect(devotion.verses[0]);
                          } else {
                            console.error('No devotion found for plan:', plan.id);
                            alert('No devotion found for this plan. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error loading devotion:', error);
                          alert('Error loading devotion. Please try again.');
                        } finally {
                          setLoadingPlan(null);
                        }
                      }}
                      disabled={loadingPlan === plan.id}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {loadingPlan === plan.id ? 'Loading...' : 'Today\'s Devotion'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // This would show the full plan details
                        console.log('View plan details:', plan.id);
                      }}
                    >
                      View Plan
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Selected Verse Display */}
      {selectedVerse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-blue-900">Selected for SOAP Study:</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Clearing selection');
                onVerseSelect({
                  id: '',
                  reference: '',
                  content: '',
                  copyright: ''
                });
              }}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              Clear Selection
            </Button>
          </div>
          <p className="font-medium text-blue-800">{selectedVerse.reference}</p>
          <p className="text-blue-700 italic mt-2">"{selectedVerse.content}"</p>
          <p className="text-xs text-blue-600 mt-2">{selectedVerse.copyright}</p>
        </motion.div>
      )}
    </Card>
  );
};
