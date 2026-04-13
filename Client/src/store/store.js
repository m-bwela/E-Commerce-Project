// The Redux store is like a "global storage box" for your app.
// Any component can read from it or put data into it, without needing to pass props down through many layers.
// Without it, you'd have to pass data through props from parent to child to grandchild, which can get messy (this is called "prop drilling").
// In this file, we set up the Redux store and combine all our reducers (which manage different parts of the state).

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productsReducer from "./productsSlice";

const store = configureStore({
    reducer: {
        auth: authReducer, // Manages authentication state (user info, login status)
        products: productsReducer, // Manages products state (list of products, loading status, errors)
    },
});

export default store;