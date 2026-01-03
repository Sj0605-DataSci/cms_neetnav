import { Navigate, Outlet } from 'react-router-dom';
        import { useAuth } from '@/hooks/useAuth';
        import { DashboardLayout } from './layout/DashboardLayout';

        const ProtectedRoute = () => {
          const { isAuthenticated } = useAuth();

          if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
          }

          return (
            <DashboardLayout>
                <Outlet />
            </DashboardLayout>
          );
        };

        export default ProtectedRoute;
