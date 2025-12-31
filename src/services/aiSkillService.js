import aiService from './aiService';
import firebaseService from './firebaseService';

class AISkillService {
  constructor() {
    this.skillProgressRules = {
      'task_completion': { points: 5, description: 'Completed a learning task' },
      'project_submission': { points: 15, description: 'Submitted a project' },
      'challenge_solved': { points: 10, description: 'Solved a coding challenge' },
      'interview_practice': { points: 8, description: 'Practiced interview questions' },
      'help_request': { points: 3, description: 'Asked for help and learned' },
      'research_completed': { points: 6, description: 'Completed research task' },
      'streak_bonus': { points: 2, description: 'Daily learning streak bonus' }
    };
  }

  async startChallengeInChat(userId, skillName, currentLevel) {
    const difficulty = this.getDifficultyLevel(currentLevel);
    
    const challengePrompt = `🎯 **${skillName} Challenge - ${difficulty} Level**

Hey! I see you want to practice ${skillName}. Your current level is ${currentLevel}% (${difficulty}).

💡 **What would you like to work on today?**

• Tell me what specific topic you want to practice
• Describe a project idea you have in mind
• Ask me to suggest something based on your interests
• Share what you're struggling with

**For example:**
- "I want to practice loops and functions"
- "Help me build a simple game"
- "I need to learn about APIs"
- "Test my knowledge of data structures"

🚀 **Once you tell me what you want to work on, I'll:**
- Create a personalized challenge just for you
- Give you step-by-step guidance
- Test your understanding with questions
- Help you build something cool!

So, what sounds interesting to you? What do you want to learn or build today? 🤔`;

    return challengePrompt;
  }

  async generateSkillChallenges(userId, skillName, currentLevel) {
    const difficulty = this.getDifficultyLevel(currentLevel);
    return [
      {
        id: `${skillName}_${Date.now()}_1`,
        title: this.getChallengeType(skillName, difficulty),
        description: this.getChallengeDescription(skillName, difficulty),
        difficulty,
        estimatedTime: this.getEstimatedTime(difficulty),
        points: this.getChallengePoints(difficulty)
      }
    ];
  }

  getChallengeType(skillName, difficulty) {
    const types = {
      'JavaScript': {
        'Beginner': 'Simple Calculator App',
        'Intermediate': 'Todo List with Local Storage', 
        'Advanced': 'Real-time Chat Application',
        'Expert': 'Custom Framework Component'
      },
      'Python': {
        'Beginner': 'Number Guessing Game',
        'Intermediate': 'Web Scraper Tool',
        'Advanced': 'REST API with Database',
        'Expert': 'Machine Learning Model'
      },
      'Java': {
        'Beginner': 'Student Grade Calculator',
        'Intermediate': 'Library Management System',
        'Advanced': 'Multi-threaded Server',
        'Expert': 'Custom Collection Framework'
      }
    };
    return types[skillName]?.[difficulty] || types['JavaScript'][difficulty];
  }

  getChallengeDescription(skillName, difficulty) {
    const descriptions = {
      'JavaScript': {
        'Beginner': '• Create basic arithmetic operations\n• Handle user input validation\n• Display results dynamically',
        'Intermediate': '• Add, edit, delete tasks\n• Save data to localStorage\n• Filter completed/pending tasks',
        'Advanced': '• Real-time messaging\n• User authentication\n• WebSocket connections',
        'Expert': '• Custom state management\n• Virtual DOM implementation\n• Component lifecycle hooks'
      },
      'Python': {
        'Beginner': '• Generate random numbers\n• Handle user guesses\n• Track attempts and score',
        'Intermediate': '• Extract data from websites\n• Parse HTML content\n• Save results to CSV',
        'Advanced': '• CRUD operations\n• Authentication middleware\n• Database integration',
        'Expert': '• Data preprocessing\n• Model training\n• Prediction accuracy metrics'
      },
      'Java': {
        'Beginner': '• Calculate GPA from grades\n• Handle multiple students\n• Generate grade reports',
        'Intermediate': '• Book checkout system\n• Member management\n• Search functionality',
        'Advanced': '• Handle concurrent requests\n• Thread pool management\n• Client-server communication',
        'Expert': '• Generic type system\n• Iterator implementation\n• Performance optimization'
      }
    };
    return descriptions[skillName]?.[difficulty] || descriptions['JavaScript'][difficulty];
  }

  getChallengeRequirements(skillName, difficulty) {
    const requirements = {
      'Beginner': '• Clean, readable code\n• Basic error handling\n• Simple user interface',
      'Intermediate': '• Modular code structure\n• Input validation\n• Responsive design',
      'Advanced': '• Design patterns\n• Unit testing\n• Performance optimization',
      'Expert': '• Advanced algorithms\n• Comprehensive testing\n• Documentation'
    };
    return requirements[difficulty];
  }

  getEstimatedTime(difficulty) {
    const times = {
      'Beginner': '30-45 minutes',
      'Intermediate': '1-2 hours', 
      'Advanced': '2-3 hours',
      'Expert': '3-4 hours'
    };
    return times[difficulty];
  }

  getChallengePoints(difficulty) {
    const points = {
      'Beginner': '10-15 points',
      'Intermediate': '15-25 points',
      'Advanced': '25-35 points', 
      'Expert': '35-50 points'
    };
    return points[difficulty];
  }

  getDifficultyLevel(currentLevel) {
    if (currentLevel < 30) return 'Beginner';
    if (currentLevel < 60) return 'Intermediate';
    if (currentLevel < 80) return 'Advanced';
    return 'Expert';
  }

