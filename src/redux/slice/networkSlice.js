import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isConnected: null,
    isInternetReachable: null,
    connectionType: 'unknown',
};

const networkSlice = createSlice({
    name: 'network',
    initialState,
    reducers: {
        connectionChange: (state, action) => {
            state.isConnected = action.payload.isConnected;
            state.isInternetReachable = action.payload.isInternetReachable;
            state.connectionType = action.payload.type;
        },
    },
});

export const { connectionChange } = networkSlice.actions;
export default networkSlice.reducer;