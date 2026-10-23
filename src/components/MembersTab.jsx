import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { Users, UserPlus, Search, Trash2, Edit2, Phone, Shield } from 'lucide-react';

export default function MembersTab({ onOpenAddMember, onOpenEditMember, onOpenAdminModal }) {
  const { members, isAdmin, deleteMember } = useMandal();
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.flat || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div id="members-tab-view">
      {/* Top Header & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} color="var(--saffron-900)" />
            <span>Society Directory ({members.length} Flats Registered)</span>
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Official society directory of resident families and committee members.
          </p>
        </div>

        <div>
          {isAdmin ? (
            <button
              id="btn-open-add-member"
              className="action-btn"
              onClick={onOpenAddMember}
              style={{
                padding: '7px 16px',
                fontSize: '12.5px',
                background: 'var(--saffron-900)',
                color: '#FFF',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <UserPlus size={14} />
              <span>+ Add Member</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              style={{
                background: 'none',
                border: '1px solid var(--border-medium)',
                borderRadius: '999px',
                padding: '5px 12px',
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Shield size={12} />
              <span>Admin: Manage Members</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input when members exist */}
      {members.length > 0 && (
        <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            id="search-member-directory-input"
            type="text"
            className="form-input"
            placeholder="Search by Flat (e.g. A-101), Resident Name, or Role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
          />
        </div>
      )}

      {/* Zero State */}
      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '45px 20px', background: '#FFFDF9', borderRadius: '16px', border: '1.5px dashed var(--border-medium)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Users size={24} color="var(--saffron-900)" />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>No Members in Directory</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '360px', margin: '8px auto 18px', lineHeight: 1.5 }}>
            {isAdmin
              ? 'No members have been entered yet. Click "+ Add Member" to register your society flats.'
              : 'Society members have not been registered yet. Please log in as Admin (PIN: 1234) to add flats and members.'}
          </p>

          {isAdmin ? (
            <button
              id="btn-zero-add-member"
              className="submit-btn"
              onClick={onOpenAddMember}
              style={{ width: 'auto', padding: '10px 22px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={15} />
              <span>+ Add First Member</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="admin-badge-btn"
              style={{ background: 'var(--saffron-900)', color: '#FFF', padding: '8px 18px', margin: '0 auto' }}
            >
              Unlock Admin Portal (PIN: 1234)
            </button>
          )}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', background: '#F9FAFB', borderRadius: '12px' }}>
          No residents found matching "{search}".
        </div>
      ) : (
        <div className="contributor-list" id="member-directory-container">
          {filteredMembers.map((member) => (
            <div key={member.id} className="contributor-card" id={`member-row-${member.flat}`}>
              <div className="member-info">
                <div className="flat-badge" style={{ background: '#EFF6FF', color: 'var(--blue-600)', borderColor: '#BFDBFE' }}>
                  {member.flat}
                </div>
                <div>
                  <div className="member-name">{member.name}</div>
                  <div className="member-role" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600, color: member.role !== 'Member' ? 'var(--saffron-900)' : 'var(--text-muted)' }}>
                      {member.role}
                    </span>
                    {member.phone && (
                      <span style={{ color: 'var(--text-light)' }}>
                        • +91 {member.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {member.phone && (
                  <a
                    href={`https://wa.me/91${member.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-remind"
                    style={{ padding: '6px 10px', fontSize: '11.5px', textDecoration: 'none' }}
                    title={`Chat with ${member.name} on WhatsApp`}
                  >
                    <Phone size={12} />
                    <span>Chat</span>
                  </a>
                )}

                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => onOpenEditMember(member)}
                      style={{ background: 'none', border: 'none', color: 'var(--blue-600)', cursor: 'pointer', padding: '6px' }}
                      title={`Edit ${member.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${member.name} (Flat ${member.flat}) from society directory?`)) {
                          deleteMember(member.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '6px' }}
                      title={`Delete ${member.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
