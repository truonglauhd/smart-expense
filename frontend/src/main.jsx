// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ExpenseProvider } from './context/ExpenseContext.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ExpenseProvider>
      <ToastContainer
      position='top-center'
      autoClose={1000}
      draggable={true}
      />
      <App />
    </ExpenseProvider>
  // </StrictMode>,
)
