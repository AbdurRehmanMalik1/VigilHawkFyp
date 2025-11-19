

export default function CameraConfiguration() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/10 dark:border-gray-800/50 px-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Camera 1: Living Room
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{
                  backgroundImage: `url('https://www.w3schools.com/howto/img_avatar.png')`
                }}
              ></div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                Azwa Nawaz
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <section className="bg-card-dark p-6 rounded-xl border border-gray-800/50 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-700/50 pb-4">
              Camera Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-white" htmlFor="ai-detection">
                    Enable AI Detection
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      defaultChecked={true}
                      className="sr-only peer"
                      id="ai-detection"
                      type="checkbox"
                      defaultValue=""
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-primary/50">
                <label
                  className="block font-medium text-white mb-2"
                  htmlFor="detection-sensitivity"
                >
                  Persons Allowed
                </label>
                <div className="flex items-center gap-4">
                  <input
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    id="detection-sensitivity"
                    max={100}
                    min={0}
                    type="range"
                    defaultValue={80}
                  />
                  <span className="font-medium text-white w-8 text-center">4</span>
                </div>
              </div>
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-primary/50">
                <label
                  className="block font-medium text-white mb-2"
                  htmlFor="alert-priority"
                >
                  Alert Priority
                </label>
                <select
                  className="w-full bg-background-dark border border-gray-700 text-white rounded-lg p-2 focus:ring-primary focus:border-primary"
                  id="alert-priority"
                >
                  <option>High</option>
                  <option selected={true}>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-primary/50">
                <div className="flex items-center justify-between mb-4">
                  <label
                    className="font-medium text-white"
                    htmlFor="dashboard-alerts"
                  >
                    Enable Dashboard Alerts
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      defaultChecked={true}
                      className="sr-only peer"
                      id="dashboard-alerts"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <label className="font-medium text-white" htmlFor="email-alerts">
                    Enable Email Alerts
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      defaultChecked={true}
                      className="sr-only peer"
                      id="email-alerts"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-primary/50">
                <label className="block font-medium text-white mb-2">
                  Allowed Time Range
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">From</span>
                    <input
                      type="time"
                      className="bg-background-dark border border-gray-700 text-white rounded-lg p-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">To</span>
                    <input
                      type="time"
                      className="bg-background-dark border border-gray-700 text-white rounded-lg p-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-800 mt-2">
                  Camera AI monitoring will only be active during this time range.
                </p>
              </div>
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-primary/50 mt-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-white">
                    Weapon Access Control
                  </label>
                  <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors duration-200">
                    Configure
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Manage which weapons are allowed or disallowed in this monitored
                  zone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700/50">
              <button className="px-6 py-2 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200">
                Restore Defaults
              </button>
              <button className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200">
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}