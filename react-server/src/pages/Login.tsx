import VigilHawkIcon from '../assets/Vigil Hawk icon.png';

export default function Login(){
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgVIUHGE5gVedNOQf1Ig6fzHSjJtRMT83PWvl4CzmiQZo_4-boobLRz4_nd1bqgu2lVleJ60ylmGXdizZDOWBA4O4kC_IXQGhpwFwXmPoOiH5fHh6uqdglvgU3pQSge7hpRtyieQIxEILWx3ZMQNdAf63Gtd-uvN7ODsak3Dg3zlPmKmBA08JvGrnFDTDVFOADLKpzXRDL79D_haHc-nhaX2sqPgCAy80gnZNmIQRTdFcqFpd1HXpJs4FShOuDCAL4bGDjY65-LcZg")'
      }}
    >
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center p-8">
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
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                className="form-checkbox h-4 w-4 rounded border-gray-500 bg-transparent text-primary checked:bg-primary checked:border-transparent checked:bg-[image:--checkbox-tick-svg] focus:ring-primary"
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
            className="w-full rounded-lg bg-primary px-5 py-3 text-base font-bold text-white transition-transform duration-200 hover:scale-105"
            type="submit"
          >
            Login
          </button>
        </div>
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>© 2025 VigilHawk. All rights reserved.</p>
        </footer>
      </div>
    </div>

  );
};