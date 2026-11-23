
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch employees from backend API
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "/api/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch employees");
      }

      return Array.isArray(data) ? data : data.employees || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",

  initialState: {
    employees: [],
    loading: false,
    error: null
  },

  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })

      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  }
});

export const { setEmployees } = employeeSlice.actions;

export default employeeSlice.reducer;
