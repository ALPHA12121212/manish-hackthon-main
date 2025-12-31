# Firebase Integration Module

## 📋 Overview
The Firebase Integration module provides comprehensive backend services including real-time database operations, user authentication, data caching, and offline functionality using Firebase and Firestore.

## 🏗️ Architecture

### Core Components
- **firebaseService.js** - Main Firebase service class
- **Firebase Configuration** - Environment-based setup
- **Data Models** - Structured data schemas
- **Caching Layer** - Performance optimization
- **Offline Support** - Network resilience

### Key Features
- Real-time data synchronization
- Offline data persistence
- Intelligent caching system
- Secure user data management
- Scalable document structure

## 🔧 Implementation

### Firebase Configuration
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
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
```

### Firebase Service Class
```javascript
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
}
```

## 🗄️ Data Models

### User Document Structure
```javascript
const userDocument = {
  // Basic Profile
  uid: 'firebase-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  photoURL: 'https://example.com/photo.jpg',
  
  // Learning Progress
  skillsMastered: 5,
  totalSkills: 20,
  daysStreak: 7,
  interviewsPassed: 2,
  jobReadiness: 65,
  
  // Skills Data
  skills: {
    'React.js': {
      current: 75,
      target: 90,
      category: 'frontend',
      lastUpdated: '2024-01-15T10:30:00Z',
      history: [
        { date: '2024-01-01', value: 65 },
        { date: '2024-01-08', value: 70 },
        { date: '2024-01-15', value: 75 }
      ]
    },
    'JavaScript': {
      current: 85,
      target: 95,
      category: 'frontend',
      lastUpdated: '2024-01-14T15:20:00Z'
    }
  },
  
  // Learning Tasks
  tasks: [
    {
      id: 1,
      title: 'Complete React Hooks Tutorial',
      type: 'video',
      duration: '45 min',
      completed: false,
      aiGenerated: true,
      createdAt: '2024-01-15T09:00:00Z'
    }
  ],
  
  // Profile Setup
  experience: 'intermediate',
  education: 'Computer Science Degree',
  careerGoals: 'Full-stack Developer',
  interests: ['React', 'Node.js', 'Machine Learning'],
  skillsSetup: true,
  onboardingComplete: true,
  
  // Timestamps
  createdAt: '2024-01-01T00:00:00Z',
  lastActive: '2024-01-15T12:00:00Z',
  lastSkillUpdate: {
    skill: 'React.js',
    activity: 'Progress update',
    timestamp: '2024-01-15T10:30:00Z'
  }
};
```

### Interview Session Structure
```javascript
const interviewSession = {
  id: 'session-uuid',
  userId: 'firebase-user-id',
  type: 'technical', // technical, behavioral, hr, system-design
  status: 'completed', // active, completed, cancelled
  
  // Session Data
  startTime: '2024-01-15T14:00:00Z',
  endTime: '2024-01-15T14:45:00Z',
  duration: 2700000, // milliseconds
  
  // Conversation
  messages: [
    {
      role: 'interviewer',
      content: 'Tell me about your experience with React',
      timestamp: '2024-01-15T14:01:00Z'
    },
    {
      role: 'candidate',
      content: 'I have been working with React for 2 years...',
      timestamp: '2024-01-15T14:01:30Z'
    }
  ],
  
  // Performance Metrics
  performance: {
    communicationScore: 85,
    technicalScore: 78,
    confidenceLevel: 82,
    responseTime: 3.2, // average seconds
    overallRating: 'Good'
  },
  
  // AI Analysis
  feedback: {
    strengths: ['Clear communication', 'Good technical knowledge'],
    improvements: ['More specific examples', 'Faster response time'],
    recommendations: ['Practice system design', 'Review algorithms']
  }
};
```

## 🔧 Core Operations

### User Data Management
```javascript
async updateUserStats(userId, updates) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      lastActive: new Date().toISOString()
    });
    
    // Clear relevant caches
    this.cache.delete(this.getCacheKey(userId, 'stats'));
    this.cache.delete(this.getCacheKey(userId, 'skills'));
    this.cache.delete(this.getCacheKey(userId, 'profile'));
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

async updateSkillProgress(userId, skill, progress) {
  try {
    const updates = {
      [`skills.${skill}.current`]: progress,
      [`skills.${skill}.lastUpdated`]: new Date().toISOString(),
      lastSkillUpdate: {
        skill: skill,
        activity: 'Progress update',
        timestamp: new Date().toISOString()
      }
    };
    
    await updateDoc(doc(db, 'users', userId), updates);
    
    // Update skill history
    await this.addSkillHistory(userId, skill, progress);
  } catch (error) {
    console.error('Error updating skill progress:', error);
    throw error;
  }
}
```

### Task Management
```javascript
async generateAILearningTasks(userId, userSkills, userInterests, careerGoals) {
  try {
    const aiService = (await import('./aiService')).default;
    
    const prompt = `Generate 5 diverse learning tasks for a user with:
      Skills: ${JSON.stringify(userSkills)}
      Interests: ${userInterests?.join(', ') || 'General programming'}
      Career Goals: ${careerGoals || 'Software development'}
      
      Create varied tasks like:
      - Build specific projects
      - Practice different aspects
      - Learn new concepts
      - Real-world applications
      - Interview preparation`;
    
    const response = await aiService.generateResponse(prompt);
    return this.parseAITasks(response, userSkills);
  } catch (error) {
    console.error('Error generating AI tasks:', error);
    return this.getFallbackTasks(userSkills);
  }
}

