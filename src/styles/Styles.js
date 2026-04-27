export const buttonStyles = {
    btnPrimary: {
        width: '100%',
        padding: '11px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        fontWeight: 700,
        fontSize: '13px',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.2s'
    },
    btnSecondary: {
        width: '100%',
        padding: '11px',
        borderRadius: '10px',
        border: '1.5px solid #E2E8F0',
        background: 'white',
        color: '#1E293B',
        fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.2s'
    },
    btnDanger: {
        width: '100%',
        padding: '11px',
        borderRadius: '10px',
        border: 'none',
        background: '#EF4444',
        color: 'white',
        fontWeight: 700,
        fontSize: '13px',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.2s'
    },
    btnSmall: {
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        transition: 'all 0.2s'
    },
};

export const cardStyle = {
    background: 'white',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
    marginBottom: '16px'
};

export const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E2E8F0',
    fontSize: '13px',
    outline: 'none',
    marginBottom: '10px'
};

export const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

export const modalCard = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%'
};