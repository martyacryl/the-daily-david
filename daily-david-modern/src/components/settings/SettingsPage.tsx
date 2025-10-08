import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { SMSSettings } from './SMSSettings';

type SettingsTab = 'sms' | 'profile' | 'notifications';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sms');

  const tabs = [
    { id: 'sms' as SettingsTab, label: '📱 SMS Notifications', icon: '📱' },
    { id: 'profile' as SettingsTab, label: '👤 Profile', icon: '👤' },
    { id: 'notifications' as SettingsTab, label: '🔔 Notifications', icon: '🔔' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sms':
        return <SMSSettings />;
      case 'profile':
        return (
          <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">👤 Profile Settings</h2>
            <p className="text-slate-300">Profile settings coming soon...</p>
          </Card>
        );
      case 'notifications':
        return (
          <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">🔔 Notification Settings</h2>
            <p className="text-slate-300">Additional notification settings coming soon...</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
        <p className="text-xl text-green-200">Manage your Daily David preferences and notifications</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card className="p-4 bg-slate-800/80 backdrop-blur-sm border-slate-700">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                      : 'text-green-200 hover:text-white hover:bg-green-700/50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
