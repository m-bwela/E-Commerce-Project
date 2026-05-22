import { createSlice, createAsyncThunk  } from "@reduxjs/toolkit";
import { getCartAPI, addToCartAPI, updateCartItemAPI, clearCartAPI } from "../api/cart";

// ---ASYNC THUNKS---
// These are functions that do something async (like calling an API) and then Update the redux state with the result (like cart items or error messages).
// Redux Toolkit handles 3 states for us: pending (when the API call is in progress), fulfilled (when it succeeds), and rejected (when it fails).

// Load the cart (called when Cart page opens)
export const fetchCart = createAsyncThunk('cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try { return (await getCartAPI()).data } // response.data = { items: [ { id, product: {id, name, price, image}, quantity } ], totalPrice }
        catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load cart') }
    }
)

// Add an item (called from Products page)
export const addToCart = createAsyncThunk('cart/addToCart',
    async ({ productId, quantity }, { rejectWithValue }) => {
    try { return (await addToCartAPI(productId, quantity)).data } // response.data = { item: { id, product: {id, name, price, image}, quantity }, totalPrice }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to add item') }
    }
)

// Change quantity of an item (called from Cart page)
export const updateCartItem = createAsyncThunk('cart/updateCartItem',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try { return (await updateCartItemAPI(itemId, quantity)).data } // response.data = { item: { id, product: {id, name, price, image}, quantity }, totalPrice }
        catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update item') }
    }
)

// Remove one item (called from Cart page) — this is just updateCartItem with quantity 0, but we can have a separate thunk for clarity
export const removeCartItem = createAsyncThunk('cart/removeCartItem',
    async (itemId, { rejectWithValue }) => {
        try { return (await updateCartItemAPI(itemId, 0)).data } // response.data = { item: null, totalPrice }
        catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to remove item') }
    }
)

// Clear the entire cart (called after successful checkout)
export const clearCart = createAsyncThunk('cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {await clearCartAPI(); return null }
        catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to clear cart') }
    }
)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: null, // { items: [ { id, product: {id, name, price, image}, quantity } ], totalPrice }
        loading: false,
        error: null,
    },
    reducers: {}, // No regular reducers needed since all updates are done via thunks
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null }
        const rejected = (state, action) => { state.loading = false; state.error = action.payload }
        const setCart = (state, action) => { state.loading = false; state.cart = action.payload }

        builder
        // fetchCart
        .addCase(fetchCart.pending,   pending)
        .addCase(fetchCart.fulfilled, setCart)
        .addCase(fetchCart.rejected,  rejected)

        // addToCart
        .addCase(addToCart.fulfilled,  setCart) // backend returns the updated cart after adding an item, so we can just replace the whole cart in Redux
        .addCase(updateCartItem.fulfilled, setCart) // same for updating an item — backend returns the updated cart
        .addCase(removeCartItem.fulfilled, setCart) // same for removing an item

        // clearCart
        .addCase(clearCart.fulfilled, (state) => {
            state.loading = false;
            state.cart = null // After clearing, the cart is empty, so we set it back to null (same as initial state)
        })

    }
})

export default cartSlice.reducer;

// Use this in Navbar to show the item count badge on the cart icon
// Adds up all the item quantities : 2 Nike shoes + 1 T-Shirt = 3 
export const selectCartItemCount = (state) => 
    state.cart.cart?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0
