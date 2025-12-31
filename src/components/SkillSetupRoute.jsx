import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import firebaseService from '../services/firebaseService';
import { Brain } from 'lucide-react';

export default function SkillSetupRoute({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const checkSkillSetup = async () => {
      if (currentUser) {
        try {
          const userData = await firebaseService.getUserStats(currentUser.uid);
          // Only redirect to skill setup if onboarding is completed but skills are not set up
          setNeedsSetup(userData?.onboardingCompleted && !userData?.skillsSetup);
        } catch (error) {
          console.error('Error checking skill setup:', error);
          setNeedsSetup(false);
        }
      }
      setLoading(false);
    };

    checkSkillSetup();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return <Navigate to="/skill-setup" />;
  }

  return children;
}