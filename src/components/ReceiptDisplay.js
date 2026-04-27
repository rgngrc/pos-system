import React from 'react';

const cardStyle = {
    background: 'white',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
    marginBottom: '16px',
};

function ReceiptDisplay({ receipt, isReprint, maskId, onNewSale, onReprint }) {
    return (
        <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {isReprint && (
                    <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '8px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
                        *** REPRINT ***
                    </div>
                )}
                <h4 style={{ fontWeight: 800 }}>Store Receipt</h4>
                <p style={{ color: '#94A3B8', fontSize: '12px', margin: '4px 0 0' }}>{receipt.date}</p>
                <p style={{ color: '#94A3B8', fontSize: '12px', margin: '2px 0 0' }}>Cashier: {receipt.cashierName}</p>
            </div>

            <div style={{ borderTop: '2px dashed #E2E8F0', borderBottom: '2px dashed #E2E8F0', padding: '12px 0', marginBottom: '16px' }}>
                {receipt.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <div>{item.name} x{item.qty}</div>
                        <div style={{ fontWeight: 700 }}>₱{(item.price * item.qty).toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 700 }}>₱{receipt.subtotal.toLocaleString()}</span>
                </div>

                {receipt.discountType && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10B981' }}>
                            <span>{receipt.discountType} ({(receipt.discountAmount / receipt.subtotal * 100).toFixed(0)}%):</span>
                            <span style={{ fontWeight: 700 }}>-₱{receipt.discountAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#94A3B8' }}>
                            <span>ID: {maskId(receipt.discountId)}</span>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '8px', borderRadius: '8px', fontWeight: 800, fontSize: '16px', marginTop: '12px' }}>
                    <span>TOTAL:</span>
                    <span>₱{receipt.finalTotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', marginTop: '8px' }}>
                    <span>Paid Amount:</span>
                    <span>₱{receipt.paidAmount.toLocaleString()}</span>
                </div>

                {receipt.change > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ECFDF5', padding: '8px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', marginTop: '8px', color: '#10B981' }}>
                        <span>Change:</span>
                        <span>₱{receipt.change.toLocaleString()}</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                    <span>Payment Method:</span>
                    <span>{receipt.paymentMethod}</span>
                </div>
            </div>

            <button
                onClick={onNewSale}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                ✓ New Sale
            </button>

            <button
                onClick={onReprint}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'white', color: '#1E293B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
                🔄 Reprint Receipt
            </button>
        </div>
    );
}

export default ReceiptDisplay;