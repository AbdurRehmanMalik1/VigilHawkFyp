

export default function AlertsAndLogs() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-black/90 dark:text-white/90">
            Alerts &amp; Logs
          </h1>
        </header>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black/90 dark:text-white/90 mb-4">
            Alerts
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-black/90 dark:text-white/90 placeholder-black/50 dark:placeholder-white/50"
                placeholder="Search alerts..."
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10">
                Threat Type
              </button>
              <button className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10">
                Date Range
              </button>
              <button className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10">
                Priority Level
              </button>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/20 dark:hover:bg-white/20">
                Clear All Alerts
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                Refresh Alerts
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-lg flex flex-col md:flex-row gap-6 border-l-4 border-red-500">
              <div className="flex-1">
                <h3 className="font-bold text-black/90 dark:text-white/90">
                  High Priority: Suspicious Activity Detected
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                  Camera: Main Entrance • Location: Building A • 10:30 AM •
                  Confidence: 95%
                </p>
                <div className="mt-4 flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 hover:bg-black/20 dark:hover:bg-white/20">
                    <span className="material-symbols-outlined text-base">
                      {/* Check Circle (Acknowledge) */}
                      <svg
                        role="img"
                        aria-label="Acknowledge"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Acknowledge</title>
                        {/* subtle green that shows on dark backgrounds */}
                        <circle
                          cx={12}
                          cy={12}
                          r={10}
                          stroke="#34D399"
                          strokeWidth="1.6"
                          fill="rgba(52,211,153,0.06)"
                        />
                        <path
                          d="M7.8 12.2l2.2 2.2 5.2-5.4"
                          stroke="#34D399"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                    Acknowledge
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 hover:bg-black/20 dark:hover:bg-white/20">
                    <span className="material-symbols-outlined text-base">
                      {/* Video Cam (View Feed) */}
                      <svg
                        role="img"
                        aria-label="View Feed"
                        width={22}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>View Feed</title>
                        {/* camera body */}
                        <rect
                          x="2.5"
                          y="6.5"
                          width={13}
                          height={11}
                          rx={2}
                          stroke="#93C5FD"
                          strokeWidth="1.6"
                          fill="rgba(147,197,253,0.04)"
                        />
                        {/* lens/triangle */}
                        <path
                          d="M16 9.5l5-3v11l-5-3"
                          stroke="#93C5FD"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        {/* small inner dot to hint recording/active */}
                        <circle cx="6.5" cy={12} r="0.9" fill="#93C5FD" />
                      </svg>
                    </span>
                    View Feed
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 hover:bg-black/20 dark:hover:bg-white/20">
                    <span className="material-symbols-outlined text-base">
                      <svg
                        role="img"
                        aria-label="Dismiss"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>Dismiss</title>
                        {/* faint red ring */}
                        <circle
                          cx={12}
                          cy={12}
                          r={10}
                          stroke="#FB7185"
                          strokeWidth="1.4"
                          fill="rgba(251,113,133,0.04)"
                        />
                        {/* X */}
                        <path
                          d="M8 8l8 8M16 8l-8 8"
                          stroke="#FB7185"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Dismiss
                  </button>
                </div>
              </div>
              <div
                className="w-full md:w-64 h-40 bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAX4Utl-XdAvaYvE1Kfyh9nS7UlOcPN1vqLgcNruEnm2ireIQsBb4y37A2-xg5ouY4mYKrQrKhyXBGeXtQrg4Fq33eeiBr7bo8qKWpAiB0iAgSRvRiGLWN8AEu9WNSSQoP5rcvXrzyX8S1msuvLgpg1eG-ZyPxyGA8jX8NqIQq4b8JO5ILKmYQsu3WPHisRSRnnRcvef9Eci0VagQPkfbaYE9qwdHFzr2p6YS2nF5VrHnDRI-WP9nnSOqQIbuTbMPZ619lfBLYx4mFE")'
                }}
              ></div>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-black/90 dark:text-white/90 mb-4">
            Logs
          </h2>
          <div className="overflow-x-auto dark:bg-background-dark rounded-lg border border-black/10 dark:border-white/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">
                    Event Type
                  </th>
                  <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">
                    Source
                  </th>
                  <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">
                    Description
                  </th>
                  <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                <tr>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    2024-03-15 09:00 AM
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    System Startup
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Server
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    System initialized successfully
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    2024-03-15 09:30 AM
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Camera Connection
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Camera 1
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Camera 1 connected to the system
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    2024-03-15 10:00 AM
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Alert Triggered
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    AI Module
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Suspicious activity detected by AI
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-500">
                      Triggered
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    2024-03-15 10:30 AM
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    User Login
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Admin
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Admin user logged into the system
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    2024-03-15 11:00 AM
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Log Export
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    System
                  </td>
                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                    Logs exported successfully
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-500">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button className="px-4 py-2 rounded-lg bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/20 dark:hover:bg-white/20">
              Export Logs
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Auto-Purge Old Logs
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}