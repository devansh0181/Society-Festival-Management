import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { 
  User, 
  X, 
  Building2, 
  Landmark, 
  Lock, 
  QrCode, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Copy, 
  LogOut,
  ShieldCheck,
  Cloud
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { 
    society, 
    updateSociety, 
    isCloudConnected, 
    cloudSyncStatus,
    logout,
    authSession
  } = useMandal();

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankBalance, setBankBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [adminPin, setAdminPin] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (society) {
      setName(society.name || '');
      setSubtitle(society.subtitle || '');
      setAdminName(society.adminName || authSession?.adminName || '');
      setAdminMobile(society.adminMobile || authSession?.mobile || '');
      setAdminEmail(society.adminEmail || authSession?.email || '');
      setUpiId(society.upiId || '');
      setBankBalance(society.treasury?.bankBalance || 0);
      setCashBalance(society.treasury?.cashBalance || 0);
      setAdminPin(society.adminPin || '1234');
    }
  }, [society, authSession, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSociety({
      name: name.trim(),
      subtitle: subtitle.trim(),
      adminName: adminName.trim(),
      adminMobile: adminMobile.trim(),
      adminEmail: adminEmail.trim(),
      upiId: upiId.trim(),
      adminPin: adminPin.trim() || '1234',
      bankBalance: Number(bankBalance || 0),
      cashBalance: Number(cashBalance || 0)
    });
    onClose();
  };

  const handleCopySocietyCode = () => {
    const code = society.id || 'society-portal';
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleLogoutClick = () => {
    if (window.confirm(`Log out of "${society.name || 'Society'}"? You can log back in anytime with your mobile number/email and password.`)) {
      onClose();
      logout();
    }
  };

  const totalCorpus = Number(bankBalance || 0) + Number(cashBalance || 0);

  return (
    <div className="modal-overlay" onClick={onClose} id="profile-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--saffron-900)" />
            <span>Society Profile & Treasury</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Society ID & Cloud Live Badge */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                ORGANIZATION IDENTIFIER
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'monospace' }}>
                {society.id || 'shakti-yuvak-mandal'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleCopySocietyCode}
                style={{
                  background: '#FFF',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-body)'
                }}
                title="Copy Society ID code"
              >
                {copiedCode ? <CheckCircle2 size={12} color="var(--green-600)" /> : <Copy size={12} />}
                <span>{copiedCode ? 'Copied' : 'Copy ID'}</span>
              </button>

              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '999px',
                background: isCloudConnected ? '#DCFCE7' : '#FEF3C7',
                color: isCloudConnected ? '#166534' : '#92400E',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Cloud size={11} />
                <span>{isCloudConnected ? 'Cloud Active' : 'Offline'}</span>
              </span>
            </div>
          </div>

          {/* Section 1: Society Info */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={13} /> Society / Organization Name
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
              placeholder="e.g. Residential Society Welfare & Festivals"
            />
          </div>

          {/* Section 2: Admin Contact Info */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#92400E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} />
              <span>Registered Administrator Contact</span>
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Admin / Secretary Name</label>
              <input
                type="text"
                className="form-input"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Rajesh Patel"
                style={{ fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={11} /> Login Mobile
                  </span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={11} /> Reset Email
                  </span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@email.com"
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Treasury Balances */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-medium)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Landmark size={14} color="var(--blue-600)" />
                <span>General Treasury Opening Balance</span>
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--maroon-900)' }}>
                Total: ₹{totalCorpus.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>Bank Balance (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px' }}>Cash in Hand (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(e.target.value)}
                  min="0"
                  step="50"
                />
              </div>
            </div>
          </div>

          {/* Section 4: UPI ID & Admin PIN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <QrCode size={13} /> Society UPI ID
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

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={13} /> 4-Digit PIN
                </span>
              </label>
              <input
                type="password"
                className="form-input"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                maxLength={4}
                placeholder="1234"
                style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
              />
            </div>
          </div>

          {/* Cloud Auto-Sync Notice - Clean & Professional without JSON config textarea */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="var(--green-600)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '11.5px', color: '#166534', lineHeight: 1.4 }}>
              <strong>Multi-Device Real-Time Sync:</strong> All records are saved securely in the cloud. Changes sync instantly across all society members' phones and computers.
            </div>
          </div>

          {/* Submit Button */}
          <button id="submit-profile-changes-btn" type="submit" className="submit-btn">
            Save Profile Changes
          </button>

          {/* Logout Option */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <button
              type="button"
              id="btn-profile-logout"
              onClick={handleLogoutClick}
              style={{
                background: '#FFF5F5',
                color: 'var(--red-600)',
                border: '1px solid #FED7D7',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Log out from this society portal"
            >
              <LogOut size={14} />
              <span>Log Out of Society</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
