import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Circle, Mic, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import aiService from '../../services/aiService';
import aiSkillService from '../../services/aiSkillService';
import firebaseService from '../../services/firebaseService';
import DeepgramInterview from '../DeepgramInterview';

export default function ModernAIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI learning mentor. How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser } = useAuth();

  // Communicate expanded state to parent
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chatExpanded', { detail: { isExpanded } }));
  }, [isExpanded]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleStartChallenge = async (event) => {
      const { skillName, challenge } = event.detail;
      const userData = await firebaseService.getUserStats(currentUser?.uid);
      const currentLevel = userData?.skills?.[skillName]?.current || 0;
      
      const challengePrompt = await aiSkillService.startChallengeInChat(
        currentUser?.uid, 
        skillName, 
        currentLevel
      );
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: challengePrompt,
        timestamp: new Date()
      }]);
    };

    const handleStartTask = async (event) => {
      const { task } = event.detail;
      const taskPrompt = await aiSkillService.startTaskInChat(currentUser?.uid, task);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: taskPrompt,
        timestamp: new Date()
      }]);
    };

    window.addEventListener('startChallenge', handleStartChallenge);
    window.addEventListener('startTask', handleStartTask);
    return () => {
      window.removeEventListener('startChallenge', handleStartChallenge);
      window.removeEventListener('startTask', handleStartTask);
    };
  }, [currentUser]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chatWithAI(input, '', currentUser?.uid);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'m here to help with your learning journey! Let me provide some guidance based on your question.', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Analyze my skills',
    'Create learning plan', 
    'Interview tips',
    'Project ideas'
  ];

  if (showInterview) {
    return (
      <DeepgramInterview 
        onClose={() => setShowInterview(false)} 
      />
    );
  }

  const handleQuickPrompt = async (prompt) => {
    const userMessage = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await aiService.chatWithAI(prompt, '', currentUser?.uid);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'m here to help with your learning journey! Let me provide some guidance based on your question.', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed inset-0 z-50 rounded-none h-screen flex flex-col' : 'h-96 flex flex-col'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200">
              <img src="/src/assets/ailogo.png" alt="AI" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Learning Mentor</h3>
              <p className="text-xs text-blue-600">Powered by advanced AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInterview(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg text-sm"
              >
                AI Voice Interview
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              <span className="text-xs text-gray-600">Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className={`overflow-y-auto p-6 space-y-4 bg-gray-50 ${
        isExpanded ? 'flex-1' : 'h-96'
      }`}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-blue-400' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <img src="/src/assets/ailogo.png" alt="AI" className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-400 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {msg.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                            .replace(/\n\n/g, '</p><p class="mt-3">')
                            .replace(/\n/g, '<br>')
                            .replace(/^(.*)$/, '<p>$1</p>')
                            .replace(/- (.*?)(<br>|$)/g, '<li class="ml-4 list-disc">$1</li>')
                            .replace(/(<li.*?<\/li>)/g, '<ul class="mt-2 space-y-1">$1</ul>')
                            .replace(/\d+\. (.*?)(<br>|$)/g, '<li class="ml-4 list-decimal">$1</li>')
                        }} />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <img src="/src/assets/ailogo.png" alt="AI" className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto mb-3">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs whitespace-nowrap transition-colors border border-blue-200"
            >
              {prompt}
            </button>
          ))}
        </div>

      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your learning journey..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}