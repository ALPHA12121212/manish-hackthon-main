import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable persistent login
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Firebase persistence setup failed:', error);
});

// Enable offline persistence
try {
  enableNetwork(db);
} catch (error) {
  console.warn('Firebase offline mode enabled');
}

class FirebaseService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  getCacheKey(userId, type = 'stats') {
    return `${userId}_${type}`;
  }

  isValidCache(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  async getUserStats(userId) {
    const cacheKey = this.getCacheKey(userId, 'stats');
    const cached = this.cache.get(cacheKey);
    
    if (this.isValidCache(cached)) {
      return cached.data;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
      const defaultData = await this.createDefaultUserStats(userId);
      this.cache.set(cacheKey, { data: defaultData, timestamp: Date.now() });
      return defaultData;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return this.getOfflineDefaultStats();
    }
  }

  getOfflineDefaultStats() {
    return {
      skillsMastered: 5,
      totalSkills: 20,
      daysStreak: 7,
      interviewsPassed: 2,
      jobReadiness: 65,
      skills: {
        'React.js': { current: 75, target: 90 },
        'JavaScript': { current: 85, target: 95 },
        'Node.js': { current: 45, target: 80 },
        'MongoDB': { current: 30, target: 70 }
      },
      tasks: [
        { id: 1, title: 'Complete React Hooks Tutorial', type: 'video', duration: '45 min', completed: false },
        { id: 2, title: 'Build Todo App Project', type: 'project', duration: '2 hours', completed: false },
        { id: 3, title: 'Practice JavaScript Interview Questions', type: 'practice', duration: '30 min', completed: true },
        { id: 4, title: 'Apply to 3 Frontend Internships', type: 'apply', duration: '1 hour', completed: false }
      ],
      lastActive: new Date().toISOString()
    };
  }

  async createDefaultUserStats(userId) {
    const defaultStats = {
      skillsMastered: 0,
      totalSkills: 0,
      daysStreak: 1,
      interviewsPassed: 0,
      jobReadiness: 25,
      skills: {},
      tasks: [],
      lastActive: new Date().toISOString(),
      skillsSetup: false
    };

    await setDoc(doc(db, 'users', userId), defaultStats);
    return defaultStats;
  }

  async generateAILearningTasks(userId, userSkills, userInterests, careerGoals) {
    try {
      // Import AI service for intelligent task generation
      const aiService = (await import('./aiService')).default;
      
      const prompt = `Generate 5 diverse learning tasks for a user with:
      Skills: ${JSON.stringify(userSkills)}
      Interests: ${userInterests?.join(', ') || 'General programming'}
      Career Goals: ${careerGoals || 'Software development'}
      
      Create varied tasks like:
      - Build specific projects (not just "portfolio")
      - Practice different aspects (algorithms, debugging, etc.)
      - Learn new concepts or frameworks
      - Real-world applications
      - Interview preparation
      
      Format each as: "TaskTitle|Type|Duration"
      Types: project, practice, study, interview, research
      Durations: 30min, 1hour, 2hours, 3-4hours`;
      
      const response = await aiService.generateResponse(prompt);
      return this.parseAITasks(response, userSkills);
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      return this.getFallbackTasks(userSkills);
    }
  }

  parseAITasks(response, userSkills) {
    const tasks = [];
    const lines = response.split('\n').filter(line => line.includes('|'));
    
    lines.slice(0, 5).forEach((line, index) => {
      const [title, type, duration] = line.split('|').map(s => s.trim());
      if (title && type && duration) {
        tasks.push({
          id: Date.now() + index,
          title: title.replace(/^\d+\.\s*/, ''), // Remove numbering
          type: type.toLowerCase(),
          duration: duration,
          completed: false,
          aiGenerated: true
        });
      }
    });
    
    return tasks.length > 0 ? tasks : this.getFallbackTasks(userSkills);
  }

  getFallbackTasks(userSkills) {
    const skills = Object.keys(userSkills || {}).slice(0, 3);
    const taskTemplates = [
      { title: 'Build a REST API with authentication', type: 'project', duration: '4-5 hours' },
      { title: 'Solve 10 algorithm challenges', type: 'practice', duration: '2 hours' },
      { title: 'Create a responsive web dashboard', type: 'project', duration: '3-4 hours' },
      { title: 'Learn advanced debugging techniques', type: 'study', duration: '1 hour' },
      { title: 'Practice system design interviews', type: 'interview', duration: '1.5 hours' }
    ];
    
    return taskTemplates.slice(0, 5).map((task, index) => ({
      id: Date.now() + index,
      ...task,
      completed: false,
      aiGenerated: true
    }));
  }

  async updateUserStats(userId, updates) {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      // Clear cache after update
      this.cache.delete(this.getCacheKey(userId, 'stats'));
      this.cache.delete(this.getCacheKey(userId, 'skills'));
      this.cache.delete(this.getCacheKey(userId, 'profile'));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  async incrementStreak(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        daysStreak: increment(1),
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error incrementing streak:', error);
    }
  }

  async updateSkillProgress(userId, skill, progress) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        [`skills.${skill}.current`]: progress
      });
    } catch (error) {
      console.error('Error updating skill progress:', error);
    }
  }

  async addTask(userId, task) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const tasks = userData.tasks || [];
      
      tasks.push({
        id: Date.now(),
        ...task,
        completed: false,
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', userId), { tasks });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async completeTask(userId, taskId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const tasks = userData.tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );

      await updateDoc(doc(db, 'users', userId), { tasks });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  // Specific data retrieval functions for AI
  async getUserSkills(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.data();
      return data?.skills || {};
    } catch (error) {
      console.error('Error fetching user skills:', error);
      return {};
    }
  }

  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.data();
      return {
        name: data?.name,
        education: data?.education,
        experience: data?.experience,
        jobReadiness: data?.jobReadiness
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {};
    }
  }

  async getUserInterests(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.data();
      return data?.interests || [];
    } catch (error) {
      console.error('Error fetching user interests:', error);
      return [];
    }
  }

  async getUserCareerData(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.data();
      return {
        careerGoals: data?.careerGoals,
        experience: data?.experience,
        jobReadiness: data?.jobReadiness,
        interviewsPassed: data?.interviewsPassed
      };
    } catch (error) {
      console.error('Error fetching user career data:', error);
      return {};
    }
  }
}

export default new FirebaseService();