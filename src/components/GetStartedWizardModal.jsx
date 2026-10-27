import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { Sparkles, Building, Landmark, Users, Calendar, ArrowRight, ArrowLeft, CheckCircle2, X, PlusCircle, Lock } from 'lucide-react';

export default function GetStartedWizardModal({ isOpen, onClose }) {
  const { society, updateSociety, addMember, createNewEvent, isAdmin } = useMandal();

  const [step, setStep] = useState(1);

  // Step 1: Society Details
  const [societyName, setSocietyName] = useState(society.name || 'My Residential Society');
  const [subtitle, setSubtitle] = useState(society.subtitle || 'Residential Society');
  const [upiId, setUpiId] = useState(society.upiId || 'society@upi');

  // Step 2: Main Starting Amount (Bank + Cash)
  const [bankBalance, setBankBalance] = useState(society.treasury?.bankBalance || 0);
  const [cashBalance, setCashBalance] = useState(society.treasury?.cashBalance || 0);

  // Step 3: Optional First Member (Blank by default - NO auto-added members)
  const [firstFlat, setFirstFlat] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstPhone, setFirstPhone] = useState('');
  const [firstRole, setFirstRole] = useState('President');

  // Step 4: Optional First Festival (Blank by default - NO auto-created events)
  const [addEventNow, setAddEventNow] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDates, setEventDates] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('20000');
  const [targetPerMember, setTargetPerMember] = useState('1000');
  const [eventIcon, setEventIcon] = useState('🚩');

  if (!isOpen) return null;

  // Block non-admin from modifying wizard
  if (!isAdmin) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '28px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>Admin Access Required</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            Only the society administrator can configure society setup. Please unlock Admin mode in the top header using your 4-digit PIN.
          </p>
          <button className="submit-btn" onClick={onClose} style={{ marginTop: '18px' }}>
            Understood
          </button>
        </div>
      </div>
    );
  }

  const totalCorpus = Number(bankBalance || 0) + Number(cashBalance || 0);

  const handleFinish = (e) => {
    e.preventDefault();

    // 1. Update Society & Opening Treasury and mark wizard as permanently completed
    updateSociety({
      name: societyName.trim() || 'My Residential Society',
      subtitle: subtitle.trim(),
      upiId: upiId.trim(),
      bankBalance: Number(bankBalance || 0),
      cashBalance: Number(cashBalance || 0),
      wizardCompleted: true
    });

    try {
      if (society?.id) {
        localStorage.setItem(`setup_wizard_done_${society.id}`, 'true');
      }
    } catch (_) {}

    // 2. Add Member ONLY if user explicitly typed a flat number and name
    if (firstFlat.trim() && firstName.trim()) {
      addMember({
        flat: firstFlat.trim().toUpperCase(),
        name: firstName.trim(),
        phone: firstPhone.trim(),
        role: firstRole
      });
    }

    // 3. Create Event ONLY if user explicitly checked the box and typed an event title
    if (addEventNow && eventTitle.trim()) {
      createNewEvent({
        title: eventTitle.trim(),
        dates: eventDates.trim() || 'Upcoming',
        estimatedBudget: Number(estimatedBudget || 20000),
        targetPerMember: Number(targetPerMember || 500),
        icon: eventIcon,
        status: 'active'
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--saffron-900)" />
            <span>Society Setup Wizard (Step {step} of 4)</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '4px',
                background: s <= step ? 'var(--saffron-900)' : 'var(--border-medium)',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>

        {/* STEP 1: Society Details */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={20} color="var(--saffron-900)" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Step 1: Society Profile</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Name your residential society or festival mandal.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Society / Mandal Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Gokul Residents Association"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus / Subtitle</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Block A & B, Satellite Road"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Society UPI ID (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. society@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                UPI ID displayed to members when making contributions.
              </div>
            </div>

            <button
              type="button"
              className="submit-btn"
              onClick={() => setStep(2)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span>Next: Society Treasury Amount</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* STEP 2: Main Starting Amount */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Landmark size={20} color="var(--blue-600)" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Step 2: Society Opening Money</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enter your main society bank account and cash in hand balance.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bank Account Balance (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
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
                  placeholder="0"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Total Main Society Corpus:</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green-600)', marginTop: '2px' }}>
                ₹{totalCorpus.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                Shows on your dashboard as the main reserve. Editable anytime in Settings.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: '#FFF',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={() => setStep(3)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Next: Add Members</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Flats / Members (Optional first flat or skip) */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="var(--saffron-900)" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Step 3: Society Members</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>You can add your first resident now, or add them later in the Members tab.</p>
              </div>
            </div>

            <div style={{ background: '#FFFDF9', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                Add First Flat / Committee Member (Optional)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Flat No.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. A-101"
                    value={firstFlat}
                    onChange={(e) => setFirstFlat(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={firstRole}
                    onChange={(e) => setFirstRole(e.target.value)}
                  >
                    <option value="President">President</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Committee Member">Committee</option>
                    <option value="Member">Resident Member</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Resident Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Devansh Shrimali"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9825012345"
                  value={firstPhone}
                  onChange={(e) => setFirstPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '14px', textAlign: 'center' }}>
              Leave blank if you prefer to add members one-by-one in the Members tab later.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  background: '#FFF',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={() => setStep(4)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <span>Next: Festival Event</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: First Festival Event (Optional checkbox) */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color="var(--maroon-900)" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Step 4: Festival Celebration</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Publish your first festival now or start with zero events.</p>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={addEventNow}
                  onChange={(e) => setAddEventNow(e.target.checked)}
                />
                <span>Create a festival event now</span>
              </label>
            </div>

            {addEventNow ? (
              <div style={{ background: '#FFFDF9', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Ganesh Chaturthi 2026, Diwali Sneh Milan..."
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      min={100}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Target / Flat (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={targetPerMember}
                      onChange={(e) => setTargetPerMember(e.target.value)}
                      min={10}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', border: '1px dashed var(--border-medium)', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                No events will be created yet. You can click <strong>"+ Create Event"</strong> on the Society Dashboard whenever you plan your first celebration.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  background: '#FFF',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleFinish}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--green-600)' }}
              >
                <CheckCircle2 size={16} />
                <span>Finish Setup & Launch</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
