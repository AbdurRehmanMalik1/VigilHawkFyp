import type { JSX } from "react";
import { NavLink, useNavigate } from "react-router";
import { useEffect } from "react";
import { fetchCurrentUserAPI } from "../feature/api/user";
import { useAppDispatch, useAppSelector } from "../feature/store/reduxHooks";
import { clearUser, setUser as setUserRedux } from "../feature/store/slices/authSlice";

type PageLayoutProps = {
  children: JSX.Element;
};

export default function PageLayout({ children }: PageLayoutProps) {
  const { username, isLoggedIn } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchUser() {
      try {
        const safeUser = await fetchCurrentUserAPI();
        if(!isLoggedIn)
          dispatch(setUserRedux(safeUser));
        console.log(safeUser);
      } catch (error) {
        // Silently handle error, no alert
        navigate("/login", { replace: true });
      }
    }
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('authToken');
    navigate('/login', { replace: true });
  };

  return (
    <div
      id="pageLayout"
      className="flex h-screen bg-background-dark text-light font-display border-none"
    >
      {/* Sidebar */}
      <aside
        id="sidebar"
        className="hidden sm:flex flex-col w-80 bg-background-dark/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-700/20 px-4">
          <h1 className="text-3xl font-bold text-light">VigilHawk</h1>
          {/* Show username here if user loaded */}
          {username && (
            <span className="text-sm italic text-secondary">
              {username}
            </span>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-4">
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-xl font-medium rounded transition ${isActive
                ? "bg-primary text-light"
                : "text-secondary hover:bg-primary/20"
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">analytics</span>
            Dashboard Analytics
          </NavLink>

          <NavLink
            to="/cameras"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-xl font-medium rounded transition ${isActive
                ? "bg-primary text-light"
                : "text-secondary hover:bg-primary/20"
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">videocam</span>
            View Cameras
          </NavLink>

          <NavLink
            to="/camera-configuration"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-xl font-medium rounded transition ${isActive
                ? "bg-primary text-light"
                : "text-secondary hover:bg-primary/20"
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">security</span>
            Security Configurations
          </NavLink>

          <NavLink
            to="/alerts-logs"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-xl font-medium rounded transition ${isActive
                ? "bg-primary text-light"
                : "text-secondary hover:bg-primary/20"
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">
              notifications_active
            </span>
            Alerts & Logs
          </NavLink>

          <NavLink
            to="/system-settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-xl font-medium rounded transition ${isActive
                ? "bg-primary text-light"
                : "text-secondary hover:bg-primary/20"
              }`
            }
          >
            <svg
              fill="currentColor"
              height={24}
              width={24}
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z"></path>
            </svg>
            <label className="ml-3"> Settings</label>
          </NavLink>
        </nav>

        <div className="px-2 py-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-xl font-medium rounded transition text-secondary hover:bg-primary/20"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto p-2 bg-background-dark">
        {children}
      </main>
    </div>
  );
}
