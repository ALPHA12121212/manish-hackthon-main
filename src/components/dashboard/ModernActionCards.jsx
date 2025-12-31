import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, Shield, Zap, Globe, Rocket, Award } from 'lucide-react';

export default function ModernActionCards() {
  const cards = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "AI Mock Interview",
      description: "Practice with advanced AI interviewer",
      badge: "Powered by GPT-4",
      badgeIcon: <Zap className="w-3 h-3" />
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Smart Job Matching", 
      description: "AI-powered opportunity finder",
      badge: "Global opportunities",
      badgeIcon: <Globe className="w-3 h-3" />
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Skill Analytics",
      description: "Deep learning insights", 
      badge: "Advanced metrics",
      badgeIcon: <Rocket className="w-3 h-3" />
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Career Shield",
      description: "Protect & boost your career",
      badge: "Premium feature", 
      badgeIcon: <Award className="w-3 h-3" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {cards.map((card, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 p-6 rounded-3xl text-left shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-2xl w-fit mb-4 transition-colors">
            <div className="text-blue-600">{card.icon}</div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
            {card.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 group-hover:text-blue-700 transition-colors">
            {card.description}
          </p>
          
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
            {card.badgeIcon}
            <span>{card.badge}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}