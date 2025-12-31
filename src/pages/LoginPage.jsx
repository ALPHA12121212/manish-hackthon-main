import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Brain, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import firebaseService from '../services/firebaseService';

export default function LoginPage() {
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  // Show loading while checking auth state
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-200">
            <img src="/src/assets/ailogo.png" alt="AI" className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      
      // Check if user needs onboarding
      try {
        const userData = await firebaseService.getUserStats(user.uid);
        const hasCompletedOnboarding = userData?.onboardingCompleted;
        const hasSkillsSetup = userData?.skillsSetup;
        const hasSkills = userData?.skills && Object.keys(userData.skills).length > 0;
        
        if (!hasCompletedOnboarding) {
          navigate('/onboarding');
        } else if (!hasSkillsSetup || !hasSkills) {
          navigate('/skill-setup');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        // If user data doesn't exist, start onboarding
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-200"
          >
            <img src="/src/assets/ailogo.png" alt="AI" className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SkillSync 2.0</h1>
          <p className="text-gray-600">AI-Powered Learning Platform</p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-4 px-6 rounded-2xl font-medium transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}