import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Mic, Target, TrendingUp, Users, ArrowRight, Sparkles, MessageCircle, BarChart3, Zap, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard')
    }
  }, [currentUser, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto relative z-10"
        >
          <motion.div 
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mr-4 shadow-2xl border border-gray-200"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <img src="/src/assets/ailogo.png" alt="AI" className="w-8 h-8" />
            </motion.div>
            <h1 className="text-6xl font-bold text-gray-900">
              SkillSync 2.0
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The Future of Interview Preparation is Here
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Experience AI-powered voice interviews, real-time skill tracking, and personalized mentorship that adapts to your learning style.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => currentUser ? navigate('/dashboard') : navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all duration-300"
            >
              <ArrowRight className="w-6 h-6" />
              {currentUser ? 'Go to Dashboard' : 'Start Free Trial'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 bg-white"
            >
              <Target className="w-5 h-5 inline mr-2" />
              Try Voice Interview
            </motion.button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <Mic className="w-8 h-8" />, title: "AI-Powered", subtitle: "Voice Interviews", color: "blue" },
              { icon: <BarChart3 className="w-8 h-8" />, title: "Real-time", subtitle: "Skill Tracking", color: "green" },
              { icon: <MessageCircle className="w-8 h-8" />, title: "24/7", subtitle: "AI Mentorship", color: "purple" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 text-center shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`text-${stat.color}-600 mb-4 flex justify-center`}>
                  {stat.icon}
                </div>
                <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.title}</div>
                <div className="text-gray-700 font-medium">{stat.subtitle}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl font-bold text-gray-900 mb-6"
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Experience cutting-edge AI technology designed to revolutionize your learning journey and interview preparation.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: <Mic className="w-12 h-12" />,
                title: "AI Voice Interviews",
                description: "Experience natural conversations with our AI interviewer powered by Deepgram's advanced speech technology. Get real-time feedback and improve your communication skills.",
                color: "blue",
                features: ["Natural voice conversations", "Real-time feedback", "Multiple interview types", "Speech analysis"]
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Smart Skill Tracking",
                description: "Visualize your progress with interactive radar charts and detailed analytics. Track your growth across multiple skills and identify areas for improvement.",
                color: "green",
                features: ["Visual progress charts", "Skill gap analysis", "Performance metrics", "Growth tracking"]
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "AI Learning Mentor",
                description: "Get personalized guidance 24/7 from your AI mentor. Ask questions, get study plans, and receive tailored advice for your career journey.",
                color: "purple",
                features: ["24/7 availability", "Personalized guidance", "Study plan creation", "Career advice"]
              },
              {
                icon: <Target className="w-12 h-12" />,
                title: "Intelligent Dashboard",
                description: "Access comprehensive analytics and insights about your learning journey. Monitor achievements, track streaks, and plan your next steps.",
                color: "blue",
                features: ["Learning analytics", "Achievement tracking", "Progress insights", "Goal planning"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`text-${feature.color}-600 mb-6 flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">{feature.description}</p>
                <div className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 text-${feature.color}-500`} />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-blue-600 text-white text-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-700/20 animate-pulse"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <motion.h2 
            className="text-5xl font-bold mb-6"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Ready to Transform Your Career?
          </motion.h2>
          <motion.p 
            className="text-xl mb-12 opacity-90 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.9 }}
            transition={{ delay: 0.2 }}
          >
            Join the future of interview preparation with AI-powered voice interviews, intelligent skill tracking, and personalized mentorship.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => currentUser ? navigate('/dashboard') : navigate('/login')}
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl"
            >
              {currentUser ? 'Go to Dashboard' : 'Start Free Trial'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

// Add custom CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;
document.head.appendChild(style);