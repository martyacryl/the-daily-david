import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { MountainCrossIcon } from '../icons/MountainCrossIcon';
import { Sword, Shield, BookOpen, Users, Target, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const LandingPage: React.FC = () => {
  const { signup, isLoading, error } = useAuthStore();
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    displayName: '',
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

    setSignupMessage('');

    const success = await signup(
      signupData.displayName,
      signupData.email,
      signupData.password
    );

    if (success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      setSignupMessage(error || 'Failed to create account');
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-amber-400" />,
      title: "Daily Bible Reading",
      description: "Structured reading plans with SOAP method for deep spiritual growth"
    },
    {
      icon: <Sword className="w-8 h-8 text-amber-400" />,
      title: "Warrior Mindset",
      description: "Daily inspiration and Bible verses to strengthen your faith and resolve"
    },
    {
      icon: <Shield className="w-8 h-8 text-amber-400" />,
      title: "Prayer Requests",
      description: "Share prayer requests and support your brothers in Christ"
    },
    {
      icon: <Target className="w-8 h-8 text-amber-400" />,
      title: "Goal Tracking",
      description: "Set and track spiritual goals with accountability and progress monitoring"
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      title: "SMS Notifications",
      description: "Daily motivational messages and Bible verses delivered to your phone"
    },
    {
      icon: <Users className="w-8 h-8 text-amber-400" />,
      title: "Community",
      description: "Connect with other men of God on the same journey of spiritual growth"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23374151" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="flex justify-center mb-6">
              <MountainCrossIcon className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="text-amber-400">Daily</span> David
            </h1>
            <p className="text-xl sm:text-2xl text-green-200 mb-4 max-w-3xl mx-auto">
              Rise up, warrior! Join the fight to become the man God called you to be.
            </p>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Daily Bible reading, prayer, and spiritual growth designed for men who refuse to settle for mediocrity.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setShowSignup(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Join the Fight
              </Button>
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                Continue Sharpening
              </Button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:border-amber-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-white ml-3">{feature.title}</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <Card className="p-8 sm:p-12 bg-gradient-to-r from-amber-600/20 to-green-600/20 backdrop-blur-sm border-amber-500/30">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Life?
              </h2>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Stop making excuses. Start making progress. Join thousands of men who are choosing to stand firm in their faith and fight like the warriors they were created to be.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowSignup(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey Today
                </Button>
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-10 py-4 text-lg font-semibold transition-all duration-300"
                >
                  I'm Already Fighting
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Join the Fight</h2>
                <button
                  onClick={() => setShowSignup(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={signupData.displayName}
                    onChange={(e) => setSignupData({ ...signupData, displayName: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>

                {signupMessage && (
                  <div className={`p-3 rounded-md text-sm ${
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
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 font-semibold"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Join the Fight'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setShowSignup(false);
                      window.location.href = '/login';
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium"
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
