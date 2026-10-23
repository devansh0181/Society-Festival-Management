import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { Receipt, X, PlusCircle, Sparkles } from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose }) {
  const { selectedEvent, addExpense } = useMandal();

  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Treasurer');
  const [receiptNote, setReceiptNote] = useState('');

  if (!isOpen || !selectedEvent) return null;

  // Quick suggestion chips to save typing, but free text!
  const suggestions = [
    'Petrol for Generator',
    'Sound & DJ System',
    'Mandap & Decoration',
    'Eco Murti & Poojan Samagri',
    'Prasad, Modak & Sweets',
    'Cleaning & Waste Disposal',
    'Municipal / NOC Permissions',
    'Prizes & Gifts'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addExpense(selectedEvent.id, {
      title: title.trim(),
      vendor: vendor.trim() || 'Vendor',
      amount: Number(amount),
      paidBy: paidBy.trim() || 'Treasurer',
      receiptNote: receiptNote.trim()
    });

    // Reset and close
    setTitle('');
    setVendor('');
    setAmount('');
    setPaidBy('Treasurer');
    setReceiptNote('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={20} color="var(--maroon-900)" />
            <span>Add Expense Bill ({selectedEvent.title})</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Bill Description / Item</label>
            <input
              id="expense-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Petrol for Generator, Sound DJ, Flowers, Food..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />

            {/* Quick Suggestion Chips */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
              {suggestions.slice(0, 4).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTitle(s)}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                id="expense-amount-input"
                type="number"
                className="form-input"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={1}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vendor / Store Name</label>
              <input
                id="expense-vendor-input"
                type="text"
                className="form-input"
                placeholder="e.g. HP Petrol Pump, Decorator"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Paid By (Member / Treasury)</label>
              <input
                id="expense-paidby-input"
                type="text"
                className="form-input"
                placeholder="e.g. Devansh (Treasurer)"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bill / Voucher No. (Optional)</label>
              <input
                id="expense-note-input"
                type="text"
                className="form-input"
                placeholder="e.g. Bill #402, Cash Voucher"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
              />
            </div>
          </div>

          <button id="submit-expense-btn" type="submit" className="submit-btn" style={{ background: 'var(--maroon-900)', marginTop: '8px' }}>
            Save Expense Bill
          </button>
        </form>
      </div>
    </div>
  );
}
