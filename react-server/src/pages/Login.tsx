import React, { useState } from 'react';
import VigilHawkIcon from '../assets/Vigil Hawk icon.png';
import { TailSpin } from 'react-loader-spinner';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { loginUserAPI, type Token } from '../feature/api/auth';
import { setUser } from '../feature/store/slices/authSlice';
import { useAppDispatch } from '../feature/store/reduxHooks';
import { fetchCurrentUserAPI } from '../feature/api/user';
import { setSoundsEnabled } from '../feature/store/slices/dashboardSettings';

export default function Login() {
  const [username, setUsername] = useState('testuser@gmail.com');
  const [password, setPassword] = useState('12345678');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const mutation = useMutation({
    mutationFn: loginUserAPI,
    onSuccess: async (data: Token) => {
      localStorage.setItem('authToken', data.access_token);
      console.log(localStorage.getItem('authToken'))
      try {
        const userData = await fetchCurrentUserAPI();
        // 3. Dispatch user data to redux store
        dispatch(setUser(userData));
        const storedSettings = localStorage.getItem(`${userData?.id}:dashboard_settings`);
        let soundsEnabled = true;  // default true if no stored settings

        if (storedSettings) {
          try {
            const parsed = JSON.parse(storedSettings);
            if (typeof parsed.sound_enabled === 'boolean') {
              soundsEnabled = parsed.sound_enabled;
            }
          } catch {
          }
        } else {
          localStorage.setItem(
            `${userData?.id}:dashboard_settings`,
            JSON.stringify({ sound_enabled: true })
          );
        }

        dispatch(setSoundsEnabled(soundsEnabled));
        navigate('/');
      } catch (error: any) {
        alert(error.message || 'Failed to fetch user data');
      }
    },
    onError(error: Error) {
      alert(error.message || 'Failed to Login');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('submit called');

    mutation.mutate({ username, password });
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgVIUHGE5gVedNOQf1Ig6fzHSjJtRMT83PWvl4CzmiQZo_4-boobLRz4_nd1bqgu2lVleJ60ylmGXdizZDOWBA4O4kC_IXQGhpwFwXmPoOiH5fHh6uqdglvgU3pQSge7hpRtyieQIxEILWx3ZMQNdAf63Gtd-uvN7ODsak3Dg3zlPmKmBA08JvGrnFDTDVFOADLKpzXRDL79D_haHc-nhaX2sqPgCAy80gnZNmIQRTdFcqFpd1HXpJs4FShOuDCAL4bGDjY65-LcZg")',
      }}
    >
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-full max-w-md flex-col items-center p-8"
      >
        <div className="mb-8 text-center">
          <img
            alt="VigilHawk Logo"
            className="mx-auto h-24 w-auto mb-4"
            src={VigilHawkIcon}
          />
          <h1 className="text-3xl font-bold text-white">VigilHawk</h1>
        </div>
        <div className="w-full space-y-6">
          <div className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="username">
                Username or Email
              </label>
              <input
                className="form-input w-full rounded-lg border-2 border-background-dark/20 bg-background-light/10 p-4 text-white placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-background-light/20 dark:bg-background-dark/20"
                id="username"
                name="username"
                placeholder="Username or Email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <input
                className="form-input w-full rounded-lg border-2 border-background-dark/20 bg-background-light/10 p-4 text-white placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-background-light/20 dark:bg-background-dark/20"
                id="password"
                name="password"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                className="form-checkbox h-4 w-4 rounded border-gray-500 bg-transparent text-primary checked:bg-primary checked:border-transparent focus:ring-primary"
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label
                className="ml-2 block text-sm text-gray-300"
                htmlFor="remember-me"
              >
                Remember Me
              </label>
            </div>
            <a
              className="text-sm text-gray-300 hover:text-primary hover:underline"
              href="#"
            >
              Forgot Password?
            </a>
          </div>

          <button
            disabled={mutation.isPending}
            className="relative flex justify-center w-full rounded-lg bg-primary px-5 py-3 text-base font-bold text-white transition-transform duration-200 hover:scale-105 disabled:opacity-70"
            type="submit"
          >
            {mutation.isPending ? (
              <TailSpin
                height={24}
                width={24}
                color="white"
                ariaLabel="loading"
              />
            ) : (
              'Login'
            )}
          </button>

          {mutation.isError && (
            <p className="mt-2 text-center text-sm text-red-500">
              {(mutation.error as Error).message}
            </p>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>© 2025 VigilHawk. All rights reserved.</p>
        </footer>
      </form>
    </div>
  );
}
