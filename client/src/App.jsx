import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { AdviserOverview } from './pages/adviser/Overview';
import { Students } from './pages/adviser/Students';
import { Activities } from './pages/adviser/Activities';
import { Attendance } from './pages/adviser/Attendance';
import { Fines } from './pages/adviser/Fines';
import { Reports } from './pages/adviser/Reports';
import { Logs } from './pages/adviser/Logs';
import { Scanner } from './pages/officer/Scanner';
import { OfficerOverview } from './pages/officer/Overview';
import { StudentOverview } from './pages/student/Overview';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Adviser Routes */}
          <Route
            path="/adviser/overview"
            element={
              <ProtectedRoute requiredRole="adviser">
                <AdviserOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/students"
            element={
              <ProtectedRoute requiredRole="adviser">
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/activities"
            element={
              <ProtectedRoute requiredRole="adviser">
                <Activities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/attendance"
            element={
              <ProtectedRoute requiredRole="adviser">
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/fines"
            element={
              <ProtectedRoute requiredRole="adviser">
                <Fines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/reports"
            element={
              <ProtectedRoute requiredRole="adviser">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/logs"
            element={
              <ProtectedRoute requiredRole="adviser">
                <Logs />
              </ProtectedRoute>
            }
          />

          {/* Officer Routes */}
          <Route
            path="/officer/scanner"
            element={
              <ProtectedRoute requiredRole="officer">
                <Scanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/overview"
            element={
              <ProtectedRoute requiredRole="officer">
                <OfficerOverview />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/overview"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={<Navigate to="/student/overview" replace />}
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
