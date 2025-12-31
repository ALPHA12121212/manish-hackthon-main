import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Code, Users, Briefcase, Network } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import deepgramVoiceAgent from '../services/deepgramVoiceAgent';

const DeepgramInterview = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [interviewType, setInterviewType] = useState('');
  const [status, setStatus] = useState({
    isConnected: false,
    isListening: false,
    isSpeaking: false
  });
  const [conversation, setConversation] = useState([]);
  const [userData, setUserData] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const interviewTypes = [
    { id: 'technical', name: 'Technical Interview', icon: Code, color: 'blue' },
    { id: 'behavioral', name: 'Behavioral Interview', icon: Users, color: 'purple' },
    { id: 'hr', name: 'HR Round', icon: Briefcase, color: 'green' },
    { id: 'system-design', name: 'System Design', icon: Network, color: 'orange' }
  ];

  const handleMessage = (message) => {
    setConversation(prev => [...prev, message]);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(prev => ({ ...prev, ...newStatus }));
  };

  const startInterview = async (type) => {
    setInterviewType(type);
    setConversation([]);
    
    const success = await deepgramVoiceAgent.startInterview(
      type, 
      currentUser?.uid, 
      handleMessage, 
      handleStatusChange,
      userData
    );
    
    if (success) {
      setIsActive(true);
    } else {
      alert('Failed to start interview. Please check your microphone permissions.');
    }
  };

  const endInterview = () => {
    const summary = deepgramVoiceAgent.endInterview();
    setIsActive(false);
    setInterviewType('');
    setStatus({ isConnected: false, isListening: false, isSpeaking: false });
    setConversation([]);
    
    alert(`Interview completed!\nDuration: ${Math.round(summary.duration / 60000)} minutes`);
  };

  if (!isActive) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">🎙️ AI Voice Interview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        


        <p className="text-gray-600 mb-6">Choose your interview type:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviewTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => startInterview(type.id)}
                className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-2xl transition-all duration-200 hover:shadow-lg group"
              >
                <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-gray-800">{type.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const selectedType = interviewTypes.find(t => t.id === interviewType);
  const IconComponent = selectedType?.icon || Code;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <IconComponent className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold gradient-text">{selectedType?.name}</h3>
        </div>
        <button 
          onClick={endInterview}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
        >
          End
        </button>
      </div>

      <div className="text-center space-y-6">


        {/* Voice Activity Indicator */}
        <div className="flex justify-center">
          <div className={`w-96 h-96 rounded-full flex items-center justify-center transition-all duration-300 relative ${
            status.isSpeaking 
              ? 'bg-green-500 animate-pulse shadow-lg shadow-green-200' 
              : status.isListening
              ? 'bg-transparent'
              : 'bg-gray-500'
          }`}>

            {status.isSpeaking ? (
              <div className="text-center text-white">
                <div className="w-12 h-12 mx-auto mb-2 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium">AI Speaking</div>
              </div>
            ) : status.isListening ? (
              <div className="text-center">
                <img 
                  src="/src/assets/agentic-ai.gif" 
                  alt="AI Listening" 
                  className="w-80 h-auto mx-auto mb-4 rounded-xl"
                />
                <div className="text-lg font-medium text-gray-800">AI is listening...</div>
              </div>
            ) : (
              <div className="text-center text-white">
                <div className="w-12 h-12 mx-auto mb-2 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                  <MicOff className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium">Standby</div>
              </div>
            )}
          </div>
        </div>




      </div>
    </div>
  );
};

export default DeepgramInterview;