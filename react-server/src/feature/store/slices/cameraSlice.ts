// src/feature/cameraSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CameraOut } from "../../api/camera";



interface CameraState {
    cameras: CameraOut[];
    generatedCameras: CameraOut[];
}

const initialState: CameraState = {
    cameras: [],
    generatedCameras: []
};

const cameraSlice = createSlice({
    name: "cameras",
    initialState,
    reducers: {
        setCameras(state, action: PayloadAction<CameraOut[]>) {
            state.cameras = action.payload;
        },
        setGeneratedCameras(state, action: PayloadAction<CameraOut[]>){
            state.generatedCameras = action.payload;
        }
    },
});

export const { setCameras: setCameras, setGeneratedCameras } = cameraSlice.actions;

export default cameraSlice.reducer;
