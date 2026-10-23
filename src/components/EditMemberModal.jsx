import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { Edit2, X, Home, User, Phone, Shield } from 'lucide-react';
import { MEMBER_ROLES } from '../data/initialData';

export default function EditMemberModal({ isOpen, onClose, member }) {
  const { updateMember } = useMandal();

  const [flat, setFlat] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Member');

  useEffect(() => {
    if (member) {
      setFlat(member.flat || '');
      setName(member.name || '');
      setPhone(member.phone || '');
      setRole(member.role || 'Member');
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMember(member.id, {
      flat: flat.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim(),
      role
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={20} color="var(--saffron-900)" />
            <span>Edit Member: {member.flat}</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Home size={13} /> Flat / House No.
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={13} /> Role
                </span>
              </label>
              <select
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
                <User size={13} /> Resident Name
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} /> Mobile Phone (for WhatsApp)
              </span>
            </label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9825012345"
            />
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '14px' }}>
            Save Member Changes
          </button>
        </form>
      </div>
    </div>
  );
}
