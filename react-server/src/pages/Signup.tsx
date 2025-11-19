import { Link } from 'react-router';
import VigilHawkIcon from '../assets/Vigil Hawk icon.png';

export default function Signup() {
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
              <path
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
                fillRule="evenodd"
              />
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
                <p>
                  Already have an account?
                </p>
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
            <form action="#" className="mt-8 space-y-6" method="POST">
              <div className="space-y-4 rounded-lg">
                <div>
                  <label className="sr-only" htmlFor="full-name">
                    Full Name
                  </label>
                  <input
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    id="full-name"
                    name="full-name"
                    placeholder="Full Name"
                    required={true}
                    type="text"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="email-address">
                    Email address
                  </label>
                  <input
                    autoComplete="email"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    id="email-address"
                    name="email"
                    placeholder="Email address"
                    required={true}
                    type="email"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                  <input
                    autoComplete="new-password"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    id="password"
                    name="password"
                    placeholder="Password"
                    required={true}
                    type="password"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <input
                    autoComplete="new-password"
                    className="relative block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Confirm Password"
                    required={true}
                    type="password"
                  />
                </div>
                <div></div>
              </div>
              <div>
                <button
                  className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                  type="submit"
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  </span>
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </main >
    </div >
  )
}