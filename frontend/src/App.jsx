import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import Patterns from './pages/Patterns';
import PatternDetail from './pages/PatternDetail';
import AIMentor from './pages/AIMentor';
import InterviewPrep from './pages/InterviewPrep';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold">Authorizing user...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Collapsible Sidebar */}
      <Sidebar />
      
      {/* Route Contents */}
      <main className="flex-1 w-full overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Main routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/planner" 
        element={
          <ProtectedRoute>
            <DailyPlanner />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patterns" 
        element={
          <ProtectedRoute>
            <Patterns />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patterns/:patternName" 
        element={
          <ProtectedRoute>
            <PatternDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-mentor" 
        element={
          <ProtectedRoute>
            <AIMentor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company-prep" 
        element={
          <ProtectedRoute>
            <InterviewPrep />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaderboards" 
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } 
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
