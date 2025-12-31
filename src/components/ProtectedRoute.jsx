import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  
  // Show loading while auth is being determined
  if (currentUser === undefined) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}