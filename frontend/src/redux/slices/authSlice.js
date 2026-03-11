import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,       // admin/teacher/student info
  token: null,      // JWT token
  role: null,       // "admin" | "teacher" | "student"
  isLoggedIn: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isLoggedIn = false;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  }
});

export const { loginSuccess, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
