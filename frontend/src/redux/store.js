// redux/store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from './slices/authSlice.js';
import themeSlice from './slices/themeSlice.js';
import classSlice from './slices/classSlice.js';
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// 1️⃣ Persist config
const persistConfig = {
    key: 'root',       // root key
    version: 1,
    storage,            // localStorage
    whitelist: ['auth', 'theme','classes'] // only persist auth and theme slices
};

// 2️⃣ Combine reducers
const rootReducer = combineReducers({
    auth: authSlice,
    theme: themeSlice,
    classes: classSlice
});

// 3️⃣ Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Configure store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // ignore redux-persist actions for serializable check
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// 5️⃣ Persistor
const persistor = persistStore(store);

// ✅ Named exports
export { store, persistor };
export default store;
