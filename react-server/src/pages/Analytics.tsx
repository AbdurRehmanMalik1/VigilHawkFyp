

export default function Analytics() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics &amp; Insights
        </h2>
        <div className="flex items-center gap-4"></div>
      </header>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">
              <span>Date Range</span>
              <svg
                fill="currentColor"
                height={16}
                viewBox="0 0 256 256"
                width={16}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">
              <span>Threat Type</span>
              <svg
                fill="currentColor"
                height={16}
                viewBox="0 0 256 256"
                width={16}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">
              Export
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-sm font-medium">
              Refresh Data
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Detections
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              1,234
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Cameras
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              15
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Avg. Response Time
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              2.5s
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Threat Trends
          </h3>
          <div className="mt-4">
            <svg
              fill="none"
              height={200}
              preserveAspectRatio="none"
              viewBox="0 0 472 150"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z"
                fill="url(#paint0_linear_chart)"
              />
              <path
                className="text-primary"
                d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={3}
              />
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear_chart"
                  x1={236}
                  x2={236}
                  y1={1}
                  y2={149}
                >
                  <stop
                    className="text-primary"
                    stopColor="currentColor"
                    stopOpacity="0.2"
                  />
                  <stop
                    className="text-primary"
                    offset={1}
                    stopColor="currentColor"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-around mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Camera Activity Insights
            </h3>
            <div className="mt-4 h-48 flex items-end gap-4">
              <div className="flex-1 h-full flex flex-col justify-end items-center">
                <div
                  className="w-3/4 bg-primary/20 dark:bg-primary/30 rounded-t-lg"
                  style={{ height: "40%" }}
                />
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Cam 1
                </p>
              </div>
              <div className="flex-1 h-full flex flex-col justify-end items-center">
                <div
                  className="w-3/4 bg-primary/20 dark:bg-primary/30 rounded-t-lg"
                  style={{ height: "60%" }}
                />
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Cam 2
                </p>
              </div>
              <div className="flex-1 h-full flex flex-col justify-end items-center">
                <div
                  className="w-3/4 bg-primary rounded-t-lg"
                  style={{ height: "80%" }}
                />
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Cam 3
                </p>
              </div>
              <div className="flex-1 h-full flex flex-col justify-end items-center">
                <div
                  className="w-3/4 bg-primary/20 dark:bg-primary/30 rounded-t-lg"
                  style={{ height: "30%" }}
                />
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Cam 4
                </p>
              </div>
              <div className="flex-1 h-full flex flex-col justify-end items-center">
                <div
                  className="w-3/4 bg-primary/20 dark:bg-primary/30 rounded-t-lg"
                  style={{ height: "70%" }}
                />
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  Cam 5
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Threat Type Distribution
            </h3>
            <div className="mt-4 flex items-center justify-center">
              <svg
                className="-rotate-90"
                height={180}
                viewBox="0 0 36 36"
                width={180}
              >
                <circle
                  className="stroke-gray-200 dark:stroke-gray-700"
                  cx={18}
                  cy={18}
                  fill="transparent"
                  r="15.91549430918954"
                  strokeWidth={3}
                />
                <circle
                  className="stroke-primary"
                  cx={18}
                  cy={18}
                  fill="transparent"
                  r="15.91549430918954"
                  strokeDasharray="60, 100"
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  strokeWidth={3}
                />
                <circle
                  className="stroke-primary/50"
                  cx={18}
                  cy={18}
                  fill="transparent"
                  r="15.91549430918954"
                  strokeDasharray="25, 100"
                  strokeDashoffset={-60}
                  strokeLinecap="round"
                  strokeWidth={3}
                />
                <circle
                  className="stroke-primary/30"
                  cx={18}
                  cy={18}
                  fill="transparent"
                  r="15.91549430918954"
                  strokeDasharray="15, 100"
                  strokeDashoffset={-85}
                  strokeLinecap="round"
                  strokeWidth={3}
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              CPU Usage
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                65%
              </p>
              <p className="text-sm font-medium text-green-500">+5%</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Memory Usage
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                78%
              </p>
              <p className="text-sm font-medium text-red-500">-2%</p>
            </div>
          </div>
        </div>
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pt-6">
          © 2024 VigilHawk. All rights reserved.
        </footer>
      </div>
    </div>

  )
}