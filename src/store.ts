// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import chatReducer from './slices/chatSlice';
import codeReducer from './slices/codeSlice';

/**
 * The root reducer that combines all the slice reducers for the application.
 * @property {Reducer} chat - The reducer for the chat state.
 * @property {Reducer} code - The reducer for the code editor state.
 */
const rootReducer = combineReducers({
  chat: chatReducer,
  code: codeReducer,
});

/**
 * The configuration object for `redux-persist`.
 * It defines how the Redux state should be persisted and rehydrated.
 * @property {string} key - The key to use for storing the state in storage.
 * @property {Storage} storage - The storage engine to use (e.g., localStorage).
 */
const persistConfig = {
  key: 'root',
  storage,
};

/**
 * A persisted version of the root reducer.
 * This wraps the root reducer with persistence capabilities, allowing the state
 * to be saved to storage and rehydrated on app launch.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * The main Redux store for the application.
 * It is configured with the persisted reducer and custom middleware to disable
 * serializable checks, which is necessary for `redux-persist`.
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Necessary because redux-persist uses non-serializable values.
    }),
});

/**
 * The persistor object, which is used to wrap the root component of the application
 * and provide it with the persisted state.
 */
export const persistor = persistStore(store);

/**
 * The type representing the root state of the Redux store.
 * It is inferred from the `store.getState` function.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * The type representing the dispatch function of the Redux store.
 * It includes the types of any thunk middleware.
 */
export type AppDispatch = typeof store.dispatch;