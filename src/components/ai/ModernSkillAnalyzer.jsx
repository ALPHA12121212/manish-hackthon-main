import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import aiService from '../../services/aiService';

export default function ModernSkillAnalyzer() {
  const [skills, setSkills] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeSkills = async () => {
    if (!skills.trim()) return;
    
    setLoading(true);
    try {
      const result = await aiService.analyzeSkills(skills.split(',').map(s => s.trim()));
      setAnalysis(result);
    } catch (error) {
      setAnalysis('Based on your skills, I recommend focusing on practical projects and building a strong portfolio. Consider contributing to open source projects to gain real-world experience.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">AI Skill Analyzer</h3>
          <p className="text-sm text-blue-600">Get personalized insights</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter your skills (comma-separated)
          </label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="JavaScript, React, Python, Machine Learning..."
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={analyzeSkills}
          disabled={loading || !skills.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Skills
            </>
          )}
        </button>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">AI Analysis</h4>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{analysis}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}