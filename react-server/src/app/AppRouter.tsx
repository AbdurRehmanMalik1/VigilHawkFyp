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

const AppRouter = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="/" element={<PageLayout/>}>
          <Route index element={<Navigate to="cameras" replace />} />
          <Route path='cameras' element={<Cameras/>}/>
          <Route path="cameras/:location" element={<SingleCamera/>}/>
          <Route path="analytics" element={<Analytics/>}/>
          <Route path="system-settings" element={<SystemSettings/>}/>
          <Route path="camera-configuration" element={<CameraConfiguration/>}/>
          <Route path="alerts-logs" element={<AlertsAndLogs/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;