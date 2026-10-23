import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { PlusCircle, X, Sparkles } from 'lucide-react';

export default function CreateEventModal({ isOpen, onClose }) {
  const { createNewEvent } = useMandal();

  const [title, setTitle] = useState('');
  const [dates, setDates] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('25000');
  const [targetPerMember, setTargetPerMember] = useState('700');
  const [icon, setIcon] = useState('🪔');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createNewEvent({
      title,
      dates,
      estimatedBudget: Number(estimatedBudget),
      targetPerMember: Number(targetPerMember),
      icon,
      notes
    });

    setTitle('');
    setDates('');
    setNotes('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--saffron-900)" />
            <span>Create New Society Event</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event / Festival Name</label>
            <input
              id="event-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Diwali Sneh Milan 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Dates / Duration</label>
              <input
                id="event-dates-input"
                type="text"
                className="form-input"
                placeholder="e.g. 01 Nov - 03 Nov 2026"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Festival Emoji</label>
              <select
                id="event-icon-select"
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
                id="event-budget-input"
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
                id="event-target-input"
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
            <label className="form-label">Event Description & Notes</label>
            <textarea
              id="event-notes-input"
              className="form-input"
              rows={2}
              placeholder="e.g. Community dinner, fireworks safety precautions, gift distribution..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button id="submit-create-event-btn" type="submit" className="submit-btn">
            Publish Event & Start Collections
          </button>
        </form>
      </div>
    </div>
  );
}
