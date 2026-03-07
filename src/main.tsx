import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './Redux/store' 
import App from './App.tsx'
import './index.css'

// וודאי שאין כאן שום קריאה ל-useState או Hook אחר!

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)