import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Cameras from '../pages/Cameras';
import PageLayout from '../pageLayout/PageLayout';
import SingleCamera from '../pages/SingleCamera';
import Analytics from '../pages/Analytics';
import SystemSettings from '../pages/SystemSettings';
import CameraConfiguration from '../pages/CameraConfiguration';
import AlertsAndLogs from '../pages/AlertsAndLogs';

const layoutRoutes = [
  { path: "cameras", element: <Cameras /> },
  { path: "cameras/:location", element: <SingleCamera /> },
  { path: "analytics", element: <Analytics /> },
  { path: "system-settings", element: <SystemSettings /> },
  { path: "camera-configuration", element: <CameraConfiguration /> },
  { path: "alerts-logs", element: <AlertsAndLogs /> },
];

const AppRouter = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* Auto-wrapped layout routes */}
        {layoutRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<PageLayout>{element}</PageLayout>}
          />
        ))}

        {/* Redirect root to cameras */}
        <Route path="/" element={<Navigate to="cameras" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
