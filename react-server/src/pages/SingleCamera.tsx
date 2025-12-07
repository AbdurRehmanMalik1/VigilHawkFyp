import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../feature/store/reduxHooks";
import { getRegisteredCamerasAPI, type CameraOut } from "../feature/api/camera";
import { useMutation } from "@tanstack/react-query";
import { setCameras } from "../feature/store/slices/cameraSlice";

export default function SingleCamera() {
  const { camera_id } = useParams<{ camera_id: string }>();
  const dispatch = useAppDispatch();

  const cameras = useAppSelector(state => state.camera.cameras);
  const [camera, setCamera] = useState<CameraOut | null>(null);

  const { isPending, error } = useMutation({
    mutationFn: getRegisteredCamerasAPI,
    onSuccess: (data) => {
      dispatch(setCameras(data));
      // After fetching, update the camera from the new data
      const found = data.find(c => c.id === camera_id) ?? null;
      setCamera(found);
    }
  });

  useEffect(() => {
    const foundCamera = cameras.find(c => c.id === camera_id) ?? null;
    if (!foundCamera) {
      console.log('Camera not found');
      // Optionally, you can trigger a refetch here:
      // mutate();
    }
    setCamera(foundCamera);
  }, [camera_id, cameras]);

  if (isPending) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p>Loading camera details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center text-red-600">
        <p>Failed to load camera details.</p>
      </main>
    );
  }

  if (!camera) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p>Camera not found</p>
      </main>
    );
  }

  // Destructure camera info to use in UI
  const { location, url } = camera;

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main content */}
          <div className="col-span-3 lg:col-span-2">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Camera: {location ?? "Unknown Location"}
            </h1>
            <div
              className="mx-auto relative mb-6 aspect-video w-[70%] overflow-hidden rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${url})` }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-110">
                  <svg
                    fill="currentColor"
                    height={32}
                    viewBox="0 0 256 256"
                    width={32}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                Threat Level
              </h3>
              <div className="flex items-center justify-between text-sm text-black/80 dark:text-white/80 mb-1">
                <p className="font-medium">High Threat</p>
                <p>75%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-black/20 dark:bg-white/20">
                <div className="h-full rounded-full bg-red-500" style={{ width: "75%" }} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                Camera Logs
              </h3>
              <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
                <table className="w-full text-left text-sm text-black/80 dark:text-white/80">
                  <thead className="bg-black/5 dark:bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Timestamp</th>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 dark:divide-white/10">
                    <tr>
                      <td className="px-4 py-3">2024-01-20 14:30:00</td>
                      <td className="px-4 py-3">Humanoid Threshold Crossed</td>
                      <td className="px-4 py-3">
                        Too many humanoids are detected in the camera.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">2024-01-20 14:35:00</td>
                      <td className="px-4 py-3">Object Identified</td>
                      <td className="px-4 py-3">Weapon near entrance</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">2024-01-20 14:45:00</td>
                      <td className="px-4 py-3">Threat Assessment</td>
                      <td className="px-4 py-3">Elevated risk level</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">2024-01-20 14:50:00</td>
                      <td className="px-4 py-3">Alert Sent</td>
                      <td className="px-4 py-3">Security personnel notified</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-3 lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                Detected Objects
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 text-black dark:text-white">
                    <svg
                      fill="currentColor"
                      height={24}
                      viewBox="0 0 256 256"
                      width={24}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-black dark:text-white">Humanoid</p>
                    <p className="text-sm text-black/60 dark:text-white/60">Living Room</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 text-black dark:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      width={70}
                      height={70}
                      fill="none"
                    >
                      <rect width={512} height={512} rx={96} ry={96} fill="#1b232a" />
                      <path
                        d="M120 200h200v40h60c10 0 20 8 20 18v10h40v26h-40v10c0 10-10 18-20 18h-70l-10 60h-50l10-60h-60l-20 60h-50l20-60h-20c-10 0-20-8-20-18v-64c0-10 10-20 20-20z"
                        stroke="#ffffff"
                        strokeWidth={24}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-black dark:text-white">Weapon</p>
                    <p className="text-sm text-black/60 dark:text-white/60">Living Room</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">Threat Summary</h3>
              <p className="text-sm text-black/80 dark:text-white/80">
                Multiple anomalies detected. Threat level elevated due to potential intrusion and suspicious objects.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black dark:text-white">
                  Enable Real-Time Alerts
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" defaultValue="" />
                  <div className="peer h-6 w-11 rounded-full bg-black/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/10 dark:after:border-black/10 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-opacity hover:opacity-90">
                <span>Capture Snapshot</span>
              </button>
              <button className="flex h-10 w-full items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 px-4 text-sm font-bold text-black dark:text-white transition-colors hover:bg-black/20 dark:hover:bg-white/20">
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
