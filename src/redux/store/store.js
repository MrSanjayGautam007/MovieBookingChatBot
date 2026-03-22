
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../slice/authSlice";
import userReducer from "../slice/userProfileSlice";
import networkReducer from "../slice/networkSlice"
import moviesReducer from "../slice/moviesSlice"
// import networkGuardMiddleware from './networkGaurd';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        network: networkReducer,
        movies: moviesReducer,

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    // }).concat(networkGuardMiddleware),

});