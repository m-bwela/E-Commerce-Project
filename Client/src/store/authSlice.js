// A "Slice" is a piece of the Redux store that contains the state and reducers for a specific feature or domain. In this case, we are creating an "authSlice" for managing authentication-related state.
// This slice manages: who is logged in, loading states, and errors related to authentication.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, logoutAPI, getMeAPI } from "../api/auth";

// ---ASYNC THUNKS---
// These are functions that do something async (like calling an API) and then
// Update the redux state with the result (like user info or error messages).
// Redux Toolkit handles 3 states for us: pending (when the API call is in progress), fulfilled (when it succeeds), and rejected (when it fails).

// Register a new user
export const registerUser = createAsyncThunk( // This is the name of the action that will be dispatched when we call this thunk
    "auth/registerUser",        // Action type string (used in reducers to identify this action)
    async (data, { rejectWithValue }) => {
        try {
            const response = await registerAPI(data); // Call the API to register the user
            // response.data = { user: {...}, token: "..." }
            return response.data; // This will be the "fulfilled" payload
        } catch (error) {
            // If the backend returns an error  (like "User already exists"), 
            // We pass it to Redux so we can show it to the user.
            return rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
);

// Log in an existing user
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (data, { rejectWithValue }) => {
        try {
            const response = await loginAPI(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

// Logout the current user
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
     async () => {
        await logoutAPI(); // Call the API to log out (clear session on server)
     }
);

// Check if user is already logged in (on page refresh)
// The browser sends the cookie authomatically - if valid, backend returns the user info.
export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getMeAPI(); // Call the API to get current user info
            // response.data = { user: {id, fullName, email, role } }
            return response.data; // This will be the "fulfilled" payload
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Not logged in"
            );
        }
    }
);

// ---SLICE---
const authSlice = createSlice({
    name: 'auth', // Name of the slice (used in action types)

    // Initial state  - what the data looks like when the app first loads
    initialState: {
        user: null, // null means no user is logged in, { id, fullName, email, role } = logged in
        loading: false, // true while waiting for API response
        error: null, // null = no error, "string" = error message
    },

    // Regular reducers - for simple, non-async actions
    reducers: {
        clearError: (state) => {
            state.error = null; // Clear any existing error messages
        },
    },

    // Extra reducers - handle the 3 states of each async thunk
    // pending = request sent, waiting...
    // fulfilled = success! got data back
    // rejected = something went wrong (like wrong password)
    extraReducers: (builder) => {
        builder
            // ---REGISTER---
            .addCase(registerUser.pending, (state) => {
                state.loading = true; // Show loading spinner
                state.error = null; // Clear previous errors
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false; // Done loading
                state.user = action.payload.user; // Save user info to state
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false; // Done loading
                state.error = action.payload; // Show error message
            })

            // ---LOGIN---
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---LOGOUT---
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null; // Clear user info on logout
            })

            // ---FETCH CURRENT USER---
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user; // Set user info if logged in
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.user = null; // No user info if not logged in or cookie expired/invalid
            });
    },
});

export const { clearError } = authSlice.actions; // Export the regular action creators (like clearError)
export default authSlice.reducer; // Export the reducer to be included in the store