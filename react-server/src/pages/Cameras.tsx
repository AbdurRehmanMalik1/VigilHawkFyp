import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../feature/store/reduxHooks";
import { useEffect } from "react";
import { getRegisteredCamerasAPI, startCameraAPI, type CameraOut } from "../feature/api/camera";
import { useMutation } from "@tanstack/react-query";
import { setCameras, setGeneratedCameras } from "../feature/store/slices/cameraSlice";
import { TailSpin } from "react-loader-spinner";

export default function Cameras() {
  const navigate = useNavigate();
  const { username } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const { cameras, stoppedGeneratedCameras, generatedCameras } = useAppSelector(state => state.camera);

  const { mutate, isPending } = useMutation({
    mutationFn: getRegisteredCamerasAPI,
    onSuccess: (data) => {
      dispatch(setCameras([...data]))
    }
  })

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    if (cameras.length > 0) {
      Promise.all(
        cameras.map(async (cam: CameraOut) => {
          try {
            if (stoppedGeneratedCameras.find(id => id === cam.id))
              return null;
            
            const tempGen = generatedCameras.find(cam => cam.id === cam.id)
            if (tempGen)
              return tempGen;

            const res = await startCameraAPI(cam.id);
            console.log(`Camera ${cam.id} started:`, res.status);

            // Return new camera object with correct video feed url including camera id
            return {
              ...cam,
              url: res.camera_url,
            };
          } catch (error) {
            console.error(`Failed to start camera ${cam.id}:`, error);
            // Return original camera if start failed
            return cam;
          }
        })
      ).then((updatedCams: (CameraOut | null)[] ) => {
        dispatch(setGeneratedCameras(updatedCams.filter(Boolean) as CameraOut[]));
      });
    }
  }, [cameras]);
  // ==== Navigate Function ====
  const handleCameraClick = (camera_id: string) => {
    navigate(`/cameras/${camera_id}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Action Buttons */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="absolute top-6 right-6 z-10 flex items-center space-x-2 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/20 dark:border-gray-800/60 shadow-lg">
          <button className="flex items-center justify-center w-10 h-10 rounded text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
        </div>

        {/* ==== Cameras Grid ==== */}
        {

          isPending ? <TailSpin
            height={24}
            width={24}
            color="white"
            ariaLabel="loading"
          /> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => handleCameraClick(cam.id)}
                  className="relative group aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer"
                >
                  {/* <video
                    controls
                    autoPlay
                    muted
                    src={cam.url}
                   
                    className="w-full h-full object-cover"
                  /> */}
                  {/* <HlsVideoPlayer src={cam.url}/> */}
                  <img
                    src={cam.url}  // This should point to your MJPEG proxy endpoint
                    alt={`Camera ${cam.id}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Camera Info */}
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-bold text-white">{cam.name}</h3>
                    {/* <p className={`text-xs flex items-center ${cam.statusColor}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${cam.statusColor.replace("text", "bg")} animate-pulse`} />
                  {cam.status}
                </p> */}
                  </div>

                  {/* Alert Badge */}
                  {/* {cam.alert && (
                <div className="absolute top-4 right-4 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
                  ALERT
                </div>
              )} */}
                </div>
              ))}
            </div>

        }

      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-2 dark:bg-background-dark/50 border-t border-gray-200/10 dark:border-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Operator: <span className="font-semibold text-green-300">{username}</span>
        </span>
      </footer>
    </div>
  );
}