async completeTask(userId, taskId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const tasks = userData.tasks.map(task => 
      task.id === taskId ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
    );

    await updateDoc(doc(db, 'users', userId), { 
      tasks,
      lastActive: new Date().toISOString()
    });
    
    // Update streak if task completed today
    await this.updateLearningStreak(userId);
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
}
```

## 📊 Caching Strategy

### Multi-Level Caching
```javascript
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.localStorageCache = 'skillsync_cache';
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Memory cache (fastest)
  getFromMemory(key) {
    const cached = this.memoryCache.get(key);
    if (this.isValidCache(cached)) {
      return cached.data;
    }
    return null;
  }

  // Local storage cache (persistent)
  getFromLocalStorage(key) {
    try {
      const cached = localStorage.getItem(`${this.localStorageCache}_${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (this.isValidCache(parsed)) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Local storage cache error:', error);
    }
    return null;
  }

  // Set cache in both memory and local storage
  setCache(key, data) {
    const cacheEntry = { data, timestamp: Date.now() };
    
    // Memory cache
    this.memoryCache.set(key, cacheEntry);
    
    // Local storage cache
    try {
      localStorage.setItem(`${this.localStorageCache}_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Local storage set error:', error);
    }
  }
}
```

### Cache Invalidation
```javascript
async invalidateUserCache(userId) {
  const cacheKeys = ['stats', 'skills', 'profile', 'tasks'];
  
  cacheKeys.forEach(type => {
    const key = this.getCacheKey(userId, type);
    this.cache.delete(key);
    
    try {
      localStorage.removeItem(`${this.localStorageCache}_${key}`);
    } catch (error) {
      console.warn('Cache invalidation error:', error);
    }
  });
}
```

## 🔄 Real-time Updates

### Firestore Listeners
```javascript
class RealtimeService {
  constructor() {
    this.listeners = new Map();
  }

  subscribeToUserData(userId, callback) {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      },
      (error) => {
        console.error('Real-time listener error:', error);
      }
    );

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  subscribeToSkillUpdates(userId, callback) {
    const q = query(
      collection(db, 'skillUpdates'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(updates);
    });
  }

  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}
```

## 🔒 Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Validate required fields
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['name', 'email', 'createdAt']);
      
      // Prevent deletion of critical fields
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && !('uid' in request.resource.data.diff(resource.data).removedKeys());
    }
    
    // Interview sessions
    match /interviews/{sessionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Skill updates log
    match /skillUpdates/{updateId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🚀 Performance Optimizations

### Batch Operations
```javascript
async batchUpdateSkills(userId, skillUpdates) {
  const batch = writeBatch(db);
  const userRef = doc(db, 'users', userId);
  
  // Prepare batch updates
  const updates = {};
  skillUpdates.forEach(({ skill, progress }) => {
    updates[`skills.${skill}.current`] = progress;
    updates[`skills.${skill}.lastUpdated`] = new Date().toISOString();
  });
  
  batch.update(userRef, updates);
  
  // Add skill history entries
  skillUpdates.forEach(({ skill, progress }) => {
    const historyRef = doc(collection(db, 'skillHistory'));
    batch.set(historyRef, {
      userId,
      skill,
      progress,
      timestamp: new Date().toISOString()
    });
  });
  
  await batch.commit();
}
```

### Pagination
```javascript
async getPaginatedTasks(userId, lastDoc = null, limit = 10) {
  let q = query(
    collection(db, 'users', userId, 'tasks'),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return {
    tasks,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === limit
  };
}
```

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('Firebase Service', () => {
  test('should cache user data correctly', async () => {
    const mockUserData = { name: 'Test User', skills: {} };
    jest.spyOn(firebaseService, 'getUserStats').mockResolvedValue(mockUserData);
    
    const result1 = await firebaseService.getUserStats('test-uid');
    const result2 = await firebaseService.getUserStats('test-uid');
    
    expect(result1).toEqual(mockUserData);
    expect(result2).toEqual(mockUserData);
    expect(firebaseService.getUserStats).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests
- Database connection and operations
- Real-time listener functionality
- Cache invalidation scenarios
- Offline mode behavior

## 🔮 Future Enhancements

- **Advanced Indexing**: Composite indexes for complex queries
- **Data Analytics**: BigQuery integration for advanced analytics
- **Cloud Functions**: Server-side processing and triggers
- **File Storage**: Firebase Storage for media files
- **Push Notifications**: Firebase Cloud Messaging integration