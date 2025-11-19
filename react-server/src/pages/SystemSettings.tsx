
export default function SystemSettings() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b border-gray-200/10 dark:border-gray-800/50 px-6 pr-20">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
        <div className="flex items-center gap-1">
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-600 dark:text-gray-300">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="flex items-center gap-1">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage: `url('https://www.w3schools.com/howto/img_avatar.png')`
              }}
            >
            </div>
            
            <div className="text-sm">
              <div className="font-bold text-gray-900 dark:text-white">
                Azwa Nawaz
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <section>
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              System Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg dark:bg-background-dark/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Enable AI Detection
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable or disable the core AI detection capabilities.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    defaultChecked={true}
                    className="sr-only peer"
                    type="checkbox"
                    defaultValue=""
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg dark:bg-background-dark/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Alert Priority
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Set the priority for system-generated alerts.
                  </p>
                </div>
                <select className="w-48  dark:bg-background-dark/50 border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:ring-primary focus:border-primary">
                  <option>Low</option>
                  <option>Medium</option>
                  <option selected={true}>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg  dark:bg-background-dark/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Enable Dashboard Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Default Active: Enable Dashboard for critical alerts.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" defaultValue="" />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg  dark:bg-background-dark/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Enable Email Alerts
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable email notifications for all alerts.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    className="sr-only peer"
                    type="checkbox"
                    defaultValue=""
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Registered Cameras
              </h3>
              <button className="flex items-center gap-1 px-4 py-2 bg-primary/20 dark:bg-primary/30 text-primary font-medium rounded-lg hover:bg-primary/30 dark:hover:bg-primary/40">
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add Camera</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200/10 dark:border-gray-800/50">
              <table className="min-w-full divide-y divide-gray-200/10 dark:divide-gray-800/50">
                <thead className=" dark:bg-background-dark/50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Camera Name
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Location
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Status
                    </th>
                    <th className="relative px-6 py-3" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className=" dark:bg-background-dark divide-y divide-gray-200/10 dark:divide-gray-800/50">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Camera 1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Main Entrance
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Online
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button className="text-primary hover:text-primary/80">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Camera 2
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Back Exit
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Offline
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button className="text-primary hover:text-primary/80">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <footer className="flex justify-end gap-1 pt-8 border-t border-gray-200/10 dark:border-gray-800/50">
            <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              Restore Defaults
            </button>
            <button className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90">
              Save Changes
            </button>
          </footer>
        </div>
      </main>
    </div>
  )
}