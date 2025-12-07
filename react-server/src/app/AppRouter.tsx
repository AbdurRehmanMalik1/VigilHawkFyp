import type { JSX } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Cameras from '../pages/Cameras';
import PageLayout from '../pageLayout/PageLayout';
import SingleCamera from '../pages/SingleCamera';
import Analytics from '../pages/Analytics';
import SystemSettings from '../pages/SystemSettings';
import CameraConfiguration from '../pages/CameraConfiguration';
import AlertsAndLogs from '../pages/AlertsAndLogs';
import AuthCheckLayout from '../pageLayout/AuthCheckLayout';

const layoutRoutes = [
  { path: "cameras", element: <Cameras /> },
  { path: "cameras/:camera_id", element: <SingleCamera /> },
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
        <Route element={<AuthCheckLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>


        {/* Auto-wrapped layout routes */}
        {layoutRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<PageLayout>{element}</PageLayout>}
          />
        ))}
        <Route path='/' element={<PageLayout><Cameras/></PageLayout>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
