import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Sales from './pages/Sales';
import Discounts from './pages/Discounts';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

export const AuthContext = React.createContext(null);

// ── Unchanged initial data ──────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: 1, username: 'cashier1',    password: 'pass123', role: 'Cashier',       name: 'Juan dela Cruz', active: true },
  { id: 2, username: 'supervisor1', password: 'pass123', role: 'Supervisor',    name: 'Maria Santos',   active: true },
  { id: 3, username: 'admin1',      password: 'pass123', role: 'Administrator', name: 'Pedro Reyes',    active: true },
];

// ── Lifted from Products.js so Sales.js can read it too (US1 fix) ───────────
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Rice (5kg)',       barcode: '1001', price: 250, stock: 40, active: true  },
  { id: 2, name: 'Cooking Oil (1L)', barcode: '1002', price: 85,  stock: 0,  active: true  },
  { id: 3, name: 'Sugar (1kg)',      barcode: '1003', price: 65,  stock: 20, active: false },
];

// ── US4: Auto-logout after 15 minutes of inactivity ─────────────────────────
const INACTIVITY_MS = 15 * 60 * 1000;

function App() {
  // ── Unchanged state ────────────────────────────────────────────────────────
  const [user, setUser]       = useState(null);
  const [users, setUsers]     = useState(INITIAL_USERS);
  const [auditLog, setAuditLog] = useState([]);

  // ── New shared state ───────────────────────────────────────────────────────
  const [products, setProducts]       = useState(INITIAL_PRODUCTS);   // US1 — shared catalog
  const [productLog, setProductLog]   = useState([]);                  // US1 — change log
  const [loginAttempts, setLoginAttempts] = useState({});              // US4 — lockout map
  // loginAttempts shape: { [username]: { count: number, lockedUntil: string|null } }

  // ── Unchanged auth functions ───────────────────────────────────────────────
  const login  = (userData) => setUser(userData);
  const logout = useCallback(() => setUser(null), []);

  // ── US4: Inactivity auto-logout ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return; // only when logged in

    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Add an audit entry before logging out
        setAuditLog(prev => [
          ...prev,
          {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            actor: user.username,
            action: 'Auto-logged out due to inactivity (15 min)',
          },
        ]);
        logout();
      }, INACTIVITY_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // start immediately

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{
      // ── Unchanged ──────────────────────────────────────────────────────────
      user, login, logout,
      users, setUsers,
      auditLog, setAuditLog,
      // ── New ────────────────────────────────────────────────────────────────
      products, setProducts,        // US1: shared between Products.js + Sales.js
      productLog, setProductLog,    // US1: product change log
      loginAttempts, setLoginAttempts, // US4: lockout tracking
    }}>
      <BrowserRouter>
        {user ? (
          <div className="d-flex min-vh-100 bg-light">
            <Sidebar />
            <div className="flex-grow-1 p-4">
              <Routes>
                {/* Dashboard — all roles */}
                <Route path="/" element={<Dashboard />} />

                {/* Cashier-only routes */}
                <Route path="/sales" element={
                  <ProtectedRoute roles={['Cashier']}>
                    <Sales />
                  </ProtectedRoute>
                } />
                <Route path="/discounts" element={
                  <ProtectedRoute roles={['Cashier']}>
                    <Discounts />
                  </ProtectedRoute>
                } />

                {/* Cashier + Supervisor */}
                <Route path="/transactions" element={
                  <ProtectedRoute roles={['Cashier', 'Supervisor']}>
                    <Transactions />
                  </ProtectedRoute>
                } />

                {/* Admin-only routes */}
                <Route path="/products" element={
                  <ProtectedRoute roles={['Administrator']}>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute roles={['Administrator']}>
                    <Users />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
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