import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import {store , persistor} from './store';
import App from './App.tsx'
import './index.css'
import './styles/globals.css'

/**
 * The entry point of the application.
 * It renders the root `App` component into the DOM, wrapped with the Redux `Provider`
 * to make the store available to all components, and the `PersistGate` to handle
 * state rehydration from localStorage.
 */
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
)