import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Discounts from './pages/Discounts';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';

export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null); // null = not logged in

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        {user ? (
          /* Logged in — show sidebar + page content */
          <div style={styles.appLayout}>
            <Sidebar />
            <div style={styles.content}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/discounts" element={<Discounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          /* Not logged in — show login page */
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        )}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

const styles = {
  appLayout: { display: 'flex', minHeight: '100vh', background: '#f4f6f9' },
  content: { flex: 1, padding: '32px', overflowY: 'auto' },
};

export default App;