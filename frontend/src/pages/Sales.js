import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { AuthContext } from '../App';
import ReceiptDisplay from '../components/ReceiptDisplay';
import api from '../services/api'; // Fixed path

let receiptCounter = 1000;
const genReceiptId = () => `${++receiptCounter}`;

export default function Sales() {
  const { 
    user, 
    products, 
    setProducts, 
    // transactions, 
    setTransactions, 
    setLastReceipt, 
    // voidLog, 
    setVoidLog, 
    // cancelLog, 
    setCancelLog, 
    setAuditLog 
  } = useContext(AuthContext);

  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTx, setLastTx] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [voidItemId, setVoidItemId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const barcodeRef = useRef();

  useEffect(() => {
    if (barcodeRef.current) barcodeRef.current.focus();
  }, []);

  const activeProducts = products.filter(p => p.active && p.stock > 0);
  const categories = ['All', ...new Set(products.filter(p => p.active).map(p => p.category || 'General'))];

  const filteredProducts = activeProducts.filter(p => {
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    const matchCat = activeCategory === 'All' || (p.category || 'General') === activeCategory;
    return matchSearch && matchCat;
  });

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const change = paymentMethod === 'Cash' ? (parseFloat(cashReceived) || 0) - total : 0;

  const addToCart = useCallback((product) => {
    setError('');
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const prod = products.find(p => p.id === product.id);
        if (existing.qty >= prod.stock) {
          setError(`Not enough stock for ${product.name}`);
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, [products]);

  const handleBarcode = (e) => {
    if (e.key === 'Enter') {
      const prod = products.find(p => p.barcode === barcode && p.active && p.stock > 0);
      if (prod) {
        addToCart(prod);
        setBarcode('');
      } else {
        setError(`Product not found: ${barcode}`);
        setBarcode('');
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const prod = products.find(p => p.id === id);
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.id !== id);
      if (newQty > prod.stock) { setError(`Only ${prod.stock} available`); return prev; }
      return prev.map(i => i.id === id ? { ...i, qty: newQty } : i);
    });
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const voidItem = (cartItem) => {
    setVoidLog(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      cashier: user.username,
      cashierName: user.name,
      productId: cartItem.id,
      productName: cartItem.name,
      qty: cartItem.qty,
      price: cartItem.price,
      reason: 'Cashier void before sale',
    }]);
    setAuditLog(prev => [...prev, {
      id: Date.now(),
      type: 'Void',
      status: 'Completed',
      actor: user.username,
      actorName: user.name,
      itemName: cartItem.name,
      itemQty: cartItem.qty,
      total: cartItem.price * cartItem.qty,
      reason: 'Item voided from cart',
      timestamp: new Date().toISOString(),
    }]);
    removeItem(cartItem.id);
    setVoidItemId(null);
  };

  const handleCheckout = async () => {
  setError('');
  
  // 1. Validation Checks
  if (cart.length === 0) { 
    setError('Cart is empty.'); 
    return; 
  }
  if (paymentMethod === 'Cash' && change < 0) { 
    setError('Insufficient cash received.'); 
    return; 
  }

  // 2. Prepare the data object
  // Inside Sales.js -> handleCheckout
  const saleData = {
    // 1. Change 'cashier_id' to 'user_id'
    user_id: user.id, 
    
    subtotal: subtotal,
    discount_percentage: discount,
    discount_amount: discountAmount,
    
    // 2. Change 'total_amount' to 'total'
    total: total, 
    
    // 3. Change 'payment_method' to 'paymentMethod'
    paymentMethod: paymentMethod, 
    
    cash_received: paymentMethod === 'Cash' ? parseFloat(cashReceived) : total,
    cash_change: paymentMethod === 'Cash' ? change : 0,
    
    items: cart.map(i => ({
      product_id: i.id,
      quantity: i.qty,
      price: i.price,
      total: i.price * i.qty
    }))
  };

  try {
    // 3. Send to API
    const savedSale = await api.createSale(saleData); 
    const receiptId = savedSale.id || genReceiptId();

    const tx = {
      id: receiptId,
      timestamp: new Date().toISOString(),
      cashier: user.username,
      cashierName: user.name,
      items: cart.map(i => ({ ...i })),
      subtotal,
      discount,
      discountAmount,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : total,
      change: paymentMethod === 'Cash' ? change : 0,
    };

    // 4. Update Local State (Stock, Transactions, Logs)
    setProducts(prev => prev.map(p => {
      const item = cart.find(i => i.id === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));

    setTransactions(prev => [...prev, tx]);
    setLastReceipt(tx);
    setLastTx(tx);

    setAuditLog(prev => [...prev, {
      id: Date.now(),
      type: 'Sale',
      status: 'Completed',
      actor: user.username,
      actorName: user.name,
      itemName: `Receipt #${receiptId}`,
      itemQty: cart.reduce((s, i) => s + i.qty, 0),
      total,
      reason: `${paymentMethod} payment`,
      timestamp: new Date().toISOString(),
    }]);

    // 5. Cleanup
    setCart([]);
    setDiscount(0);
    setCashReceived('');
    setSuccess(`Sale completed and recorded! Receipt #${receiptId}`);
    setShowReceipt(true);
    setTimeout(() => setSuccess(''), 3000);

  } catch (err) {
    console.error("Database Error:", err);
    // This will now show the actual error message from your api.js
    setError(`Server Error: ${err.message || "Failed to record sale"}`);
  }
  };

  const handleCancel = () => {
    if (cart.length === 0) { setShowCancelConfirm(false); return; }
    setCancelLog(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      cashier: user.username,
      cashierName: user.name,
      items: [...cart],
      subtotal,
      total,
      reason: 'Sale canceled by cashier',
    }]);
    setAuditLog(prev => [...prev, {
      id: Date.now(),
      type: 'Cancel',
      status: 'Completed',
      actor: user.username,
      actorName: user.name,
      itemName: `${cart.length} items`,
      itemQty: cart.reduce((s, i) => s + i.qty, 0),
      total,
      reason: 'Sale canceled',
      timestamp: new Date().toISOString(),
    }]);
    setCart([]);
    setDiscount(0);
    setCashReceived('');
    setShowCancelConfirm(false);
    setSuccess('Sale canceled and logged.');
    setTimeout(() => setSuccess(''), 2000);
  };

  const fmt = n => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, height: 'calc(100vh - 48px)', maxWidth: 1300 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Point of Sale</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>Select products or scan barcode</p>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="animate-fadeInUp delay-1" style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input className="pos-input" style={{ paddingLeft: 34 }} placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h2M3 9h2M3 13h2M21 5h-8M21 9h-8M21 13h-8"/><rect x="7" y="3" width="10" height="12" rx="1"/>
              </svg>
            </div>
            <input
              ref={barcodeRef}
              className="pos-input"
              style={{ paddingLeft: 34, width: 160 }}
              placeholder="Scan barcode..."
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              onKeyDown={handleBarcode}
            />
          </div>
        </div>

        <div className="animate-fadeInUp delay-2" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: 100,
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--accent-green)' : 'var(--border)',
                background: activeCategory === cat ? 'var(--accent-green-dim)' : 'transparent',
                color: activeCategory === cat ? 'var(--accent-green)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="animate-fadeInUp delay-3" style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, alignContent: 'start' }}>
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No products found
            </div>
          )}
          {filteredProducts.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-green)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              <div style={{
                width: '100%', height: 40,
                background: 'linear-gradient(135deg, var(--accent-green-dim), var(--bg-elevated))',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {p.category === 'Beverages' ? '🥤' : p.category === 'Bakery' ? '🍞' : p.category === 'Canned Goods' ? '🥫' : p.category === 'Instant Food' ? '🍜' : '🛒'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>#{p.barcode}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--accent-green)' }}>
                  {fmt(p.price)}
                </span>
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: p.stock <= 5 ? 'var(--accent-amber-dim)' : 'var(--bg-elevated)',
                  color: p.stock <= 5 ? 'var(--accent-amber)' : 'var(--text-muted)',
                }}>
                  {p.stock}
                </span>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: 'rgba(255,77,143,0.1)', border: '1px solid rgba(255,77,143,0.2)', borderRadius: 8, color: 'var(--accent-pink)', fontSize: 12, animation: 'fadeIn 0.2s' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '8px 12px', background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)', borderRadius: 8, color: 'var(--accent-green)', fontSize: 12, animation: 'fadeIn 0.2s' }}>
            ✅ {success}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Cart</span>
            {cart.length > 0 && (
              <span style={{ background: 'var(--accent-green)', color: 'var(--text-inverse)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={() => setShowCancelConfirm(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}>
              Clear all
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 13 }}>Cart is empty</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Tap a product to add it</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(item.price)} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-glass)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <div style={{ minWidth: 64, textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{fmt(item.price * item.qty)}</div>
                  </div>
                  <button onClick={() => { setVoidItemId(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-pink)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Discount %</label>
            <input
              type="number" min="0" max="100"
              value={discount}
              onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="pos-input"
              style={{ padding: '6px 10px', fontSize: 13, width: 80 }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 5, 10, 20].map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{
                  padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: discount === d ? 'var(--accent-green-dim)' : 'var(--bg-secondary)',
                  color: discount === d ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                }}>{d}%</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--accent-pink)' }}>
                <span>Discount ({discount}%)</span><span>−{fmt(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
              <span style={{ color: 'var(--text-primary)' }}>Total</span>
              <span style={{ color: 'var(--accent-green)' }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['Cash', 'GCash', 'Card'].map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, border: '1px solid',
                borderColor: paymentMethod === m ? 'var(--accent-green)' : 'var(--border)',
                background: paymentMethod === m ? 'var(--accent-green-dim)' : 'transparent',
                color: paymentMethod === m ? 'var(--accent-green)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>{m}</button>
            ))}
          </div>

          {paymentMethod === 'Cash' && (
            <div style={{ marginBottom: 10 }}>
              <input
                type="number" min="0"
                placeholder="Cash received..."
                value={cashReceived}
                onChange={e => setCashReceived(e.target.value)}
                className="pos-input"
                style={{ fontSize: 13, marginBottom: 6 }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                {[total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).map(amt => (
                  <button key={amt} onClick={() => setCashReceived(amt.toString())} style={{
                    flex: 1, padding: '5px 2px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer',
                  }}>{fmt(amt)}</button>
                ))}
              </div>
              {cashReceived && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, padding: '8px 10px', background: change >= 0 ? 'var(--accent-green-dim)' : 'rgba(255,77,143,0.1)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Change</span>
                  <span style={{ fontWeight: 700, color: change >= 0 ? 'var(--accent-green)' : 'var(--accent-pink)' }}>{fmt(Math.max(0, change))}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn-pos-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14, opacity: cart.length === 0 ? 0.5 : 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Process Sale — {fmt(total)}
          </button>
        </div>
      </div>

      {showReceipt && lastTx && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div onClick={e => e.stopPropagation()}>
            <ReceiptDisplay tx={lastTx} onClose={() => setShowReceipt(false)} />
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ marginBottom: 8 }}>Cancel Sale?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>This will clear all {cart.length} items from the cart and log a cancellation.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCancelConfirm(false)} className="btn-pos-secondary" style={{ flex: 1, justifyContent: 'center' }}>Keep Cart</button>
              <button onClick={handleCancel} className="btn-pos-danger" style={{ flex: 1, justifyContent: 'center' }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {voidItemId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ marginBottom: 8 }}>Void Item?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Remove <strong style={{ color: 'var(--text-primary)' }}>{cart.find(i => i.id === voidItemId)?.name}</strong> from cart?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setVoidItemId(null)} className="btn-pos-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={() => voidItem(cart.find(i => i.id === voidItemId))} className="btn-pos-danger" style={{ flex: 1, justifyContent: 'center' }}>Void Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}