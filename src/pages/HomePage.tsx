import { useEffect } from 'react';
        import { useNavigate } from 'react-router-dom';
        import { useAuth } from '@/hooks/useAuth';

        const HomePage = () => {
          const { user, isAuthenticated } = useAuth();
          const navigate = useNavigate();

          useEffect(() => {
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }

            switch (user?.role) {
              case 'admin':
                navigate('/admin');
                break;
              case 'mentor':
                navigate('/mentor');
                break;
              case 'student':
                navigate('/student');
                break;
              default:
                navigate('/login');
            }
          }, [user, isAuthenticated, navigate]);

          return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
          );
        };

        export default HomePage;
