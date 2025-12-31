# Authentication & User Management Module

## 📋 Overview
The Authentication & User Management module handles secure user authentication, profile management, and user session handling using Firebase Authentication with Google OAuth integration.

## 🏗️ Architecture

### Core Components
- **AuthContext.jsx** - React context for authentication state
- **authService.js** - Firebase authentication service
- **LoginPage.jsx** - User login interface
- **OnboardingPage.jsx** - New user setup flow
- **SkillSetupPage.jsx** - Initial skill configuration

### Key Features
- Google OAuth authentication
- Persistent user sessions
- Protected route management
- User profile creation and management
- Skill setup and onboarding flow

## 🔧 Implementation

### Authentication Context
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebaseService';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### Firebase Authentication Service
```javascript
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth } from './firebaseService';

class AuthService {
  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.setupPersistence();
  }

  async setupPersistence() {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error) {
      console.warn('Firebase persistence setup failed:', error);
    }
  }

  async signInWithGoogle() {
    try {
      this.googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      
      // Create user profile if first time
      await this.createUserProfile(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  }

  async createUserProfile(user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        skillsSetup: false,
        onboardingComplete: false
      });
    }
  }
}

export default new AuthService();
```

## 🎯 Authentication Flow

### Login Process
1. **User Clicks Login**: Redirect to Google OAuth
2. **Google Authentication**: User authenticates with Google
3. **Token Exchange**: Receive Firebase auth token
4. **Profile Creation**: Create user document in Firestore
5. **Route Protection**: Redirect based on setup status

### Route Protection
```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export function SkillSetupRoute({ children }) {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const data = await firebaseService.getUserStats(currentUser.uid);
        setUserData(data);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  if (loading) return <div>Loading...</div>;
  
  if (!userData?.skillsSetup) {
    return <Navigate to="/skill-setup" replace />;
  }
  
  return children;
}
```

## 🎨 User Interface Components

### Login Page
```javascript
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      if (result.success) {
        navigate('/skill-setup');
      } else {
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <img src="/src/assets/ailogo.png" alt="AI" className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SkillSync</h1>
          <p className="text-gray-600">AI-powered interview preparation platform</p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                {/* Google icon SVG */}
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
```

### Onboarding Flow
```javascript
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    experience: '',
    education: '',
    careerGoals: '',
    interests: []
  });

  const steps = [
    { title: 'Experience Level', component: ExperienceStep },
    { title: 'Education Background', component: EducationStep },
    { title: 'Career Goals', component: CareerGoalsStep },
    { title: 'Interests', component: InterestsStep }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await firebaseService.updateUserStats(currentUser.uid, {
      ...formData,
      onboardingComplete: true
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Complete Your Profile</h1>
              <span className="text-sm text-gray-500">{step} of {steps.length}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {React.createElement(steps[step - 1].component, {
              data: formData,
              onChange: setFormData
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
            >
              {step === steps.length ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 User Profile Management

### Profile Data Structure
```javascript
const userProfile = {
  // Basic Info
  uid: 'firebase-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  photoURL: 'https://example.com/photo.jpg',
  
  // Onboarding Data
  experience: 'intermediate',
  education: 'Computer Science Degree',
  careerGoals: 'Full-stack Developer',
  interests: ['React', 'Node.js', 'Machine Learning'],
  
  // Setup Status
  skillsSetup: true,
  onboardingComplete: true,
  
  // Timestamps
  createdAt: '2024-01-01T00:00:00Z',
  lastActive: '2024-01-15T12:00:00Z'
};
```

### Profile Update Operations
```javascript
class UserProfileService {
  async updateProfile(userId, updates) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  }

  async updatePreferences(userId, preferences) {
    await updateDoc(doc(db, 'users', userId), {
      preferences: {
        theme: preferences.theme || 'light',
        notifications: preferences.notifications || true,
        language: preferences.language || 'en'
      }
    });
  }
}
```

## 🔒 Security Features

### Authentication Security
- **OAuth 2.0**: Secure Google authentication
- **Token Management**: Automatic token refresh
- **Session Persistence**: Secure local storage
- **CSRF Protection**: Built-in Firebase security

### Data Protection
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Performance Optimizations

### Authentication Caching
```javascript
// Cache user data to reduce database calls
const userCache = new Map();

const getCachedUserData = async (userId) => {
  if (userCache.has(userId)) {
    const cached = userCache.get(userId);
    if (Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
  }
  
  const userData = await firebaseService.getUserStats(userId);
  userCache.set(userId, {
    data: userData,
    timestamp: Date.now()
  });
  
  return userData;
};
```

### Lazy Loading
- **Route-based Code Splitting**: Load auth components on demand
- **Progressive Enhancement**: Core functionality first
- **Offline Support**: Cache authentication state

## 🧪 Testing Strategy

### Unit Tests
```javascript
describe('Authentication Service', () => {
  test('should sign in with Google successfully', async () => {
    const mockUser = { uid: 'test-uid', displayName: 'Test User' };
    jest.spyOn(auth, 'signInWithPopup').mockResolvedValue({ user: mockUser });
    
    const result = await authService.signInWithGoogle();
    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
  });
});
```

### Integration Tests
- Complete authentication flow
- Route protection validation
- Profile creation and updates
- Session persistence

## 🔮 Future Enhancements

- **Multi-factor Authentication**: Enhanced security options
- **Social Login**: Additional OAuth providers
- **Enterprise SSO**: SAML and LDAP integration
- **Account Linking**: Multiple authentication methods
- **Advanced Permissions**: Role-based access control