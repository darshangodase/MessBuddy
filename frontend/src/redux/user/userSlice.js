import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isFetching: false,
    error: null,
  },
  reducers: {
    signInStart: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, clearError } = userSlice.actions;
export default userSlice.reducer;