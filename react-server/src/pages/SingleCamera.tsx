import { useParams } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../feature/store/reduxHooks";
import {
  getRegisteredCamerasAPI,
  type CameraOut,
  startCameraAPI,
  stopCameraAPI,
} from "../feature/api/camera";
import { useMutation } from "@tanstack/react-query";
import { addStoppedGeneratedCamera, removeStoppedGeneratedCamera, setCameras, setGeneratedCameras } from "../feature/store/slices/cameraSlice";
import socket from "../utils/socket";
import HlsVideoPlayer from "../components/HlsVideoPlayer";



export interface Detection {
  class_name: string;
  class_id: number;
  confidence: number; // 0–1
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface DetectionPayload {
  camera_id: string;
  frame_id: string;
  detections: Detection[];
  description: string;
}

export interface NotificationItem {
  type: string; // e.g., "detection_alert"
  payload?: DetectionPayload;
  timestamp: string; // ISO timestamp
}

export interface TableNotification {
  timestamp: string;      // cleaned timestamp
  event: string;          // type or event name
  description: string;    // optional
  detections: string;     // "person (90%), car (81%)"
}

export default function SingleCamera() {
  const { camera_id } = useParams<{ camera_id: string }>();
  const dispatch = useAppDispatch();

  const { generatedCameras, stoppedGeneratedCameras, cameras } = useAppSelector((state) => state.camera);
  const [camera, setCamera] = useState<CameraOut | null>(null);
  const [, setNotifications] = useState<NotificationItem[]>([]); // raw
  const [tableNotifications, setTableNotifications] = useState<TableNotification[]>([]); // cleaned
  const [recentThreat, setRecentThreat] = useState({
    hasPerson: false,
    hasWeapon: false,
    timestamps: [] as string[],
  });

  // Fetch registered cameras mutation
  const { isPending } = useMutation({
    mutationFn: getRegisteredCamerasAPI,
    onSuccess: (data) => {
      dispatch(setCameras(data));
      const found = data.find((c) => c.id === camera_id) ?? null;
      setCamera(found);
    },
  });

  // Start camera mutation
  const { mutateAsync: startCamera, isPending: isStarting } = useMutation({
    mutationFn: startCameraAPI,
    onSuccess: (data) => {
      // Update camera URL on start if needed
      setCamera((prev) => (prev ? { ...prev, url: data.camera_url } : prev));
      dispatch(removeStoppedGeneratedCamera(data.camera_id))
      const cam = cameras.find(c => c.id === data.camera_id) as CameraOut;
      const newGenCam = {
        ...cam,
        url: data.camera_url,
      };
      // const filteredCameras = generatedCameras.filter(c => c.id !== newGenCam.id);
      // dispatch(setGeneratedCameras([...filteredCameras, newGenCam]))
      dispatch(setGeneratedCameras([...generatedCameras, newGenCam]))
      toggleShowStream(true)
    },
    onError: (error) => {
      alert(`Failed to start camera: ${error}`);
    },
  });

  // Stop camera mutation
  const { mutateAsync: stopCamera, isPending: isStopping } = useMutation({
    mutationFn: stopCameraAPI,
    onSuccess: (res) => {
      dispatch(addStoppedGeneratedCamera(res.camera_id))
      toggleShowStream(false);
    },
    onError: (error) => {
      alert(`Failed to stop camera: ${error}`);
    },
  });

  const [showStream, toggleShowStream] = useState<boolean>(true)

  useEffect(() => {
    if (stoppedGeneratedCameras.find(id => id === camera_id))
      toggleShowStream(false);
    else
      toggleShowStream(true)

    const foundCamera = generatedCameras.find((c) => c.id === camera_id) ?? null;
    if (!foundCamera) {
      console.log("Camera not found");
    }
    setCamera(foundCamera);
  }, [camera_id, generatedCameras]);

  function summarizeDetections(detections: any[]) {
    if (!detections || detections.length === 0) return "—";

    // Count occurrences of each class_name
    const counts: Record<string, number> = {};
    for (const d of detections) {
      const name = d.class_name ?? "object";
      counts[name] = (counts[name] || 0) + 1;
    }

    const parts = Object.entries(counts).map(([name, count]) => {
      const plural = count > 1 ? `${name}s` : name;
      return `${count} ${plural}`;
    });

    // "2 weapons and 1 person"
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
  }

  const pushRawNotification = useCallback((data: NotificationItem) => {
    setNotifications(prev => [data, ...prev].slice(0, 100));
  }, []);

  const pushTableNotification = useCallback((data: NotificationItem) => {
    if (data?.payload?.camera_id !== camera_id) return;

    const cleanTimestamp = data.timestamp?.split(".")[0] ?? "—";

    const detections = data.payload?.detections || [];
    const summary = detections.length ? summarizeDetections(detections) : "—";

    const detectionList = detections
      .map((d: any) => `${d.class_name} (${Math.round(d.confidence * 100)}%)`)
      .join(", ");

    const cleaned: TableNotification = {
      timestamp: cleanTimestamp,
      event: data.type ?? "event",
      description: data.payload?.description ?? summary,
      detections: detectionList || "—",
    };

    // ---- Update table list (max 100)
    setTableNotifications(prev => {
      const updated = [cleaned, ...prev].slice(0, 100);
      return updated;
    });

    // ---- Maintain latest 5 timestamps
    setRecentThreat(prev => {
      // Insert new timestamp and keep sorted (latest first)
      const newList = [cleanTimestamp, ...prev.timestamps]
        .sort((a, b) => (a > b ? -1 : 1))
        .slice(0, 5);

      // If the new timestamp is not newer than the 5th, ignore
      if (newList.length === 5 && cleanTimestamp <= newList[4]) {
        return prev;
      }

      // Check if ANY of the last 5 notifications include both person & weapon
      const allLastFive = tableNotifications
        .filter(n => newList.includes(n.timestamp))
        .concat([cleaned]); // include the latest arriving one

      const hasPerson = allLastFive.some(n =>
        n.detections.toLowerCase().includes("person")
      );

      const hasWeapon = allLastFive.some(n =>
        n.detections.toLowerCase().includes("weapon")
      );

      return {
        hasPerson,
        hasWeapon,
        timestamps: newList,
      };
    });

  }, [camera_id, tableNotifications]);



  useEffect(() => {
    if (!camera_id) return;

    const handler = (data: NotificationItem) => {
      pushRawNotification(data);       // full raw data
      pushTableNotification(data);     // optimized UI version
    };

    socket.on("notification", handler);
    socket.on("detection", handler);

    return () => {
      socket.off("notification", handler);
      socket.off("detection", handler);
    };
  }, [camera_id, pushRawNotification, pushTableNotification]);

  if (isPending) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p>Loading camera details...</p>
      </main>
    );
  }


  // if (error) {
  //   return (
  //     <main className="flex-1 flex items-center justify-center text-red-600">
  //       <p>Failed to load camera details.</p>
  //     </main>
  //   );
  // }

  const { location } = camera || {};

  function CameraStream({ showStream, camera }: { showStream: boolean, camera: CameraOut | null }) {
    if (showStream && !camera) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p>Camera not found</p>
        </div>
      );
    }
    if (!showStream && camera) {
      // Empty image placeholder when stream is off but camera exists
      return (
        <img
          alt="No Stream"
          src="" // empty src disables image loading
          className="w-full h-full object-cover"
        />
      );
    }
    let isRtsp = false;
    if (camera?.url?.includes('8083'))
      isRtsp = true;
    if (showStream && camera) {
      return (
        isRtsp ? <HlsVideoPlayer src={camera.url} /> :
          <img
            src={camera.url}
            alt="Live Stream"
            className="w-full h-full object-cover"
          />
      );
    }

    // fallback: nothing to show
    return null;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main content */}
          <div className="col-span-3 lg:col-span-2">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Camera: {location ?? "Unknown Location"}
            </h1>

            <div className="mx-auto relative mb-6 aspect-video w-[70%] overflow-hidden rounded-lg bg-black">
              {<CameraStream showStream={showStream} camera={camera} />/* {generatedCamerasStream(url)} */}
            </div>
            <div className="flex justify-center space-x-4 mb-8 w-[70%] mx-auto">
              <button
                onClick={() => startCamera(camera_id!)}
                disabled={isStarting || isStopping}
                className="flex h-10 w-32 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isStarting ? "Starting..." : "Start"}
              </button>
              <button
                onClick={() => stopCamera(camera_id!)}
                disabled={isStopping || isStarting}
                className="flex h-10 w-32 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 px-4 text-sm font-bold text-black dark:text-white transition-colors hover:bg-black/20 dark:hover:bg-white/20 disabled:opacity-50"
              >
                {isStopping ? "Stopping..." : "Stop"}
              </button>
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
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Detections</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/10 dark:divide-white/10">
                    {tableNotifications.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-3">
                          No notifications yet
                        </td>
                      </tr>
                    ) : (
                      tableNotifications.map((n, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">{n.timestamp}</td>
                          <td className="px-4 py-3">{n.event}</td>
                          <td className="px-4 py-3">{n.description}</td>
                          <td className="px-4 py-3">{n.detections}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          {/* <div className="col-span-3 lg:col-span-1 space-y-6">
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
          </div> */}
          <div className="col-span-3 lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                Detected Objects (last 5 events)
              </h3>

              <div className="space-y-4">
                {recentThreat.hasPerson && (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 text-black dark:text-white">
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
                      <p className="font-medium text-black dark:text-white">Person</p>
                      <p className="text-sm text-black/60 dark:text-white/60">Detected Recently</p>
                    </div>
                  </div>
                )}

                {recentThreat.hasWeapon && (
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 text-black dark:text-white">
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
                      <p className="text-sm text-black/60 dark:text-white/60">Detected Recently</p>
                    </div>
                  </div>
                )}

                {!recentThreat.hasPerson && !recentThreat.hasWeapon && (
                  <p className="text-sm text-black/60 dark:text-white/60">No recent threats</p>
                )}
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
