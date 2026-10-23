import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { CheckCircle2, X, IndianRupee } from 'lucide-react';

export default function MarkPaidModal({ isOpen, onClose, member }) {
  const { selectedEvent, recordContribution } = useMandal();
  const [amount, setAmount] = useState(selectedEvent?.targetPerMember || 900);
  const [mode, setMode] = useState('UPI');

  useEffect(() => {
    if (selectedEvent) {
      setAmount(selectedEvent.targetPerMember || 900);
    }
  }, [selectedEvent, member]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    recordContribution(selectedEvent.id, member.id, amount, mode);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="var(--green-600)" />
            <span>Record Contribution</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
            {member.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Flat: <strong>{member.flat}</strong> • Phone: +91 {member.phone}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--saffron-900)', fontWeight: 600, marginTop: '4px' }}>
            Event: {selectedEvent.title}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Contribution Amount (₹)</label>
            <input
              id="payment-amount-input"
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                id="btn-mode-upi"
                onClick={() => setMode('UPI')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: mode === 'UPI' ? '2px solid var(--blue-600)' : '1px solid var(--border-medium)',
                  background: mode === 'UPI' ? '#EFF6FF' : '#FFF',
                  color: mode === 'UPI' ? 'var(--blue-600)' : 'var(--text-body)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                📲 Online UPI
              </button>
              <button
                type="button"
                id="btn-mode-cash"
                onClick={() => setMode('Cash')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: mode === 'Cash' ? '2px solid var(--saffron-900)' : '1px solid var(--border-medium)',
                  background: mode === 'Cash' ? '#FFF7ED' : '#FFF',
                  color: mode === 'Cash' ? 'var(--saffron-900)' : 'var(--text-body)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                💵 Cash in Hand
              </button>
            </div>
          </div>

          <button id="submit-mark-paid-btn" type="submit" className="submit-btn" style={{ background: 'var(--green-600)' }}>
            Confirm & Generate Receipt
          </button>
        </form>
      </div>
    </div>
  );
}
