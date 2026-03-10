import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CameraOut } from "../../api/camera";

interface CameraState {
    cameras: CameraOut[];
    generatedCameras: CameraOut[];
    stoppedGeneratedCameras: string[];  // store camera IDs that are stopped
}

const initialState: CameraState = {
    cameras: [],
    generatedCameras: [],
    stoppedGeneratedCameras: [],
};

const cameraSlice = createSlice({
    name: "cameras",
    initialState,
    reducers: {
        setCameras(state, action: PayloadAction<CameraOut[]>) {
            state.cameras = action.payload;
        },
        setGeneratedCameras(state, action: PayloadAction<CameraOut[]>) {
            state.generatedCameras = action.payload;
        },
        addStoppedGeneratedCamera(state, action: PayloadAction<string>) {
            if (!state.stoppedGeneratedCameras.includes(action.payload)) {
                state.stoppedGeneratedCameras.push(action.payload);
            }
        },
        removeStoppedGeneratedCamera(state, action: PayloadAction<string>) {
            state.stoppedGeneratedCameras = state.stoppedGeneratedCameras.filter(
                (id) => id !== action.payload
            );
        },
        clearStoppedGeneratedCameras(state) {
            state.stoppedGeneratedCameras = [];
        },
        updateCameraStatus(
            state,
            action: PayloadAction<{ cameraId: string; status: string | "Online" | "Offline" }>
        ) {
            const { cameraId, status } = action.payload;
            const cam = state.cameras.find(c => c.id === cameraId);
            if (cam) cam.status = status;
        }
    },
});

export const {
    setCameras,
    setGeneratedCameras,
    addStoppedGeneratedCamera,
    removeStoppedGeneratedCamera,
    clearStoppedGeneratedCameras,
    updateCameraStatus,
} = cameraSlice.actions;

export default cameraSlice.reducer;
