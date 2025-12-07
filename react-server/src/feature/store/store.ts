import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/authSlice';
import cameraReducer from './slices/cameraSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
     camera: cameraReducer
    // add other reducers here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;