// src/redux/slices/classSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  classes: [],         // list of all classes
  selectedClass: null, // for viewing/updating a single class
  loading: false,
  error: null,
};

const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    setClasses: (state, action) => {
      state.classes = action.payload;
    },
    addClass: (state, action) => {
      state.classes.push(action.payload);
    },
    updateClass: (state, action) => {
      const index = state.classes.findIndex(c => c._id === action.payload._id);
      if (index !== -1) state.classes[index] = action.payload;
    },
    deleteClass: (state, action) => {
      state.classes = state.classes.filter(c => c._id !== action.payload);
    },
    setSelectedClass: (state, action) => {
      state.selectedClass = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setClasses, addClass, updateClass, deleteClass, setSelectedClass, setLoading, setError } = classSlice.actions;
export default classSlice.reducer;
