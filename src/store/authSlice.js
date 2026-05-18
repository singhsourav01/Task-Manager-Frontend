import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import mockAuthService from "../services/mockAuthService";

export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  const result = await mockAuthService.login(email, password);
  if (!result.success) {
    return rejectWithValue(result.message);
  }
  return result.data;
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await mockAuthService.logout();
});

export const checkSession = createAsyncThunk("auth/checkSession", async (_, { rejectWithValue }) => {
  const result = await mockAuthService.getCurrentUser();
  if (!result.success) {
    return rejectWithValue(result.message);
  }
  return result.data;
});

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
