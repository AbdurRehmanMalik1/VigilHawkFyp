import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getRegisteredCamerasAPI } from "../feature/api/camera";
import { useAppDispatch, useAppSelector } from "../feature/store/reduxHooks";
import { useEffect } from "react";
import { setCameras } from "../feature/store/slices/cameraSlice";

export default function CameraConfiguration() {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cameras } = useAppSelector(state => state.camera);

  const { mutate, isPending } = useMutation({
    mutationFn: getRegisteredCamerasAPI,
    onSuccess: (data) => {
      dispatch(setCameras(data));
    }
  });

  // call API when component loads
  useEffect(() => {
    mutate();
  }, []);

  const openConfiguration = (camera_id: string) => {
    navigate(`/camera-configuration/${camera_id}`);
  };

  return (
    <div className="flex flex-1 flex-col">

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/10 dark:border-gray-800/50 px-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Camera Configuration
        </h2>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">

        <div className="max-w-6xl mx-auto">

          <section className="bg-card-dark p-6 rounded-xl border border-gray-800/50 shadow-lg">

            <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-700/50 pb-4">
              Select Camera
            </h3>

            {isPending && (
              <p className="text-gray-400">Loading cameras...</p>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {cameras.map((camera) => (
                <div
                  key={camera.id}
                  className="bg-background-dark p-5 rounded-lg border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
                >

                  <div className="space-y-2">

                    <h4 className="text-lg font-semibold text-white">
                      {camera.name}
                    </h4>

                    <p className="text-sm text-gray-400">
                      Location: {camera.location}
                    </p>

                    <p className="text-xs text-gray-500">
                      Camera ID: {camera.id}
                    </p>

                  </div>

                  <div className="mt-4 flex justify-end">

                    <button
                      onClick={() => openConfiguration(camera.id)}
                      className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
                    >
                      Configure
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </section>

        </div>

      </main>
    </div>
  );
}