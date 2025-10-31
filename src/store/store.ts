import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const storedUser = (() => {
    try {
        const raw = sessionStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
})();

export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    preloadedState: storedUser
        ? { auth: { isLoggedIn: true, user: storedUser } }
        : undefined
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;