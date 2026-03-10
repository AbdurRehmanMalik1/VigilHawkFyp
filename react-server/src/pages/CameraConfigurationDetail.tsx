import { useParams } from "react-router";
import {
  getCameraByIdAPI,
  getCameraConfigurationAPI,
  updateCameraConfigurationAPI,
  type CameraConfiguration,
  type CameraOut
} from "../feature/api/camera";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

export default function CameraConfigurationDetail() {
  const { camera_id } = useParams<{ camera_id: string }>();
  const [cameraConfig, setCameraConfig] = useState<CameraConfiguration>();
  const [originalConfig, setOriginalConfig] = useState<CameraConfiguration>();
  const [camera, setCamera] = useState<CameraOut>();


  const { mutate: fetchCamera } = useMutation({
    mutationFn: (id: string) => getCameraByIdAPI(id),
    onSuccess: (data) => setCamera(data),
    onError: (err: Error) => console.error("Failed to fetch camera:", err),
  });

  // Find the camera from Redux
  const { mutate: fetchCameraConfig, isPending, isError } = useMutation({
    mutationFn: (id: string) => getCameraConfigurationAPI(id),
    onSuccess: (data) => {
      setCameraConfig(data);
      setOriginalConfig(data);
    },
    onError: (err: Error) => {
      console.error("Failed to fetch camera configuration:", err);
    },
  });

  const { mutate: updateCameraConfig, isPending: isUpdating } = useMutation({
    mutationFn: (data: Partial<Omit<CameraConfiguration, "camera_id">>) => {
      if (!camera_id) return Promise.reject();
      const payload: Partial<Omit<CameraConfiguration, "camera_id">> = {
        ...data,
        // Convert -1 persons_allowed to 0
        persons_allowed: data.persons_allowed === -1 ? 0 : data.persons_allowed,
        // Ensure time strings are in HH:MM:SS format
        allowed_time_range_from: data.allowed_time_range_from
          ? data.allowed_time_range_from.length === 5
            ? data.allowed_time_range_from + ":00"
            : data.allowed_time_range_from as any
          : null,
        allowed_time_range_to: data.allowed_time_range_to
          ? data.allowed_time_range_to.length === 5
            ? data.allowed_time_range_to + ":00"
            : data.allowed_time_range_to as any
          : null,
      };
      if (payload.persons_allowed == -1)
        payload.persons_allowed = 0;
      return updateCameraConfigurationAPI(camera_id, payload);
    },
    onSuccess: (data) => {
      const result = { ...data };
      if (data.persons_allowed == 0)
        result.persons_allowed = -1;

      setCameraConfig(result);
      setOriginalConfig(result);
    },
    onError: (err: Error) => {
      console.error("Failed to update configuration:", err);
      alert("Failed to save configuration");
    },
  });

  useEffect(() => {
    if (camera_id) {
      fetchCamera(camera_id)
      fetchCameraConfig(camera_id)
    };
  }, [camera_id]);

  if (!camera) return <div>Camera not found</div>;
  if (isPending) return <div>Loading configuration...</div>;
  if (isError) return <div>Failed to load configuration</div>;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/10 dark:border-gray-800/50 px-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {camera.name}: {camera.location}
        </h2>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <section className="bg-card-dark p-6 rounded-xl border border-gray-800/50 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-700/50 pb-4">
              Camera Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Detection */}
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-white" htmlFor="ai-detection">
                    Enable AI Detection
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="ai-detection"
                      type="checkbox"
                      className="sr-only peer"
                      checked={cameraConfig?.ai_detection || false}
                      onChange={e =>
                        setCameraConfig(prev => prev ? { ...prev, ai_detection: e.target.checked } : prev)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>

              {/* Persons Allowed */}
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all hover:border-primary/50">
                <label className="block font-medium text-white mb-2" htmlFor="persons-allowed">
                  Persons Allowed
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={-1}
                    max={10}
                    step={1}
                    value={cameraConfig?.persons_allowed || 1}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setCameraConfig(prev =>
                        prev
                          ? { ...prev, persons_allowed: val }
                          : prev
                      );
                    }}
                    className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer appearance-none"
                  />
                  <span className="font-medium text-white w-8 text-center">
                    {cameraConfig?.persons_allowed === -1 ? 0 : cameraConfig?.persons_allowed || 1}
                  </span>
                </div>
              </div>

              {/* Alert Priority */}
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all hover:border-primary/50">
                <label className="block font-medium text-white mb-2" htmlFor="alert-priority">
                  Alert Priority
                </label>
                <select
                  id="alert-priority"
                  value={cameraConfig?.alert_priority || "Medium"}
                  onChange={e =>
                    setCameraConfig(prev => prev ? { ...prev as any, alert_priority: e.target.value } : prev)
                  }
                  className="w-full bg-background-dark border border-gray-700 text-white rounded-lg p-2 focus:ring-primary focus:border-primary"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              {/* Dashboard Alerts */}
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-white" htmlFor="dashboard-alerts">
                    Enable Dashboard Alerts
                  </label>
                  <input
                    type="checkbox"
                    id="dashboard-alerts"
                    checked={cameraConfig?.dashboard_alerts || false}
                    onChange={e =>
                      setCameraConfig(prev => prev ? { ...prev, dashboard_alerts: e.target.checked } : prev)
                    }
                    className="h-5 w-5 accent-primary"
                  />
                </div>
              </div>

              {/* Email Alerts */}
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-white" htmlFor="email-alerts">
                    Enable Email Alerts
                  </label>
                  <input
                    type="checkbox"
                    id="email-alerts"
                    checked={cameraConfig?.email_alerts || false}
                    onChange={e =>
                      setCameraConfig(prev => prev ? { ...prev, email_alerts: e.target.checked } : prev)
                    }
                    className="h-5 w-5 accent-primary"
                  />
                </div>
              </div>

              {/* Allowed Time Range */}
              <div className="bg-background-dark p-4 rounded-lg border border-gray-700/50 transition-all hover:border-primary/50 col-span-2">
                <label className="block font-medium text-white mb-2">Allowed Time Range</label>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">From</span>
                    <input
                      type="time"
                      value={cameraConfig?.allowed_time_range_from || ""}
                      onChange={e =>
                        setCameraConfig(prev => prev ? { ...prev, allowed_time_range_from: e.target.value } : prev)
                      }
                      className="bg-background-dark border border-gray-700 text-white rounded-lg p-2 focus:ring-primary focus:border-primary accent-primary"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">To</span>
                    <input
                      type="time"
                      value={cameraConfig?.allowed_time_range_to || ""}
                      onChange={e =>
                        setCameraConfig(prev => prev ? { ...prev, allowed_time_range_to: e.target.value } : prev)
                      }
                      className="bg-background-dark border border-gray-700 text-white rounded-lg p-2 focus:ring-primary focus:border-primary accent-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Camera AI monitoring will only be active during this time range.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700/50">
              <button
                className="px-6 py-2 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                onClick={() => originalConfig && setCameraConfig(originalConfig)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
                onClick={() => {
                  if (cameraConfig) {
                    const dataToUpdate = {
                      ...cameraConfig,
                      persons_allowed:
                        cameraConfig.persons_allowed === -1 ? 0 : cameraConfig.persons_allowed,
                    };
                    updateCameraConfig(dataToUpdate);
                  }
                }}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Confirm"}
              </button>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}