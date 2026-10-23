import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { Award, X, ArrowRight, CheckCircle, Landmark, Wallet } from 'lucide-react';

export default function CompleteEventModal({ isOpen, onClose, event }) {
  const { completeAndSettleEvent, getEventStats, society } = useMandal();
  const [destination, setDestination] = useState('cash'); // 'cash' | 'bank'
  const [isSuccess, setIsSuccess] = useState(false);
  const [settledAmount, setSettledAmount] = useState(0);

  if (!isOpen || !event) return null;

  const stats = getEventStats(event);
  const surplus = stats.surplus;

  const handleConfirm = () => {
    const amount = completeAndSettleEvent(event.id, { destination });
    setSettledAmount(amount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--green-600)" />
            <span>Complete & Settle Festival Event</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green-600)' }}>
              Event Successfully Completed!
            </h3>
            <p style={{ color: 'var(--text-body)', fontSize: '13.5px', marginTop: '8px' }}>
              Surplus of <strong>₹{settledAmount.toLocaleString('en-IN')}</strong> has been deposited into your Society Main Treasury ({destination === 'bank' ? 'Bank Account' : 'Cash in Hand'}).
            </p>
          </div>
        ) : (
          <div>
            <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{event.icon || '🚩'}</span>
                <span>{event.title}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#15803D', marginTop: '3px' }}>
                {event.dates || 'Festival Celebrations'} • Ready for Financial Closure
              </div>
            </div>

            {/* Financial Reconciliation Breakdown */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Event Accounts Summary
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ background: '#FFF', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Estimated Budget</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '2px' }}>
                    ₹{(event.estimatedBudget || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Total Collected</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--saffron-900)', marginTop: '2px' }}>
                    ₹{stats.totalCollected.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#FFF', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Total Spent</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--maroon-900)', marginTop: '2px' }}>
                    ₹{stats.totalSpent.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Big Surplus Transfer Callout */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ECFDF5', border: '1.5px dashed #059669', padding: '12px 14px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#065F46' }}>
                    Surplus to Add in Main Treasury:
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857' }}>
                    Savings transferred to {society.name} corpus
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>
                  +₹{surplus.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Destination Selection */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>
                Deposit Surplus Balance Into:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setDestination('cash')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: destination === 'cash' ? '2px solid var(--green-600)' : '1px solid #CBD5E1',
                    background: destination === 'cash' ? '#F0FDF4' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left'
                  }}
                >
                  <Wallet size={16} color={destination === 'cash' ? 'var(--green-600)' : '#64748B'} />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: destination === 'cash' ? 'var(--green-600)' : 'var(--text-dark)' }}>
                      Cash in Hand
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>Physical Mandal Cash</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('bank')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: destination === 'bank' ? '2px solid var(--blue-600)' : '1px solid #CBD5E1',
                    background: destination === 'bank' ? '#EFF6FF' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left'
                  }}
                >
                  <Landmark size={16} color={destination === 'bank' ? 'var(--blue-600)' : '#64748B'} />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: destination === 'bank' ? 'var(--blue-600)' : 'var(--text-dark)' }}>
                      Bank Account
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>Society Bank Ledger</div>
                  </div>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: 'none',
                  color: 'var(--text-body)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                id="btn-confirm-complete-settle"
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 2,
                  padding: '11px 16px',
                  borderRadius: '8px',
                  background: 'var(--green-600)',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle size={16} />
                <span>Deposit ₹{surplus.toLocaleString('en-IN')} & Complete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
