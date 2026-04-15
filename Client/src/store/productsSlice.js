// THis slice manages product data - the product listing and individual product details.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProductsAPI, getProductAPI } from "../api/products";

// Fetch all products (with optional filters like category, search, page)
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getProductsAPI(params); 
            // response.data = { products: [...], total: 50, pages: 5 }
            return response.data; // This will be the "fulfilled" payload
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
        }
    }
);

// Fetch details of a single product by ID
export const fetchProductById = createAsyncThunk(
    "products/fetchProductById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await getProductAPI(id);
            // response.data = { product: { id, name, description, price, ... } }
            return response.data; // This will be the "fulfilled" payload
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch product details"
            );
        }
    }
);

const productsSlice = createSlice({
    name: "products",

    initialState: {
        products: [], // List of products for the product listing page
        product: null, // Details of a single product for the product details page
        loading: false, // Whether we're currently loading data
        error: null,
        totalPages: 0, // Total number of pages for pagination
    },

    reducers: {
        clearProduct: (state) => {
            state.product = null; // Clear the product details when navigating away
        },
    },

    extraReducers: (builder) => {
        builder
            // ---FETCH PRODUCTS---
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true; // Show loading spinner
                state.error = null; // Clear previous errors
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false; // Done loading
                state.products = action.payload.products; // Save products list to state
                state.totalPages = action.payload.pages; // Save total pages for pagination
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false; // Done loading
                state.error = action.payload; // Show error message
            })

            // ---FETCH PRODUCT BY ID---
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload; // Save product details to state
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProduct } = productsSlice.actions; // Export the regular action creators (like clearProduct)
export default productsSlice.reducer; // Export the reducer to be included in the store