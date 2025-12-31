import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Play, Star, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import firebaseService from '../../services/firebaseService';

export default function LearningPath({ tasks, onCompleteTask, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [regenerating, setRegenerating] = useState(false);
  const { currentUser } = useAuth();

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const userData = await firebaseService.getUserStats(currentUser.uid);
      const newTasks = await firebaseService.generateAILearningTasks(
        currentUser.uid,
        userData?.skills || {},
        userData?.interests || [],
        userData?.careerGoals || ''
      );
      
      await firebaseService.updateUserStats(currentUser.uid, {
        tasks: newTasks
      });
      
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error regenerating tasks:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const getTaskIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'project': return <Star className="w-4 h-4" />;
      case 'practice': return <Zap className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Learning Path</h2>
          <p className="text-sm text-gray-500">Personalized for your goals</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              task.completed 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  task.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {task.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    getTaskIcon(task.type)
                  )}
                </div>
                <div>
                  <h3 className={`font-medium ${
                    task.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{task.duration}</span>
                    <span>•</span>
                    <span className="capitalize">{task.type}</span>
                  </div>
                </div>
              </div>
              {!task.completed && (
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('startTask', {
                      detail: { task }
                    }));
                    onCompleteTask(task.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}