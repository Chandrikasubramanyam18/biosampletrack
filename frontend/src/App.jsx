import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import { Toast } from './components/Toast/Toast'
import { ToastProvider } from './components/Toast/Toast'
import Dashboard from './pages/Dashboard'
import Samples from './pages/Samples'
import Workflow from './pages/Workflow'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-shell">
          <Sidebar />
          <div className="main-area">
            <Navbar />
            <main className="page-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/samples" element={<Samples />} />
                <Route path="/workflow" element={<Workflow />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
          <Toast />
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
