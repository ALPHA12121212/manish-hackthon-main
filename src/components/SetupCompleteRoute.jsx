import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import firebaseService from '../services/firebaseService';

export default function SetupCompleteRoute({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (currentUser) {
        try {
          const userData = await firebaseService.getUserStats(currentUser.uid);
          const hasSkills = userData?.skills && Object.keys(userData.skills).length > 0;
          setIsSetupComplete(userData?.onboardingCompleted && userData?.skillsSetup && hasSkills);
        } catch (error) {
          console.error('Error checking setup status:', error);
        }
      }
      setLoading(false);
    };

    checkSetupStatus();
  }, [currentUser]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />;
  }

  // If setup is complete, redirect to dashboard
  if (isSetupComplete) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}