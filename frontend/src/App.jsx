import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import ProjectKanban from './pages/ProjectKanban';
import { isAuthenticated } from './utils/auth';

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/project/:projectId" 
          element={
            <ProtectedRoute>
              <ProjectKanban />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/kanban/:slug" 
          element={
            <ProtectedRoute>
              <ProjectKanban />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
