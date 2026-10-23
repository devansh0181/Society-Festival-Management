import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { Edit3, X, Trash2 } from 'lucide-react';

export default function EditEventModal({ isOpen, onClose, event }) {
  const { updateEvent, deleteEvent } = useMandal();

  const [title, setTitle] = useState('');
  const [dates, setDates] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('25000');
  const [targetPerMember, setTargetPerMember] = useState('1000');
  const [icon, setIcon] = useState('🚩');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDates(event.dates || '');
      setEstimatedBudget(String(event.estimatedBudget || ''));
      setTargetPerMember(String(event.targetPerMember || ''));
      setIcon(event.icon || '🚩');
      setStatus(event.status || 'active');
      setNotes(event.notes || '');
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateEvent(event.id, {
      title: title.trim(),
      dates: dates.trim(),
      estimatedBudget: Number(estimatedBudget),
      targetPerMember: Number(targetPerMember),
      icon,
      status,
      notes: notes.trim()
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete festival event "${event.title}" and all its logs?`)) {
      deleteEvent(event.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={20} color="var(--saffron-900)" />
            <span>Edit Festival Event</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event / Festival Name</label>
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
              <label className="form-label">Dates / Duration</label>
              <input
                type="text"
                className="form-input"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Festival Emoji</label>
              <select
                className="form-select"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              >
                <option value="🚩">🚩 Saffron Flag</option>
                <option value="🪔">🪔 Diya / Deepawali</option>
                <option value="🪘">🪘 Dhol / Garba</option>
                <option value="🪈">🪈 Bansuri / Krishna</option>
                <option value="🇮🇳">🇮🇳 National Festival</option>
                <option value="🎉">🎉 Community Celebration</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Estimated Budget (₹)</label>
              <input
                type="number"
                className="form-input"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                required
                min={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target per Flat (₹)</label>
              <input
                type="number"
                className="form-input"
                value={targetPerMember}
                onChange={(e) => setTargetPerMember(e.target.value)}
                required
                min={10}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Event Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active (Collecting Funds)</option>
              <option value="completed">Completed (Archived / Closed)</option>
              <option value="upcoming">Upcoming</option>
            </select>
            {status === 'completed' && (
              <div style={{ fontSize: '11px', color: 'var(--green-600)', marginTop: '5px', fontWeight: 600 }}>
                💡 Setting to Completed will deposit leftover event surplus directly into the Society Main Treasury.
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Event Notes (Optional)</label>
            <textarea
              className="form-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
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
              title="Delete Event"
            >
              <Trash2 size={15} />
            </button>

            <button type="submit" className="submit-btn" style={{ flex: 1 }}>
              Save Event Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
