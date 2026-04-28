import React from 'react';

export default function ReceiptDisplay({ tx, onClose, onReprint }) {
  if (!tx) return null;
  const fmt = n => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const win = window.open('', '', 'height=600,width=400');
    win.document.write('<html><head><title>Receipt</title>');
    win.document.write('<style>body{font-family:monospace;font-size:12px;padding:20px;} hr{border-top:1px dashed #333;}</style>');
    win.document.write('</head><body>');
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      width: 340,
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Receipt</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handlePrint} className="btn-pos-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
            🖨️ Print
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div id="receipt-content" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Store header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--accent-green)' }}>POS System</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Your Local Store</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tel: (02) 1234-5678</div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receipt #</span>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>#{tx.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(tx.timestamp).toLocaleString('en-PH')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cashier</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{tx.cashierName}</span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed var(--border)', marginBottom: 12 }} />

        {/* Items */}
        {tx.items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.qty} × {fmt(item.price)}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(item.price * item.qty)}</span>
          </div>
        ))}

        <div style={{ borderTop: '1px dashed var(--border)', margin: '12px 0' }} />

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(tx.subtotal)}</span>
        </div>
        {tx.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--accent-pink)' }}>Discount ({tx.discount}%)</span>
            <span style={{ fontSize: 12, color: 'var(--accent-pink)' }}>−{fmt(tx.discountAmount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>TOTAL</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--accent-green)' }}>{fmt(tx.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Payment ({tx.paymentMethod})</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(tx.cashReceived)}</span>
        </div>
        {tx.paymentMethod === 'Cash' && tx.change > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Change</span>
            <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(tx.change)}</span>
          </div>
        )}

        <div style={{ borderTop: '1px dashed var(--border)', margin: '16px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Thank you for your purchase!</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Please keep this receipt for reference</div>
        </div>
      </div>
    </div>
  );
}