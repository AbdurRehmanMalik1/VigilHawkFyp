import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type SafeUser, type UserSettings } from '../../api/user';

interface UserState {
  id: string | null;
  username: string;
  email: string;
  isLoggedIn: boolean;
  userSettings: UserSettings | undefined;
}

const initialState: UserState = {
  id: null,
  username: '',
  email: '',
  isLoggedIn: false,
  userSettings: undefined,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SafeUser>) {
      state.id = action.payload.id ?? null;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.isLoggedIn = true;
      state.userSettings = action.payload.settings;
    },
    clearUser(state) {
      state.id = null;
      state.username = '';
      state.email = '';
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
