import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type SafeUser } from '../../api/user';

interface UserState {
  id: string | null;
  username: string;
  email: string;
}

const initialState: UserState = {
  id: null,
  username: '',
  email: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SafeUser>) {
      state.id = action.payload.id ?? null;
      state.username = action.payload.username;
      state.email = action.payload.email;
    },
    clearUser(state) {
      state.id = null;
      state.username = '';
      state.email = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
