import { Routes, Route, Navigate } from 'react-router-dom';
        import LoginPage from './pages/auth/LoginPage';
        import RegisterPage from './pages/auth/RegisterPage';
        import AdminDashboard from './pages/dashboard/AdminDashboard';
        import MentorDashboard from './pages/dashboard/MentorDashboard';
        import StudentDashboard from './pages/dashboard/StudentDashboard';
        import DocumentVerificationSelector from './pages/admin/DocumentVerificationSelector';
        import MentorDocumentVerification from './pages/admin/MentorDocumentVerification';
        import StudentDocumentVerification from './pages/admin/StudentDocumentVerification';
        import ProtectedRoute from './components/ProtectedRoute';
        import HomePage from './pages/HomePage';
        import { useAuth } from './hooks/useAuth';

        function App() {
          const { isAuthenticated } = useAuth();
          return (
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/verify" element={<DocumentVerificationSelector />} />
                <Route path="/admin/verify/mentors" element={<MentorDocumentVerification />} />
                <Route path="/admin/verify/students" element={<StudentDocumentVerification />} />
                <Route path="/mentor" element={<MentorDashboard />} />
                <Route path="/student" element={<StudentDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          );
        }

        export default App;
