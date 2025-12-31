import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, Target, TrendingUp, Calendar, Award, LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import ModernAIChat from '../components/ai/ModernAIChat'
import ModernSkillAnalyzer from '../components/ai/ModernSkillAnalyzer'
import ModernStatsCard from '../components/dashboard/ModernStatsCard'
import LearningPath from '../components/dashboard/LearningPath'
import SkillRadar from '../components/dashboard/SkillRadar'
import ModernActionCards from '../components/dashboard/ModernActionCards'
import AISkillTracker from '../components/skills/AISkillTracker'
import { useUserData } from '../hooks/useUserData'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const { userData, loading, completeTask, updateSkill, refresh } = useUserData()
  const [chatExpanded, setChatExpanded] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    if (!loading && userData) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 0.8,
          behavior: 'smooth'
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, userData]);

  useEffect(() => {
    const handleChatExpanded = (event) => {
      setChatExpanded(event.detail.isExpanded);
    };
    
    window.addEventListener('chatExpanded', handleChatExpanded);
    return () => window.removeEventListener('chatExpanded', handleChatExpanded);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-gray-200">
            <img src="/src/assets/ailogo.png" alt="AI" className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const todayTasks = userData?.tasks || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Modern Header */}
      <header className={`bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 transition-all duration-300 ${
        chatExpanded ? 'md:mr-[50%]' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200"
              >
                <img src="/src/assets/ailogo.png" alt="AI" className="w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SkillSync 2.0</h1>
                <p className="text-sm text-blue-600">AI-Powered Learning Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-900 text-lg">{currentUser?.displayName || 'User'}</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg"
                >
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-12 h-12 rounded-2xl" />
                  ) : (
                    currentUser?.displayName?.charAt(0) || 'U'
                  )}
                </motion.div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`max-w-7xl mx-auto px-6 py-8 transition-all duration-300 ${
        chatExpanded ? 'hidden md:block md:mr-[50%]' : ''
      }`}>
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernStatsCard 
            icon={<Target className="w-6 h-6" />} 
            label="Skills Mastered" 
            value={`${userData?.skillsMastered || 0}/${userData?.totalSkills || 0}`} 
            change={12}
            index={0} 
          />
          <ModernStatsCard 
            icon={<Calendar className="w-6 h-6" />} 
            label="Days Streak" 
            value={userData?.daysStreak || 0} 
            change={8}
            index={1} 
          />
          <ModernStatsCard 
            icon={<Award className="w-6 h-6" />} 
            label="Interviews Passed" 
            value={userData?.interviewsPassed || 0} 
            change={5}
            index={2} 
          />
          <ModernStatsCard 
            icon={<TrendingUp className="w-6 h-6" />} 
            label="Job Readiness" 
            value={`${userData?.jobReadiness || 0}%`} 
            change={15}
            index={3} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modern Learning Path */}
          <div className="lg:col-span-2">
            <LearningPath tasks={todayTasks} onCompleteTask={completeTask} onRefresh={refresh} />
          </div>

          {/* Modern Skill Progress */}
          <div className="space-y-6">
            <AISkillTracker skills={userData?.skills || {}} onSkillUpdate={updateSkill} />
          </div>
        </div>

        {/* Modern AI Chat */}
        <div className="mt-8">
          <ModernAIChat />
        </div>



        {/* Modern Action Cards */}
        <ModernActionCards />
      </div>
    </div>
  )
}