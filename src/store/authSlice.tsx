import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authState,userInfo } from '.';

const initialState: authState = {
    isLoggedIn: false,
    user: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<userInfo>) => {
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.isLoggedIn = false;
            state.user = null;
        }
    }
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;