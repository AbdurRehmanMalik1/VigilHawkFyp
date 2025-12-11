import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DashboardSettingsState {
  soundsEnabled: boolean;
  // You can add other dashboard settings here later
}

const initialState: DashboardSettingsState = {
  soundsEnabled: true, // default to on
};

const dashboardSettingsSlice = createSlice({
  name: "dashboardSettings",
  initialState,
  reducers: {
    setSoundsEnabled(state, action: PayloadAction<boolean>) {
      state.soundsEnabled = action.payload;
    },
    toggleSounds(state) {
      state.soundsEnabled = !state.soundsEnabled;
    },
  },
});

export const { setSoundsEnabled, toggleSounds } = dashboardSettingsSlice.actions;
export default dashboardSettingsSlice.reducer;
