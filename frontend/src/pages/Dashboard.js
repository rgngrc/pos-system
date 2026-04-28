import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, sub, color, icon, delay }) {
  return (
    <div className={`stat-card ${color} animate-fadeInUp delay-${delay}`} style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40,
          background: `var(--accent-${color}-dim)`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: `var(--accent-${color})`,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{
            width: '100%',
            height: `${(d.value / max) * 40}px`,
            background: color,
            borderRadius: '3px 3px 0 0',
            opacity: i === data.length - 1 ? 1 : 0.4,
            transition: 'height 0.3s',
            minHeight: 3,
          }} />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  // FIXED: Idinagdag ang postVoidRequests dito para makuha sa AuthContext
  const { user, transactions, products, users, voidLog, cancelLog, auditLog, postVoidRequests } = useContext(AuthContext);
  const navigate = useNavigate();

  const today = useMemo(() => new Date().toDateString(), []);

  const todayTx = useMemo(() =>
    transactions.filter(t => new Date(t.timestamp).toDateString() === today),
    [transactions, today]
  );

  const todayRevenue = useMemo(() =>
    todayTx.reduce((sum, t) => sum + (t.total || 0), 0),
    [todayTx]
  );

  const totalRevenue = useMemo(() =>
    transactions.reduce((sum, t) => sum + (t.total || 0), 0),
    [transactions]
  );

  const lowStock = useMemo(() => products.filter(p => p.active && p.stock > 0 && p.stock <= 5), [products]);
  const outOfStock = useMemo(() => products.filter(p => p.active && p.stock === 0), [products]);
  const activeProducts = useMemo(() => products.filter(p => p.active), [products]);

  // Last 7 days activity (mock if empty)
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const dayTx = transactions.filter(t => new Date(t.timestamp).toDateString() === dayStr);
      const revenue = dayTx.reduce((s, t) => s + (t.total || 0), 0);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: revenue,
        count: dayTx.length,
      });
    }
    // Seed with demo data if empty
    if (days.every(d => d.value === 0)) {
      const demo = [2400, 1800, 3200, 2900, 3800, 2100, todayRevenue || 1200];
      return days.map((d, i) => ({ ...d, value: demo[i] }));
    }
    return days;
  }, [transactions, todayRevenue]);

  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5),
    [transactions]
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fmt = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const roleActions = {
    Cashier: [
      { label: 'New Sale', icon: '🛒', path: '/sales', color: 'green' },
      { label: 'View Transactions', icon: '📋', path: '/transactions', color: 'blue' },
    ],
    Supervisor: [
      { label: 'View Transactions', icon: '📋', path: '/transactions', color: 'blue' },
      { label: 'Monitor Sales', icon: '📊', path: '/', color: 'amber' },
    ],
    Administrator: [
      { label: 'Manage Products', icon: '📦', path: '/products', color: 'purple' },
      { label: 'Manage Users', icon: '👥', path: '/users', color: 'blue' },
      { label: 'Admin Panel', icon: '⚙️', path: '/admin', color: 'pink' },
    ],
  };

  const actions = roleActions[user?.role] || [];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="animate-fadeInUp" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              &nbsp;·&nbsp; Here's what's happening today
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {actions.map(a => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="btn-pos-secondary"
                style={{ fontSize: 12 }}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Today's Revenue" color="green" delay="1"
          value={fmt(todayRevenue)}
          sub={`${todayTx.length} transactions`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          label="Total Revenue" color="blue" delay="2"
          value={fmt(totalRevenue)}
          sub={`${transactions.length} all-time`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
        <StatCard
          label="Active Products" color="amber" delay="3"
          value={activeProducts.length}
          sub={`${outOfStock.length} out of stock`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>}
        />
        <StatCard
          label="Staff Members" color="pink" delay="4"
          value={users.filter(u => u.active).length}
          sub={`${users.length} total users`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div className="pos-card animate-fadeInUp delay-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Revenue Overview</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 7 days performance</p>
            </div>
            <span className="pos-badge badge-green">This Week</span>
          </div>
          {/* Chart */}
          <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 4px' }}>
            {weekData.map((d, i) => {
              const max = Math.max(...weekData.map(x => x.value), 1);
              const h = Math.max((d.value / max) * 120, 4);
              const isToday = i === weekData.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {d.value > 0 ? `₱${(d.value/1000).toFixed(1)}k` : '—'}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${h}px`,
                      background: isToday
                        ? 'linear-gradient(180deg, var(--accent-green), #00b37a)'
                        : 'var(--bg-elevated)',
                      borderRadius: '6px 6px 0 0',
                      border: isToday ? 'none' : '1px solid var(--border)',
                      transition: 'height 0.5s ease',
                      boxShadow: isToday ? '0 0 16px var(--accent-green-glow)' : 'none',
                      position: 'relative',
                    }}
                  />
                  <div style={{ fontSize: 10, color: isToday ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: isToday ? 600 : 400 }}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts & info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Low stock alerts */}
          <div className="pos-card animate-fadeInUp delay-3" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Stock Alerts</h3>
              <span className="pos-badge badge-amber">{lowStock.length + outOfStock.length}</span>
            </div>
            {outOfStock.length === 0 && lowStock.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                ✅ All products have sufficient stock
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {outOfStock.slice(0, 3).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,77,143,0.08)', borderRadius: 8, border: '1px solid rgba(255,77,143,0.15)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</div>
                    <span className="pos-badge badge-pink">Out</span>
                  </div>
                ))}
                {lowStock.slice(0, 3).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--accent-amber-dim)', borderRadius: 8, border: '1px solid rgba(255,184,77,0.15)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</div>
                    <span className="pos-badge badge-amber">{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="pos-card animate-fadeInUp delay-4">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Voided Items', value: voidLog.length, color: 'var(--accent-pink)' },
                { label: 'Canceled Sales', value: cancelLog.length, color: 'var(--accent-amber)' },
                { label: 'Pending Void Req.', value: postVoidRequests?.filter(r => r.status === 'Pending')?.length || 0, color: 'var(--accent-blue)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color, fontSize: 15 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="pos-card animate-fadeInUp delay-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Transactions</h3>
          {(user?.role === 'Cashier' || user?.role === 'Supervisor') && (
            <button className="btn-pos-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/transactions')}>
              View All
            </button>
          )}
        </div>
        {recentTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
            No transactions yet. {user?.role === 'Cashier' && <span>Start a <button onClick={() => navigate('/sales')} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', fontSize: 13 }}>new sale</button>!</span>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Cashier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map(tx => (
                  <tr key={tx.id}>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--accent-green)' }}>#{tx.id}</span></td>
                    <td style={{ color: 'var(--text-primary)' }}>{tx.cashierName || tx.cashier || '—'}</td>
                    <td>{tx.items?.length || 0} items</td>
                    <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(tx.total || 0)}</span></td>
                    <td><span className="pos-badge badge-blue">{tx.paymentMethod || 'Cash'}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(tx.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span className="pos-badge badge-green">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}