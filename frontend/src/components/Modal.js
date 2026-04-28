import React from 'react';
import { modalOverlay, modalCard } from '../styles/commonStyles';

function Modal({ isOpen, title, children, onClose }) {
    if (!isOpen) return null;

    return (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={modalCard}>
                {title && <h5 style={{ fontWeight: 800, marginBottom: '16px' }}>{title}</h5>}
                {children}
            </div>
        </div>
    );
}

export default Modal;