  async updateSkillProgress(userId, skillName, activityType, additionalPoints = 0) {
    try {
      const userData = await firebaseService.getUserStats(userId);
      const currentSkills = userData.skills || {};
      const skill = currentSkills[skillName] || { current: 0, target: 100 };
      
      const rule = this.skillProgressRules[activityType];
      const pointsToAdd = (rule?.points || 0) + additionalPoints;
      const progressIncrease = this.calculateProgressIncrease(pointsToAdd, skill.current);
      
      const newProgress = Math.min(skill.current + progressIncrease, skill.target);
      
      await firebaseService.updateUserStats(userId, {
        [`skills.${skillName}.current`]: newProgress,
        lastSkillUpdate: {
          skill: skillName,
          activity: activityType,
          pointsEarned: pointsToAdd,
          progressGained: progressIncrease,
          timestamp: new Date().toISOString()
        }
      });

      return {
        newProgress,
        pointsEarned: pointsToAdd,
        progressGained: progressIncrease,
        leveledUp: this.checkLevelUp(skill.current, newProgress)
      };
    } catch (error) {
      console.error('Error updating skill progress:', error);
      return null;
    }
  }

  calculateProgressIncrease(points, currentLevel) {
    const baseIncrease = points * 0.5;
    const levelMultiplier = currentLevel < 50 ? 1.2 : currentLevel < 80 ? 0.8 : 0.5;
    return Math.round(baseIncrease * levelMultiplier);
  }

  checkLevelUp(oldProgress, newProgress) {
    const oldLevel = Math.floor(oldProgress / 20);
    const newLevel = Math.floor(newProgress / 20);
    return newLevel > oldLevel;
  }

  async generatePersonalizedLearningPlan(userId) {
    try {
      const userData = await firebaseService.getUserStats(userId);
      const skills = userData.skills || {};
      
      const prompt = `Based on user's current skills: ${JSON.stringify(skills)}, 
      generate a personalized 7-day learning plan. Include daily tasks, challenges, and milestones.
      Focus on weakest skills and provide progressive difficulty.`;
      
      const response = await aiService.queryAI(prompt, userId);
      return this.parseLearningPlan(response);
    } catch (error) {
      console.error('Error generating learning plan:', error);
      return this.getFallbackLearningPlan();
    }
  }

  parseLearningPlan(response) {
    const days = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    let currentDay = null;
    lines.forEach(line => {
      if (line.includes('Day') || line.includes('day')) {
        if (currentDay) days.push(currentDay);
        currentDay = { day: line.trim(), tasks: [] };
      } else if (currentDay && line.trim()) {
        currentDay.tasks.push(line.trim());
      }
    });
    
    if (currentDay) days.push(currentDay);
    return days;
  }

  getFallbackLearningPlan() {
    return [
      { day: 'Day 1: Foundation Building', tasks: ['Review basic concepts', 'Complete 2 easy challenges', 'Watch tutorial videos'] },
      { day: 'Day 2: Hands-on Practice', tasks: ['Build a small project', 'Practice coding problems', 'Join community discussion'] },
      { day: 'Day 3: Advanced Concepts', tasks: ['Learn advanced topics', 'Solve medium challenges', 'Read documentation'] },
      { day: 'Day 4: Project Development', tasks: ['Start portfolio project', 'Apply best practices', 'Get code review'] },
      { day: 'Day 5: Testing & Debugging', tasks: ['Write unit tests', 'Debug existing code', 'Learn testing frameworks'] },
      { day: 'Day 6: Performance & Optimization', tasks: ['Optimize code performance', 'Learn profiling tools', 'Study algorithms'] },
      { day: 'Day 7: Review & Assessment', tasks: ['Complete skill assessment', 'Review weekly progress', 'Plan next week'] }
    ];
  }

  async startTaskInChat(userId, task) {
    // Import AI service to get intelligent response
    const aiService = (await import('./aiService')).default;
    
    const taskPrompt = `I'm starting the task: "${task.title}". This is a ${task.type} that should take ${task.duration}. Based on my profile and current skill level, can you provide personalized guidance on how to approach this project? Please give me specific steps and recommendations tailored to my experience level.`;
    
    try {
      // Get AI response with full user context
      const response = await aiService.chatWithAI(taskPrompt, '', userId);
      return response;
    } catch (error) {
      console.error('Error getting AI task guidance:', error);
      // Fallback response
      return `🎯 **Starting: ${task.title}**

Great choice! Let's work on this ${task.type} together. Here's how I can help you:

**📋 Task Details:**
• Duration: ${task.duration}
• Type: ${task.type.charAt(0).toUpperCase() + task.type.slice(1)}

**💡 How I can assist:**
• Break down the task into smaller steps
• Provide coding guidance and examples
• Help with planning and architecture
• Review your progress and give feedback
• Suggest best practices and resources

**🚀 Let's get started!**
What would you like to begin with? Ask me:
• "How should I plan this project?"
• "What technologies should I use?"
• "Can you break this down into steps?"
• "I need help with [specific part]"

I'm here to guide you through every step! What's your first question? 🤔`;
    }
  }

  async completeChallengeWithAI(userId, skillName, challengeType, finalCode) {
    const result = await this.updateSkillProgress(userId, skillName, 'challenge_solved', 10);
    
    const completionMessage = `🎉 **Challenge Completed!**
    
**${skillName} - ${challengeType}**
    
**🏆 Results:**
• Points Earned: +${result?.pointsEarned || 10}
• Progress Gained: +${result?.progressGained || 5}%
• New Level: ${result?.newProgress || 0}%
    
${result?.leveledUp ? '🎊 **LEVEL UP!** You\'ve reached a new skill level! 🎊' : ''}
    
**🚀 What's Next:**
• Try a more advanced challenge
• Apply these concepts in a project
• Share your code with the community
    
Great job pushing through the challenge! 💪 Ready for the next one?`;
    
    return completionMessage;
  }
}

export default new AISkillService();