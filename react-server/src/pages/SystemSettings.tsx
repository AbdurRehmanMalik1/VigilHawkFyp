import React, { useState, useEffect } from "react";
import {
  fetchCurrentUserAPI,
  updateSystemSettingsAPI,
  type SafeUser,
  type UserSettings,
} from "../feature/api/user"; // your API fetch fn
import {
  deleteSingleCameraAPI,
  getRegisteredCamerasAPI,
  registerCameraAPI,
  updateCameraAPI,
  type CameraOut,
} from "../feature/api/camera";
import { useAppDispatch, useAppSelector } from "../feature/store/reduxHooks";
import { setCameras, setGeneratedCameras, removeStoppedGeneratedCamera } from "../feature/store/slices/cameraSlice";
import { useMutation } from "@tanstack/react-query";
import SoundToggle from "../components/SoundToggle";
import { updateSystemSettings } from "../feature/store/slices/authSlice";

export default function SystemSettings() {
  // Settings state matching your UserSettings model
  const [settings, setSettings] = useState<UserSettings>({
    ai_detection: true,
    alert_priority: "Medium",
    dashboard_alerts: true,
    email_alerts: false,
  });

  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Camera management state
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  const { cameras, generatedCameras } = useAppSelector((state) => state.camera);


  const { mutate: mutateChangeSettings } = useMutation({
    mutationFn: updateSystemSettingsAPI,
    onError: (error: Error) => {
      alert(`Failed to update settings: ${error.message || error}`);
    },
    onSuccess: (settings) => {
      dispatch(updateSystemSettings(settings))
    }
  });

  // Form state for camera modal
  const [form, setForm] = useState({
    name: "",
    location: "",
    url: "",
  });
  const [editingCamera, setEditingCamera] = useState<CameraOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { mutate: mutateFetchCameras } = useMutation({
    mutationFn: getRegisteredCamerasAPI,
    onSuccess: (data) => {
      dispatch(setCameras([...data]))

    }
  })

  // Fetch current user and load settings on mount
  useEffect(() => {
    async function loadUser() {
      try {
        setLoadingUser(true);
        const user: SafeUser = await fetchCurrentUserAPI();
        if (user?.settings) {
          setSettings(user.settings);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load user settings");
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  // Generic handler for checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  // Handler for select dropdown change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({ ...prev, alert_priority: e.target.value as UserSettings['alert_priority'] }));
  };

  // Handle input changes in the camera form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit handler for camera modal form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCameraError(null);

    try {
      let updatedCamera: CameraOut;
      if (editingCamera) {
        // Update existing camera
        updatedCamera = await updateCameraAPI(editingCamera.id, form);
        dispatch(
          setCameras(
            cameras.map((cam) =>
              cam.id === updatedCamera.id ? updatedCamera : cam
            )
          )
        );
      } else {
        // Create new camera
        updatedCamera = await registerCameraAPI(form);
        dispatch(setCameras([...cameras, updatedCamera]));
      }
      setShowModal(false);
      setEditingCamera(null);
      setForm({ name: "", location: "", url: "" });
      mutateFetchCameras()
    } catch (err: any) {
      setCameraError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fill modal form for editing existing camera
  const handleEdit = (camera: CameraOut) => {
    setEditingCamera(camera);
    setForm({
      name: camera.name,
      location: camera.location,
      url: camera.url,
    });
    setShowModal(true);
  };

  if (loadingUser) return <p>Loading settings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  async function handleDelete(camera: CameraOut): Promise<void> {
    if (!confirm(`Are you sure you want to delete camera "${camera.name}"?`)) return;

    try {
      await deleteSingleCameraAPI(camera.id);
      dispatch(setCameras(cameras.filter(cam => cam.id !== camera.id)));
      dispatch(setGeneratedCameras(generatedCameras.filter(cam => cam.id !== camera.id)));
      dispatch(removeStoppedGeneratedCamera(camera.id));
    } catch (error: any) {
      alert(`Failed to delete camera: ${error}`);
    }
  }

  const handleSubmitSettingsChange = () => {
    mutateChangeSettings(settings);
  }

  const handleRestoreDefault = () => {
    const defaultUserSettings = {
      ai_detection: true,
      alert_priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
      dashboard_alerts: true,
      email_alerts: false,
    };
    setSettings(defaultUserSettings);
    mutateChangeSettings(defaultUserSettings);
  }


  return (
    <div className="flex flex-1 flex-col">
      <header> {/* Your existing header (not shown here) */} </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* System Settings Section */}
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
                    type="checkbox"
                    name="ai_detection"
                    checked={settings.ai_detection}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
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
                <select
                  value={settings.alert_priority}
                  onChange={handleSelectChange}
                  className="w-48 dark:bg-background-dark/50 border border-gray-300 dark:border-gray-700 rounded-lg p-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notification Settings Section */}
          <section>
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Notification Settings
            </h3>
            <div className="space-y-4">
              <SoundToggle />
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
                  <input
                    type="checkbox"
                    name="dashboard_alerts"
                    checked={settings.dashboard_alerts}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                  />
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
                    type="checkbox"
                    name="email_alerts"
                    checked={settings.email_alerts}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Registered Cameras Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Registered Cameras
              </h3>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-primary/20 dark:bg-primary/30 text-primary font-medium rounded-lg hover:bg-primary/30 dark:hover:bg-primary/40"
              >
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
                <tbody className="dark:bg-background-dark divide-y divide-gray-200/10 dark:divide-gray-800/50">
                  {cameras.map((camera) => (
                    <tr key={camera.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {camera.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {camera.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${camera?.status === "Online"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {camera.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(camera)}
                          className="text-primary hover:text-primary/80"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(camera)}
                          className="text-red-600 hover:text-red-800"
                        // You can add delete logic here if you want
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Camera Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {editingCamera ? "Edit Camera" : "Register Camera"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      required
                      value={form.location}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="url"
                      className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      URL
                    </label>
                    <input
                      type="url"
                      name="url"
                      id="url"
                      required
                      value={form.url}
                      onChange={handleChange}
                      placeholder="http://192.168.1.19:8080/video"
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  {cameraError && (
                    <p className="text-red-500 text-sm">{cameraError}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCamera(null);
                        setForm({ name: "", location: "", url: "" });
                        setCameraError(null);
                      }}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <footer className="flex justify-end gap-1 pt-8 border-t border-gray-200/10 dark:border-gray-800/50">
            <button onClick={handleRestoreDefault} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              Restore Defaults
            </button>
            <button onClick={handleSubmitSettingsChange} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90">
              Save Changes
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
