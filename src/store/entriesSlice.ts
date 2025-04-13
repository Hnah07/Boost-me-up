import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Entry {
  _id: string;
  content: string;
  user: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface EntriesState {
  entries: Entry[];
  loading: boolean;
  error: string | null;
}

const initialState: EntriesState = {
  entries: [],
  loading: false,
  error: null,
};

const API_BASE_URL = "https://api.boostmeup.hannahc.be/api";

export const fetchEntries = createAsyncThunk<Entry[], void>(
  "entries/fetchEntries",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching entries...");
      const response = await fetch(`${API_BASE_URL}/entries`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Entries response status:", response.status);
      if (!response.ok) {
        const error = await response.json();
        console.error("Entries error:", error);
        return rejectWithValue(error.message || "Failed to fetch entries");
      }

      const data = await response.json();
      console.log("Entries data:", data);
      return data;
    } catch (error) {
      console.error("Entries fetch error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const addEntry = createAsyncThunk<Entry, string>(
  "entries/addEntry",
  async (content, { rejectWithValue }) => {
    try {
      console.log("Adding entry with content:", content);
      console.log("API URL:", `${API_BASE_URL}/entries`);
      console.log("Cookies:", document.cookie);

      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      console.log("Add entry response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Add entry error:", errorData);
        return rejectWithValue(errorData.message || "Failed to add entry");
      }

      const data = await response.json();
      console.log("Add entry response data:", data);
      return data;
    } catch (error) {
      console.error("Add entry error:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const updateEntry = createAsyncThunk<
  Entry,
  { id: string; text: string }
>("entries/updateEntry", async ({ id, text }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ content: text }),
    });

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || "Failed to update entry");
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unexpected error occurred");
  }
});

export const deleteEntry = createAsyncThunk<string, string>(
  "entries/deleteEntry",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || "Failed to delete entry");
      }

      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const entriesSlice = createSlice({
  name: "entries",
  initialState,
  reducers: {
    resetEntries: (state) => {
      state.entries = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state: EntriesState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchEntries.fulfilled,
        (state: EntriesState, action: PayloadAction<Entry[]>) => {
          state.loading = false;
          state.entries = action.payload;
        }
      )
      .addCase(fetchEntries.rejected, (state: EntriesState, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch entries";
      })
      .addCase(
        addEntry.fulfilled,
        (state: EntriesState, action: PayloadAction<Entry>) => {
          state.loading = false;
          state.entries = [action.payload, ...state.entries];
        }
      )
      .addCase(addEntry.rejected, (state: EntriesState, action) => {
        state.error = (action.payload as string) || "Failed to add entry";
      })
      .addCase(
        updateEntry.fulfilled,
        (state: EntriesState, action: PayloadAction<Entry>) => {
          const index = state.entries.findIndex(
            (entry) => entry._id === action.payload._id
          );
          if (index !== -1) {
            state.entries[index] = action.payload;
          }
        }
      )
      .addCase(updateEntry.rejected, (state: EntriesState, action) => {
        state.error = (action.payload as string) || "Failed to update entry";
      })
      .addCase(
        deleteEntry.fulfilled,
        (state: EntriesState, action: PayloadAction<string>) => {
          state.entries = state.entries.filter(
            (entry) => entry._id !== action.payload
          );
        }
      )
      .addCase(deleteEntry.rejected, (state: EntriesState, action) => {
        state.error = (action.payload as string) || "Failed to delete entry";
      });
  },
});

export const { resetEntries } = entriesSlice.actions;
export default entriesSlice.reducer;
