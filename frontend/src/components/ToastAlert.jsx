import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastAlert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const getConfig = () => {
    switch (type) {
      case 'error':
      case 'conflict':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          accent: '#DC2626',
          text: '#991B1B',
          icon: <XCircle size={20} color="#DC2626" strokeWidth={2.4} style={{ flexShrink: 0 }} />
        };
      case 'success':
        return {
          bg: '#F0F9F4',
          border: '#A7D9B8',
          accent: '#0B3B2C',
          text: '#064E3B',
          icon: <CheckCircle2 size={20} color="#0B3B2C" strokeWidth={2.4} style={{ flexShrink: 0 }} />
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          accent: '#D97706',
          text: '#92400E',
          icon: <AlertTriangle size={20} color="#D97706" strokeWidth={2.4} style={{ flexShrink: 0 }} />
        };
      case 'info':
      default:
        return {
          bg: '#F0F9FF',
          border: '#BAE6FD',
          accent: '#0284C7',
          text: '#0369A1',
          icon: <Info size={20} color="#0284C7" strokeWidth={2.4} style={{ flexShrink: 0 }} />
        };
    }
  };

  const config = getConfig();

  return (
    <div className="animate-fade-in" style={{
      marginBottom: '1.5rem',
      padding: '0.95rem 1.35rem',
      borderRadius: '4px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderLeft: `4px solid ${config.accent}`,
      color: config.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      fontSize: '0.92rem',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {config.icon}
        <div style={{ lineHeight: 1.5, fontWeight: 600, color: config.text }}>
          {message}
        </div>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: config.text, 
            cursor: 'pointer', 
            opacity: 0.75,
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            borderRadius: '2px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = '0.75'; }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
};

export default ToastAlert;
