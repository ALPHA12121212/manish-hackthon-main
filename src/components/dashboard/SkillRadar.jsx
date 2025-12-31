import { motion } from 'framer-motion';
import { TrendingUp, Target } from 'lucide-react';

export default function SkillRadar({ skills, onUpdateSkill }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Skill Mastery</h2>
          <p className="text-sm text-gray-500">Track your progress</p>
        </div>
        <Target className="w-5 h-5 text-blue-600" />
      </div>
      
      <div className="space-y-6">
        {Object.keys(skills).length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No skills added yet</p>
            <p className="text-sm text-gray-400">Complete the skill setup to track your progress</p>
          </div>
        ) : (
          Object.entries(skills).map(([skill, data], index) => {
            const progress = (data.current / data.target) * 100;
            const isAdvanced = data.current >= 70;
            
            return (
              <motion.div
                key={skill}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{skill}</span>
                    {isAdvanced && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <TrendingUp className="w-3 h-3" />
                        Advanced
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {data.current}% / {data.target}%
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${
                        isAdvanced 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <div 
                    className="absolute top-0 w-1 h-3 bg-gray-400 rounded-full"
                    style={{ left: `${(data.target / 100) * 100}%` }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateSkill(skill, Math.min(data.current + 5, 100))}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    +5%
                  </button>
                  <button
                    onClick={() => onUpdateSkill(skill, Math.min(data.current + 10, 100))}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                  >
                    +10%
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}