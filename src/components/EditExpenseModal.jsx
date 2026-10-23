import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { Edit2, X, Trash2 } from 'lucide-react';

export default function EditExpenseModal({ isOpen, onClose, expense, eventId }) {
  const { updateExpense, deleteExpense } = useMandal();

  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [receiptNote, setReceiptNote] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setVendor(expense.vendor || '');
      setAmount(String(expense.amount || ''));
      setPaidBy(expense.paidBy || '');
      setReceiptNote(expense.receiptNote || '');
    }
  }, [expense, isOpen]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateExpense(eventId, expense.id, {
      title: title.trim(),
      vendor: vendor.trim(),
      amount: Number(amount),
      paidBy: paidBy.trim(),
      receiptNote: receiptNote.trim()
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Delete bill "${expense.title}" (₹${expense.amount})?`)) {
      deleteExpense(eventId, expense.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={20} color="var(--maroon-900)" />
            <span>Edit Expense Bill</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Bill Description / Item</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={1}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vendor / Store Name</label>
              <input
                type="text"
                className="form-input"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Paid By</label>
              <input
                type="text"
                className="form-input"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bill / Voucher No.</label>
              <input
                type="text"
                className="form-input"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: 'var(--red-600)',
                borderRadius: '10px',
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Delete Bill"
            >
              <Trash2 size={15} />
            </button>

            <button type="submit" className="submit-btn" style={{ flex: 1, background: 'var(--maroon-900)' }}>
              Save Bill Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
