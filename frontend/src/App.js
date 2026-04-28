import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Sales from './pages/Sales';
import Transactions from './pages/Transactions';
import Admin from './pages/Admin';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

export const AuthContext = React.createContext(null);

const INITIAL_USERS = [
  { id: 1, username: 'cashier1', password: 'pass123', role: 'Cashier', name: 'Juan dela Cruz', active: true },
  { id: 2, username: 'supervisor1', password: 'pass123', role: 'Supervisor', name: 'Maria Santos', active: true },
  { id: 3, username: 'admin1', password: 'pass123', role: 'Administrator', name: 'Pedro Reyes', active: true },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Rice (5kg)', barcode: '1001', price: 250, stock: 40, active: true, category: 'Staples' },
  { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85, stock: 3, active: true, category: 'Condiments' },
  { id: 3, name: 'Sugar (1kg)', barcode: '1003', price: 65, stock: 20, active: false, category: 'Staples' },
  { id: 4, name: 'Sardines (can)', barcode: '1004', price: 28, stock: 0, active: true, category: 'Canned Goods' },
  { id: 5, name: 'Instant Noodles', barcode: '1005', price: 15, stock: 80, active: true, category: 'Instant Food' },
  { id: 6, name: 'Bottled Water (500ml)', barcode: '1006', price: 20, stock: 50, active: true, category: 'Beverages' },
  { id: 7, name: 'Bread (loaf)', barcode: '1007', price: 45, stock: 12, active: true, category: 'Bakery' },
];

const INACTIVITY_MS = 15 * 60 * 1000;

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [auditLog, setAuditLog] = useState([]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [productLog, setProductLog] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [voidLog, setVoidLog] = useState([]);
  const [cancelLog, setCancelLog] = useState([]);
  const [postVoidRequests, setPostVoidRequests] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const login = (userData) => setUser(userData);
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setAuditLog(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          actor: user.username,
          action: 'Auto-logged out due to inactivity (15 min)',
          type: 'Logout',
          status: 'Auto',
        }]);
        logout();
      }, INACTIVITY_MS);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      users, setUsers,
      auditLog, setAuditLog,
      products, setProducts,
      productLog, setProductLog,
      loginAttempts, setLoginAttempts,
      transactions, setTransactions,
      lastReceipt, setLastReceipt,
      voidLog, setVoidLog,
      cancelLog, setCancelLog,
      postVoidRequests, setPostVoidRequests,
      sidebarCollapsed, setSidebarCollapsed,
    }}>
      <BrowserRouter>
        {user ? (
          <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
          }}>
            <Sidebar />
            <main style={{
              flex: 1,
              marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
              transition: 'margin-left 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
              minHeight: '100vh',
              overflow: 'auto',
              padding: '24px',
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sales" element={
                  <ProtectedRoute roles={['Cashier']}><Sales /></ProtectedRoute>
                } />
                <Route path="/transactions" element={
                  <ProtectedRoute roles={['Cashier', 'Supervisor']}><Transactions /></ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute roles={['Administrator']}><Products /></ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute roles={['Administrator']}><Users /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={['Administrator']}><Admin /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        )}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;