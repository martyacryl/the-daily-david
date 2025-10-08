import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Mountain, Heart, Calendar, Target, Users, BarChart3, CheckCircle, Sun, BookOpen, Zap } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const LandingPage: React.FC = () => {
  const { signup, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    spouse1Name: '',
    spouse2Name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signupMessage, setSignupMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      setSignupMessage('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setSignupMessage('Password must be at least 6 characters');
      return;
    }

    setSignupMessage('');

    // Use the first spouse's name as the display name for now
    const success = await signup(
      signupData.spouse1Name,
      signupData.email,
      signupData.password
    );

    if (success) {
      // After successful signup, save spouse information to user settings
      try {
        const { useSettingsStore } = await import('../stores/settingsStore');
        const { updateSpouse1, updateSpouse2 } = useSettingsStore.getState();
        
        // Save spouse information
        await updateSpouse1({ name: signupData.spouse1Name });
        await updateSpouse2({ name: signupData.spouse2Name });
        
        console.log('✅ Spouse information saved to user settings');
      } catch (error) {
        console.error('❌ Failed to save spouse information:', error);
        // Don't block the signup flow if settings save fails
      }
      
      // Redirect to dashboard
      navigate('/');
    } else {
      setSignupMessage(error || 'Failed to create account');
    }
  };

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      title: "Weekly Planning",
      description: "Plan your week together with shared schedules, goals, and activities that strengthen your marriage"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Strategic Planning",
      description: "Set annual and quarterly goals together with vision statements and family priorities"
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Marriage Vision",
      description: "Create and maintain your family's mission statement, core values, and long-term vision"
    },
    {
      icon: <Sun className="w-8 h-8 text-white" />,
      title: "Weekly Weather",
      description: "Stay informed with weather updates for your planned activities and outdoor dates"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      title: "Task Lists",
      description: "Manage shared to-do lists, grocery lists, and household responsibilities together"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Encouragement",
      description: "Share love notes, encouragement, and appreciation to strengthen your bond daily"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      title: "Prayer Lists",
      description: "Track prayer requests and praise reports as you grow in faith together"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Marriage Devotions",
      description: "Weekly Bible studies and devotions designed specifically for couples to grow together"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Goal Tracking",
      description: "Monitor your progress on shared goals with analytics and milestone celebrations"
    }
  ];

  const benefits = [
    "Strengthen your marriage through intentional planning",
    "Stay connected with shared goals and schedules", 
    "Build your family's future together",
    "Create lasting memories and traditions",
    "Grow in communication and unity",
    "Achieve your dreams as a team"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-slate-700/20 to-slate-900/20"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 px-3 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <Mountain className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              <span className="text-slate-300">Weekly</span> Huddle
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 mb-3 sm:mb-4 max-w-3xl mx-auto px-2">
              Plan your life together. Strengthen your marriage through intentional weekly planning.
            </p>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              A comprehensive planning tool designed for couples who want to build their future together with purpose, communication, and shared goals.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Button
                onClick={() => setShowSignup(true)}
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Planning Together
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300"
              >
                Sign In
              </Button>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 sm:mb-12 lg:mb-16 px-2"
          >
            <Card className="p-6 sm:p-8 lg:p-12 bg-slate-800/80 backdrop-blur-sm border-slate-700">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">
                Why Weekly Huddle?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-200 text-sm sm:text-base">{benefit}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 px-2"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="p-4 sm:p-6 lg:p-8 bg-slate-800/90 backdrop-blur-sm border-slate-600 hover:border-white/30 hover:bg-slate-700/90 transition-all duration-300 h-full group">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="mb-3 p-3 rounded-full bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center px-2"
          >
            <Card className="p-6 sm:p-8 lg:p-12 bg-gradient-to-r from-slate-600/20 to-slate-800/20 backdrop-blur-sm border-slate-500/30">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                Ready to Plan Your Future Together?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join couples who are building stronger marriages through intentional weekly planning, shared goals, and meaningful communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={() => setShowSignup(true)}
                  className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey Together
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300"
                >
                  Continue Planning
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm sm:max-w-md"
          >
            <Card className="p-4 sm:p-6 bg-slate-800 border-slate-700">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Start Planning Together</h2>
                <button
                  onClick={() => setShowSignup(false)}
                  className="text-slate-400 hover:text-white text-xl sm:text-2xl p-1"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    First Spouse Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={signupData.spouse1Name}
                    onChange={(e) => setSignupData({ ...signupData, spouse1Name: e.target.value })}
                    required
                    className="w-full text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    Second Spouse Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your spouse's name"
                    value={signupData.spouse2Name}
                    onChange={(e) => setSignupData({ ...signupData, spouse2Name: e.target.value })}
                    required
                    className="w-full text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="w-full text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="w-full text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1 sm:mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    className="w-full text-sm sm:text-base"
                  />
                </div>

                {signupMessage && (
                  <div className={`p-2 sm:p-3 rounded-md text-xs sm:text-sm ${
                    signupMessage.includes('success') 
                      ? 'bg-green-900/50 text-green-300 border border-green-700' 
                      : 'bg-red-900/50 text-red-300 border border-red-700'
                  }`}>
                    {signupMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Start Planning Together'}
                </Button>
              </form>

              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-slate-400 text-xs sm:text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setShowSignup(false);
                      navigate('/login');
                    }}
                    className="text-white hover:text-slate-200 font-medium underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
