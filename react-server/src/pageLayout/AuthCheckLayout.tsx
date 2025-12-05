import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router'
import { fetchCurrentUserAPI } from '../feature/api/user';

const AuthCheckLayout = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        await fetchCurrentUserAPI(); // throws if not logged in or invalid token
        navigate('/cameras', { replace: true });
      } catch {
        // not logged in, allow showing login/signup
      } finally {
        setChecking(false);
      }
    }
    checkUser();
  }, [navigate]);

  if (checking) {
    // Optionally, show loading spinner or null while checking auth
    return null;
  }

  // Render the login/signup pages (or whatever is nested inside)
  // If you use routes with children, use <Outlet />
  return <Outlet />;
};

export default AuthCheckLayout;
