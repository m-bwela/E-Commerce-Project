import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {  getStatsAPI, getUsersAPI, updateUserRoleAPI, updateOrderStatusAPI, getAdminOrdersAPI, getAdminProductsAPI, } from '../api/admin';
import { createProductAPI, updateProductAPI, deleteProductAPI } from '../api/admin';

// Fetch dashboard stats
export const fetchAdminStats = createAsyncThunk('admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try { return (await getStatsAPI()).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load stats'); }
  }
);

// Fetch all users
export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try { return (await getUsersAPI()).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load users'); }
  }
);

// Fetch all orders (admin view)
export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders',
  async (_, { rejectWithValue }) => {
    try { return (await getAdminOrdersAPI()).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load orders'); }
  }
);

// Fetch all products (for admin product table)
export const fetchAdminProducts = createAsyncThunk('admin/fetchProducts',
  async (_, { rejectWithValue }) => {
    try { return (await getAdminProductsAPI()).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load products'); }
  }
);

// Change a user's role
export const changeUserRole = createAsyncThunk('admin/changeUserRole',
  async ({ id, role }, { rejectWithValue }) => {
    try { return (await updateUserRoleAPI(id, role)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update role'); }
  }
);

// Change an order's status
export const changeOrderStatus = createAsyncThunk('admin/changeOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return (await updateOrderStatusAPI(id, status)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update status'); }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    orders: [],
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchAdminStats.pending, pending)
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, rejected)

      .addCase(fetchAdminUsers.pending, pending)
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, rejected)

      .addCase(fetchAdminOrders.pending, pending)
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, rejected)

      .addCase(fetchAdminProducts.pending, pending)
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        // fetchAdminProducts returns { products, total, pages }
        state.products = action.payload.products || action.payload;
      })
      .addCase(fetchAdminProducts.rejected, rejected)

      // When a user's role is updated, update that one user in the array
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], role: action.payload.role };
      })

      // When an order's status is updated, update that one order in the array
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = { ...state.orders[idx], status: action.payload.status };
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;