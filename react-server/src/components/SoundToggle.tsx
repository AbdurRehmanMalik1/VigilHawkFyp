import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../feature/store/reduxHooks";
import { setSoundsEnabled } from "../feature/store/slices/dashboardSettings";

export default function SoundToggle() {
  const dispatch = useAppDispatch();

  const soundEnabled = useAppSelector(state => state.dashboardSettings.soundsEnabled);
  const userId = useAppSelector(state => state.user?.id);

  useEffect(() => {
    if (!userId) return;

    try {
      const key = `${userId}:dashboard_settings`;
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed.sound_enabled = soundEnabled;
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch { }
  }, [soundEnabled, userId]);

  function toggleSound() {
    dispatch(setSoundsEnabled(!soundEnabled));
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg  dark:bg-background-dark/50">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">
          Toggle Dashboard Sound
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Default Active: Toggle Dashboard Sound to be alerted about notifications.
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="dashboard_alerts"
          checked={soundEnabled}
          onChange={toggleSound}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>

  );
}
// }
// const ada = <label className="relative inline-flex items-center cursor-pointer">
//   <input
//     type="checkbox"
//     className="sr-only peer"
//     checked={soundEnabled}
//     onChange={toggleSound}
//     aria-label="Toggle sound"
//   />
//   <div
//     className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full 
//                    peer peer-checked:bg-primary 
//                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
//                    after:bg-white after:border-gray-300 after:border after:rounded-full 
//                    after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
//   />
//   <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white select-none">
//     Sound
//   </span>
// </label>