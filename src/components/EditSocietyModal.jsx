import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { Settings, X, Building, Landmark, Lock, QrCode } from 'lucide-react';

export default function EditSocietyModal({ isOpen, onClose }) {
  const { society, updateSociety } = useMandal();

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankBalance, setBankBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [adminPin, setAdminPin] = useState('');

  useEffect(() => {
    if (society) {
      setName(society.name || '');
      setSubtitle(society.subtitle || '');
      setUpiId(society.upiId || '');
      setBankBalance(society.treasury?.bankBalance || 0);
      setCashBalance(society.treasury?.cashBalance || 0);
      setAdminPin(society.adminPin || '1234');
    }
  }, [society, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSociety({
      name: name.trim(),
      subtitle: subtitle.trim(),
      upiId: upiId.trim(),
      adminPin: adminPin.trim() || '1234',
      bankBalance: Number(bankBalance || 0),
      cashBalance: Number(cashBalance || 0)
    });
    onClose();
  };

  const totalCorpus = Number(bankBalance || 0) + Number(cashBalance || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="var(--saffron-900)" />
            <span>Society Settings & Main Treasury</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Building size={13} /> Society / Organization Name
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shakti Yuvak Mandal"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Campus / Subtitle</label>
            <input
              type="text"
              className="form-input"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Gokul Heights Residential Society"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <QrCode size={13} /> Society UPI ID (for QR & WhatsApp Pay)
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. shaktimandal@upi"
            />
          </div>

          {/* Treasury Balances */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Landmark size={15} color="var(--blue-600)" />
              <span>Society General Corpus (Main Amount)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bank Balance (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  min={0}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cash in Hand (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Main Corpus:</span>
              <strong style={{ color: 'var(--green-600)' }}>₹{totalCorpus.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Admin PIN */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={13} /> Admin Secret PIN
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="e.g. 1234"
              maxLength={6}
              required
            />
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
              PIN needed to unlock Admin features (record payments, add bills, manage members).
            </div>
          </div>

          <button id="submit-edit-society-btn" type="submit" className="submit-btn" style={{ marginTop: '14px' }}>
            Save Society Settings
          </button>
        </form>
      </div>
    </div>
  );
}
