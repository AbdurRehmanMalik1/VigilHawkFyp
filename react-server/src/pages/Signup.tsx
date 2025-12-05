import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router'
import VigilHawkIcon from '../assets/Vigil Hawk icon.png';
import { signupUserAPI } from '../feature/api/auth';

export default function Signup() {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await signupUserAPI({ username, email, password });
      // Navigate to login page on success
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ...svg path unchanged... */}
            </svg>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              VigilHawk
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col justify-center items-center">
              <img
                alt="VigilHawk Logo"
                className="mx-auto h-24 w-auto mb-4"
                src={VigilHawkIcon}
              />
              <h1 className="text-3xl font-bold text-white">VigilHawk</h1>
              <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create your account
              </h2>
              <div className="flex flex-row gap-x-1 mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                <p>Already have an account?</p>
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6" method="POST">
              <div className="space-y-4 rounded-lg">
                <div>
                  <label className="sr-only" htmlFor="full-name">
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    name="full-name"
                    placeholder="Full Name"
                    required
                    type="text"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="email-address">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    placeholder="Email address"
                    required
                    type="email"
                    autoComplete="email"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    placeholder="Password"
                    required
                    type="password"
                    autoComplete="new-password"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Confirm Password"
                    required
                    type="password"
                    autoComplete="new-password"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}

              <div>
                <button
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-70"
                  type="submit"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
