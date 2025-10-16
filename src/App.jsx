import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import RafflesPage from './pages/RafflesPage.jsx'
import PurchasesPage from './pages/PurchasesPage.jsx'
import RaffleDetailsPage from './pages/RaffleDetailsPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import DrawnRafflesPage from './pages/DrawnRafflesPage.jsx'
import AdminRafflesPage from './pages/AdminRafflesPage.jsx'
import SorteioPage from './pages/SorteioPage.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import NotificationContainer from './components/NotificationContainer.jsx'
import { NotificationProvider, useNotificationContext } from './contexts/NotificationContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function AppContent() {
  const { notifications, removeNotification } = useNotificationContext()

  return (
    <div className="app-container">
      <Navbar />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/criar-conta" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/rifas" replace />} />
          <Route path="/rifas" element={<RafflesPage />} />
          <Route path="/rifas/:id" element={<RaffleDetailsPage />} />
          <Route path="/rifas/:id/sorteio" element={<SorteioPage />} />
          <Route path="/rifas-sorteadas" element={<DrawnRafflesPage />} />
          <Route element={<ProtectedRoute />}> 
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/minhas-compras" element={<PurchasesPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin/rifas" element={<AdminRafflesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/rifas" replace />} />
        </Routes>
      </ErrorBoundary>
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  )
}

export default App
