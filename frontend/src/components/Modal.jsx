import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '680px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.25rem'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          maxWidth: maxWidth,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2.5rem',
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E8E2D8',
          borderRadius: '2px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.18)',
          color: '#1C1C1C'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          borderBottom: '1px solid #ECE7DF',
          paddingBottom: '1.1rem'
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.55rem',
              color: '#141414',
              fontWeight: 500,
              letterSpacing: '0.01em',
              margin: 0
            }}>
              {title}
            </h3>
            <div style={{ width: '36px', height: '2px', background: '#0B3B2C', marginTop: '6px' }} />
          </div>

          <button 
            onClick={onClose} 
            aria-label="Close Dialog"
            style={{
              background: '#FAF9F5',
              border: '1px solid #E8E2D8',
              color: '#141414',
              borderRadius: '2px',
              cursor: 'pointer',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.background = '#0B3B2C';
              e.currentTarget.style.borderColor = '#0B3B2C';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#141414';
              e.currentTarget.style.background = '#FAF9F5';
              e.currentTarget.style.borderColor = '#E8E2D8';
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ color: '#1C1C1C' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
