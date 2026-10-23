import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { UserPlus, X, Home, Phone, User, Shield } from 'lucide-react';
import { MEMBER_ROLES } from '../data/initialData';

export default function AddMemberModal({ isOpen, onClose }) {
  const { addMember } = useMandal();

  const [flat, setFlat] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flat.trim()) {
      setError('Please enter a Flat or House number');
      return;
    }
    if (!name.trim()) {
      setError('Please enter the resident or family head name');
      return;
    }

    addMember({
      flat: flat.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim(),
      role
    });

    // Reset and close
    setFlat('');
    setName('');
    setPhone('');
    setRole('Member');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="var(--saffron-900)" />
            <span>Add New Society Member</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--red-600)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Home size={13} /> Flat / House No.
                </span>
              </label>
              <input
                id="new-member-flat-input"
                type="text"
                className="form-input"
                placeholder="e.g. A-101"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={13} /> Society Role
                </span>
              </label>
              <select
                id="new-member-role-select"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {MEMBER_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} /> Resident / Family Head Name
              </span>
            </label>
            <input
              id="new-member-name-input"
              type="text"
              className="form-input"
              placeholder="e.g. Ramesh Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} /> Mobile Phone (for WhatsApp Reminders)
              </span>
            </label>
            <input
              id="new-member-phone-input"
              type="tel"
              className="form-input"
              placeholder="e.g. 9825012345 (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
              Used by Admin for 1-click private WhatsApp contribution nudges.
            </div>
          </div>

          <button id="submit-add-member-btn" type="submit" className="submit-btn" style={{ marginTop: '16px' }}>
            Save Member to Directory
          </button>
        </form>
      </div>
    </div>
  );
}
