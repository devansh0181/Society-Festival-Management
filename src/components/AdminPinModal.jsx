import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { KeyRound, X, AlertCircle } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose }) {
  const { unlockAdmin } = useMandal();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (unlockAdmin(pin)) {
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={20} color="var(--saffron-900)" />
            <span>Admin Authorization</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45 }}>
          Enter the 4-digit Mandal Committee PIN to unlock expense logging, member payment controls, and private reminders.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Committee PIN (Default: 1234)</label>
            <input
              id="admin-pin-input"
              type="password"
              maxLength={6}
              className="form-input"
              style={{ fontSize: '20px', letterSpacing: '8px', textAlign: 'center' }}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red-600)', fontSize: '12px', marginBottom: '12px' }}>
              <AlertCircle size={14} />
              <span>Incorrect PIN. Please try again (Default: 1234).</span>
            </div>
          )}

          <button id="admin-pin-submit-btn" type="submit" className="submit-btn">
            Unlock Admin Access
          </button>
        </form>
      </div>
    </div>
  );
}
