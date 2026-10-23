import React from 'react';
import { useMandal } from '../context/MandalContext';
import { PlusCircle } from 'lucide-react';

export default function EventSelector({ onOpenCreateEvent }) {
  const { events, selectedEventId, setSelectedEventId, isAdmin } = useMandal();

  if (events.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <div className="event-strip" id="event-selector-strip">
      {events.map((evt) => {
        const isActive = evt.id === selectedEventId;
        return (
          <button
            key={evt.id}
            id={`event-pill-${evt.id}`}
            className={`event-pill ${isActive ? 'active' : ''}`}
            onClick={() => setSelectedEventId(evt.id)}
          >
            <span>{evt.icon || '🚩'}</span>
            <span>{(evt.title || '').split(' ')[0]}</span>
            <span className="event-pill-badge">{evt.badge || 'Festival'}</span>
          </button>
        );
      })}

      {isAdmin && (
        <button 
          id="btn-create-event-open"
          className="event-pill" 
          onClick={onOpenCreateEvent}
          style={{ borderStyle: 'dashed', borderColor: 'var(--saffron-900)', color: 'var(--saffron-900)' }}
        >
          <PlusCircle size={15} />
          <span>New Event</span>
        </button>
      )}
    </div>
  );
}
