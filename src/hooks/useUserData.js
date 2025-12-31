import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firebaseService from '../services/firebaseService';

export function useUserData() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const calculateSkillMastery = (skills) => {
    if (!skills) return { mastered: 0, total: 0 };
    const skillEntries = Object.entries(skills);
    const mastered = skillEntries.filter(([_, data]) => data.current >= 70).length;
    return { mastered, total: skillEntries.length };
  };

  const loadUserData = async () => {
    try {
      const data = await firebaseService.getUserStats(currentUser.uid);
      const { mastered, total } = calculateSkillMastery(data?.skills);
      
      setUserData({
        ...data,
        skillsMastered: mastered,
        totalSkills: total
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates) => {
    await firebaseService.updateUserStats(currentUser.uid, updates);
    await loadUserData();
  };

  const completeTask = async (taskId) => {
    await firebaseService.completeTask(currentUser.uid, taskId);
    await loadUserData();
  };

  const updateSkill = async (skill, progress) => {
    await firebaseService.updateSkillProgress(currentUser.uid, skill, progress);
    await loadUserData();
  };

  return {
    userData,
    loading,
    updateStats,
    completeTask,
    updateSkill,
    refresh: loadUserData
  };
}