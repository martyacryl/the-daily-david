// Bible Integration Component for SOAP Study
// This demonstrates how we can integrate scripture selection with SOAP study

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
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
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

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
                          const devotion = await bibleService.getTodaysDevotion(plan.id, selectedBible);
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
                      onClick={() => setSelectedPlan(plan)}
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
          <div className="flex items-center gap-2 mb-2">
            <p className="font-medium text-blue-800">{selectedVerse.reference}</p>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {bibleVersions.find(v => v.id === selectedBible)?.abbreviation || 'Bible'}
            </span>
          </div>
          <p className="text-blue-700 italic mt-2">"{selectedVerse.content}"</p>
          <p className="text-xs text-blue-600 mt-2">{selectedVerse.copyright}</p>
        </motion.div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedPlan.title}</h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedPlan.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Plan Overview:</h4>
                <p className="text-sm text-gray-600">
                  This {selectedPlan.title?.toLowerCase() || 'devotional'} plan includes {selectedPlan.verses?.length || 0} carefully selected verses 
                  that will guide you through {selectedPlan.description?.toLowerCase() || 'spiritual growth'}.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Daily Themes:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedPlan.titles?.length > 0 ? selectedPlan.titles.map((title: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">Day {index + 1}: {title}</h5>
                          {selectedPlan.themes?.[index] && (
                            <p className="text-xs text-gray-600 mt-1">{selectedPlan.themes[index]}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 ml-2">Day {index + 1}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm p-4 text-center">Plan details are being loaded...</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setLoadingPlan(selectedPlan.id);
                      const devotion = await bibleService.getTodaysDevotion(selectedPlan.id, selectedBible);
                      if (devotion) {
                        onVerseSelect(devotion.verses[0]);
                        setSelectedPlan(null);
                      }
                    } catch (error) {
                      console.error('Error loading today\'s devotion:', error);
                    } finally {
                      setLoadingPlan(null);
                    }
                  }}
                  disabled={loadingPlan === selectedPlan.id}
                >
                  {loadingPlan === selectedPlan.id ? 'Loading...' : 'Get Today\'s Devotion'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
