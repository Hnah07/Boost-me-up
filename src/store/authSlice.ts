import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store.ts";
import { resetEntries } from "./entriesSlice";

interface AuthResponse {
  message: string;
  token?: string | null;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface UserProfile {
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  stats: {
    totalEntries: number;
  };
}

const API_BASE_URL = "https://boost-me-up-backend.onrender.com/api";

// Load initial state from localStorage
const loadInitialState = () => {
  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("authState");
    if (savedState) {
      return JSON.parse(savedState);
    }
  }
  return {
    isLoggedIn: false,
    username: null,
    email: null,
    loading: false,
    error: null,
    token: null,
    stats: {
      totalEntries: 0,
    },
  };
};

const initialState: AuthState = loadInitialState();

// Save state to localStorage whenever it changes
const saveStateToLocalStorage = (state: AuthState) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authState", JSON.stringify(state));
  }
};

export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    console.log("Attempting login with:", { email });
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    console.log("Login response status:", response.status);
    const responseData = await response.json();
    console.log("Full response data:", responseData);

    if (!response.ok) {
      console.error("Login error details:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      return rejectWithValue(responseData.message || "Login failed");
    }

    // Get the token from the response data
    const token = responseData.token;
    console.log("Token from response:", token);

    if (!token) {
      console.error("No token found in response");
      return rejectWithValue("No token received from server");
    }

    return {
      message: responseData.message,
      user: responseData.user,
      token,
    };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unexpected error occurred");
  }
});

export const fetchUserProfile = createAsyncThunk<UserProfile, void>(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Failed to fetch profile");
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const register = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string }
>(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      console.log("Attempting registration with:", { username, email });
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      console.log("Register response status:", response.status);
      const responseData = await response.json();
      console.log("Full response data:", responseData);

      if (!response.ok) {
        console.error("Register error details:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });

        // Check for specific error messages from the backend
        if (responseData.message?.includes("email")) {
          return rejectWithValue("Dit emailadres is al in gebruik");
        } else if (responseData.message?.includes("username")) {
          return rejectWithValue("Deze gebruikersnaam is al in gebruik");
        }
        return rejectWithValue(responseData.message || "Registratie mislukt");
      }

      return responseData;
    } catch (error) {
      console.error("Register error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Er is een onverwachte fout opgetreden");
    }
  }
);

export const logout = createAsyncThunk<void, void, { state: RootState }>(
  "auth/logout",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Logout failed");
      }

      // Reset entries state after successful logout
      dispatch(resetEntries());
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "auth/fetchUserStats",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await fetch(`${API_BASE_URL}/auth/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      return { totalEntries: data.totalEntries };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.email = action.payload.user?.email || null;
        state.username = action.payload.user?.username || null;
        state.error = null;
        state.token = action.payload.token || null;
        console.log("Stored token in state:", state.token);
        console.log("Stored user in state:", {
          email: state.email,
          username: state.username,
        });
        saveStateToLocalStorage(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        saveStateToLocalStorage(state);
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state: AuthState, action: PayloadAction<UserProfile>) => {
          state.loading = false;
          if (action.payload.user) {
            state.username = action.payload.user.username;
            state.email = action.payload.user.email;
          }
        }
      )
      .addCase(fetchUserProfile.rejected, (state: AuthState, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
        saveStateToLocalStorage(state);
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.email = action.payload.user?.email || null;
        state.username = action.payload.user?.username || null;
        state.error = null;
        state.token = action.payload.token || null;
        saveStateToLocalStorage(state);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        saveStateToLocalStorage(state);
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.email = null;
        state.username = null;
        state.error = null;
        state.token = null;
        saveStateToLocalStorage(state);
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        saveStateToLocalStorage(state);
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (_, action) => {
        console.error("Failed to fetch stats:", action.payload);
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
