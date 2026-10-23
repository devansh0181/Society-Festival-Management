import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { getSavedFirebaseConfig } from '../services/firebase';
import { Settings, X, Building, Landmark, Lock, QrCode, Cloud, CloudOff, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function EditSocietyModal({ isOpen, onClose }) {
  const { 
    society, 
    updateSociety, 
    isCloudConnected, 
    cloudSyncStatus, 
    connectCloudDatabase, 
    disconnectCloudDatabase 
  } = useMandal();

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankBalance, setBankBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [adminPin, setAdminPin] = useState('');

  // Cloud sync form state
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [firebaseConfigText, setFirebaseConfigText] = useState('');
  const [cloudMessage, setCloudMessage] = useState('');

  useEffect(() => {
    if (society) {
      setName(society.name || '');
      setSubtitle(society.subtitle || '');
      setUpiId(society.upiId || '');
      setBankBalance(society.treasury?.bankBalance || 0);
      setCashBalance(society.treasury?.cashBalance || 0);
      setAdminPin(society.adminPin || '1234');
    }
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setFirebaseConfigText(JSON.stringify(saved, null, 2));
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

          {/* Cloud Database & Multi-Device Realtime Sync */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isCloudConnected ? <Cloud size={16} color="var(--green-600)" /> : <CloudOff size={16} color="#64748B" />}
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Cloud Realtime Sync (Firebase)
                </span>
              </div>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: isCloudConnected ? '#DCFCE7' : '#F1F5F9',
                color: isCloudConnected ? '#166534' : '#64748B'
              }}>
                {isCloudConnected ? '🟢 Live Cloud Synced' : '🟠 Local Storage'}
              </span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sync accounts live across all residents' mobile phones and laptops using free Google Cloud Firestore.
            </div>

            <button
              type="button"
              onClick={() => setShowCloudConfig(!showCloudConfig)}
              style={{
                marginTop: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--saffron-900)',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <span>{showCloudConfig ? 'Hide Cloud Database Settings' : 'Configure Cloud Database Credentials'}</span>
              {showCloudConfig ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showCloudConfig && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--text-dark)' }}>
                  Paste Firebase Web Config (JSON object):
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={firebaseConfigText}
                  onChange={(e) => setFirebaseConfigText(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "projectId": "shakti-mandal",\n  "authDomain": "..."\n}`}
                  style={{ fontFamily: 'monospace', fontSize: '10.5px' }}
                />

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(firebaseConfigText);
                        if (!parsed.apiKey || !parsed.projectId) {
                          alert('Invalid config: apiKey and projectId are required.');
                          return;
                        }
                        connectCloudDatabase(parsed);
                        setCloudMessage('✅ Cloud database connected successfully!');
                        setTimeout(() => setCloudMessage(''), 3000);
                      } catch (err) {
                        alert('Could not parse JSON. Please check the format.');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'var(--green-600)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Connect & Sync Live
                  </button>

                  {isCloudConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        disconnectCloudDatabase();
                        setFirebaseConfigText('');
                        setCloudMessage('Disconnected from cloud. Using local storage.');
                        setTimeout(() => setCloudMessage(''), 3000);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#FFF',
                        color: 'var(--red-600)',
                        border: '1px solid #FECACA',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {cloudMessage && (
                  <div style={{ fontSize: '11px', color: 'var(--green-600)', marginTop: '6px', fontWeight: 600 }}>
                    {cloudMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <button id="submit-edit-society-btn" type="submit" className="submit-btn" style={{ marginTop: '14px' }}>
            Save Society Settings
          </button>
        </form>
      </div>
    </div>
  );
}
