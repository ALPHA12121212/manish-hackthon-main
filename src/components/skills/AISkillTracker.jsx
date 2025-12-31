import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, TrendingUp, Award, Code, Brain, 
  Plus, CheckCircle, Clock, Star 
} from 'lucide-react';
import aiSkillService from '../../services/aiSkillService';
import { useAuth } from '../../contexts/AuthContext';

export default function AISkillTracker({ skills, onSkillUpdate }) {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showChallenges, setShowChallenges] = useState(false);
  const [loading, setLoading] = useState(null);

  const handleSkillAction = async (skillName, action) => {
    const buttonKey = `${skillName}-${action}`;
    setLoading(buttonKey);
    
    let activityType = '';
    let additionalPoints = 0;

    switch (action) {
      case 'practice':
        activityType = 'task_completion';
        additionalPoints = 2;
        break;
      case 'project':
        activityType = 'project_submission';
        additionalPoints = 5;
        break;
      case 'help':
        activityType = 'help_request';
        additionalPoints = 1;
        break;
      case 'interview':
        activityType = 'interview_practice';
        additionalPoints = 3;
        break;
      default:
        activityType = 'task_completion';
    }

    try {
      const result = await aiSkillService.updateSkillProgress(
        currentUser.uid, 
        skillName, 
        activityType, 
        additionalPoints
      );

      if (result) {
        onSkillUpdate(skillName, result.newProgress);
      }
    } catch (error) {
      console.error('Error updating skill:', error);
    } finally {
      setLoading(null);
    }
  };

  const loadChallenges = async (skillName) => {
    try {
      const skillLevel = skills[skillName]?.current || 0;
      const skillChallenges = await aiSkillService.generateSkillChallenges(
        currentUser.uid, 
        skillName, 
        skillLevel
      );
      setChallenges(skillChallenges);
      setSelectedSkill(skillName);
      setShowChallenges(true);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Skill Tracker</h3>
          <p className="text-sm text-gray-500">AI-powered progress tracking</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(skills).map(([skillName, skill], index) => (
          <motion.div
            key={`${skillName}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{skillName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {skill.current}% / {skill.target}%
                </span>
                <button
                  onClick={() => loadChallenges(skillName)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(skill.current / skill.target) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-blue-600 h-3 rounded-full"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSkillAction(skillName, 'practice')}
                disabled={loading === `${skillName}-practice`}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                {loading === `${skillName}-practice` ? '...' : '+5%'}
              </button>
              <button
                onClick={() => handleSkillAction(skillName, 'project')}
                disabled={loading === `${skillName}-project`}
                className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                <Target className="w-3 h-3" />
                {loading === `${skillName}-project` ? '...' : '+10%'}
              </button>
              <button
                onClick={() => handleSkillAction(skillName, 'help')}
                className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-lg hover:bg-orange-200 transition-colors"
              >
                <Brain className="w-3 h-3" />
                +3%
              </button>
              <button
                onClick={() => handleSkillAction(skillName, 'interview')}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Award className="w-3 h-3" />
                +8%
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showChallenges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowChallenges(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedSkill} Challenges
                </h3>
                <button
                  onClick={() => setShowChallenges(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={`challenge-${challenge.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3" />
                        {challenge.estimatedTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          challenge.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                          challenge.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {challenge.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="w-3 h-3" />
                          {challenge.points} points
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('startChallenge', {
                            detail: { skillName: selectedSkill, challenge }
                          }));
                          setShowChallenges(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start in Chat
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}