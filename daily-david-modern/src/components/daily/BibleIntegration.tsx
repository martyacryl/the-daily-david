// Bible Integration Component for SOAP Study
// This demonstrates how we can integrate scripture selection with SOAP study

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { bibleService, BibleVersion, BibleVerse, ReadingPlan } from '../../lib/bibleService';
import { BookOpen, Target, Zap } from 'lucide-react';

interface BibleIntegrationProps {
  onVerseSelect: (verse: BibleVerse) => void;
  selectedVerse?: BibleVerse;
  onStartReadingPlan?: (plan: any) => void;
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

  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [selectedBible, setSelectedBible] = useState<string>('de4e12af7f28f599-02');

  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);

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



  const handleVerseSelect = (verse: BibleVerse) => {
    console.log('Selecting verse:', verse);
    onVerseSelect(verse);
  };





  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          <BookOpen className="w-5 h-5 text-slate-400" />
          Scripture Selection
        </h3>
        

        


        {/* Bible Version Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-200 mb-2">
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

      {/* Reading Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            <h4 className="font-medium text-white">Manly Devotional Tracks:</h4>
            {readingPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 border border-slate-600/50 rounded-lg bg-slate-700/50 hover:border-slate-500 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h5 className="font-medium text-white">{plan.name}</h5>
                      <span className="px-2 py-1 bg-slate-600 text-slate-200 text-xs rounded-full w-fit">
                        {plan.duration} days
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{plan.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-slate-400" /> Scripture-based</span>
                      <span className="flex items-center gap-1"><Target className="w-4 h-4 text-slate-400" /> Manly themes</span>
                      <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-slate-400" /> Strength & courage</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:ml-4">
                    <Button
                      size="sm"
                      onClick={() => onStartReadingPlan && onStartReadingPlan(plan)}
                      className="bg-slate-600 hover:bg-slate-500 text-white"
                    >
                      Choose Plan
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
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{selectedPlan.title}</h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-green-400 hover:text-green-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-green-200 mb-4">{selectedPlan.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Plan Overview:</h4>
                <p className="text-sm text-green-200">
                  This {selectedPlan.title?.toLowerCase() || 'devotional'} plan includes {selectedPlan.verses?.length || 0} carefully selected verses 
                  that will guide you through {selectedPlan.description?.toLowerCase() || 'spiritual growth'}.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Daily Themes:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedPlan.titles?.length > 0 ? selectedPlan.titles.map((title: string, index: number) => (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-white text-sm">Day {index + 1}: {title}</h5>
                          {selectedPlan.themes?.[index] && (
                            <p className="text-xs text-green-300 mt-1">{selectedPlan.themes[index]}</p>
                          )}
                        </div>
                        <span className="text-xs text-green-400 ml-2">Day {index + 1}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-green-400 text-sm p-4 text-center">Plan details are being loaded...</p>
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
