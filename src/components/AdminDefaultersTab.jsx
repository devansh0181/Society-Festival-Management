import React from 'react';
import { useMandal } from '../context/MandalContext';
import { ShieldAlert, MessageCircle, CheckCircle, Lock, UserPlus, Users } from 'lucide-react';

export default function AdminDefaultersTab({ onOpenMarkPaid, onOpenAdminModal, onOpenAddMember }) {
  const { selectedEvent, members, isAdmin, getMemberWhatsAppReminderUrl, setActiveTab } = useMandal();

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFFDF9', borderRadius: '16px', border: '1.5px dashed var(--border-medium)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Lock size={24} color="var(--red-600)" />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-dark)' }}>Admin Access Required</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '8px auto 18px', lineHeight: 1.5 }}>
          Pending member names are strictly hidden from the public to avoid social embarrassment and maintain community goodwill.
        </p>
        <button 
          id="btn-unlock-admin-view"
          className="admin-badge-btn" 
          onClick={onOpenAdminModal}
          style={{ background: 'var(--saffron-900)', color: '#FFF', padding: '9px 18px', fontSize: '13px' }}
        >
          Unlock Admin Portal (PIN: 1234)
        </button>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F9FAFB', borderRadius: '14px', color: 'var(--text-muted)' }}>
        No festival selected. Please select or create an event above.
      </div>
    );
  }

  // If no members in directory yet
  if (members.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFFDF9', borderRadius: '16px', border: '1.5px dashed var(--border-medium)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Users size={24} color="var(--saffron-900)" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>No Members in Society Roster</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', margin: '8px auto 18px', lineHeight: 1.5 }}>
          Before tracking pending contributions, please register your society flats and resident names.
        </p>
        <button
          onClick={() => setActiveTab('members')}
          className="submit-btn"
          style={{ width: 'auto', padding: '9px 20px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={15} />
          <span>Go to Members Directory</span>
        </button>
      </div>
    );
  }

  const contributions = selectedEvent.contributions || [];
  const paidMemberIds = new Set(contributions.map((c) => c.memberId));

  // Members who haven't paid yet
  const pendingMembers = members.filter((m) => !paidMemberIds.has(m.id));

  return (
    <div id="admin-defaulters-tab-view">
      {/* Admin Privacy Banner */}
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <ShieldAlert size={20} color="#92400E" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12.5px', color: '#78350F', lineHeight: 1.45 }}>
          <strong>Admin Confidential View:</strong> {pendingMembers.length} families have pending contributions. 
          Use the green <strong>WhatsApp</strong> button to send a polite 1-to-1 private nudge without calling out their names in the society group.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-dark)' }}>
          Pending Contributions ({pendingMembers.length} Flats)
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Due: ₹{(selectedEvent.targetPerMember || 0).toLocaleString('en-IN')} / Flat
        </span>
      </div>

      {pendingMembers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', background: '#F0FDF4', borderRadius: '12px', color: 'var(--green-600)', fontWeight: 700 }}>
          🎉 100% Contribution Achieved! All {members.length} flats have paid for {selectedEvent.title}.
        </div>
      ) : (
        <div>
          {pendingMembers.map((member) => {
            const whatsappUrl = getMemberWhatsAppReminderUrl(member, selectedEvent);

            return (
              <div key={member.id} className="defaulter-card" id={`defaulter-row-${member.flat}`}>
                <div className="member-info">
                  <div className="flat-badge" style={{ background: '#FEE2E2', color: 'var(--red-600)', borderColor: '#FECACA' }}>
                    {member.flat}
                  </div>
                  <div>
                    <div className="member-name">{member.name}</div>
                    <div className="member-role" style={{ color: 'var(--red-600)', fontWeight: 600 }}>
                      Pending: ₹{(selectedEvent.targetPerMember || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  {/* 1-Click WhatsApp Reminder Button */}
                  <a
                    id={`btn-wa-remind-${member.flat}`}
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-remind"
                    title={`Send polite private WhatsApp reminder to ${member.name}`}
                  >
                    <MessageCircle size={14} />
                    <span>Nudge</span>
                  </a>

                  {/* Mark Paid Button */}
                  <button
                    id={`btn-mark-paid-${member.flat}`}
                    className="btn-mark-paid"
                    onClick={() => onOpenMarkPaid(member)}
                    title={`Record payment for ${member.name}`}
                  >
                    <CheckCircle size={13} />
                    <span>Paid</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
