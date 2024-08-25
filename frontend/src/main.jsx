import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {store,persistor} from './redux/store'
import { Provider } from'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
  <Provider store={store}>
    <App />
  </Provider>
  </PersistGate>
)
