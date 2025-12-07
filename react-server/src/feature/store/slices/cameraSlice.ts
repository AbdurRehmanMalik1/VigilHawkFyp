// src/feature/cameraSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CameraOut } from "../../api/camera";



interface CameraState {
    cameras: CameraOut[];
}

const initialState: CameraState = {
    cameras: [],
};

const cameraSlice = createSlice({
    name: "cameras",
    initialState,
    reducers: {
        setCameras(state, action: PayloadAction<CameraOut[]>) {
            state.cameras = action.payload;
        }
    },
});

export const { setCameras: setCameras } = cameraSlice.actions;

export default cameraSlice.reducer;
