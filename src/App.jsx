import React, { useState } from 'react';
import { MandalProvider, useMandal } from './context/MandalContext';
import Header from './components/Header';
import PwaBanner from './components/PwaBanner';
import SocietyDashboard from './components/SocietyDashboard';
import EventDetailView from './components/EventDetailView';
import MembersTab from './components/MembersTab';

// Modals
import AdminPinModal from './components/AdminPinModal';
import GetStartedWizardModal from './components/GetStartedWizardModal';
import EditSocietyModal from './components/EditSocietyModal';
import CreateEventModal from './components/CreateEventModal';
import EditEventModal from './components/EditEventModal';
import AddMemberModal from './components/AddMemberModal';
import EditMemberModal from './components/EditMemberModal';
import AddExpenseModal from './components/AddExpenseModal';
import EditExpenseModal from './components/EditExpenseModal';
import MarkPaidModal from './components/MarkPaidModal';
import ExportModal from './components/ExportModal';

import { MessageSquare, FileDown } from 'lucide-react';

function MandalAppContent() {
  const { 
    currentView, 
    setCurrentView,
    selectedEvent, 
    setSelectedEventId,
    isAdmin 
  } = useMandal();

  // Modals state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [isSocietySettingsOpen, setIsSocietySettingsOpen] = useState(false);
  
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [memberToMarkPaid, setMemberToMarkPaid] = useState(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportInitialTab, setExportInitialTab] = useState('whatsapp');

  // Modal Triggers
  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setCurrentView('event');
  };

  const handleOpenEditEvent = (evt) => {
    setEventToEdit(evt);
    setIsEditEventOpen(true);
  };

  const handleOpenEditMember = (member) => {
    setMemberToEdit(member);
    setIsEditMemberOpen(true);
  };

  const handleOpenEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsEditExpenseOpen(true);
  };

  const handleOpenMarkPaid = (member) => {
    setMemberToMarkPaid(member);
    setIsMarkPaidOpen(true);
  };

  const handleOpenExport = (tab) => {
    setExportInitialTab(tab);
    setIsExportOpen(true);
  };

  return (
    <div className="app-container" id="shakti-mandal-app">
      {/* 1. Header with Title, Corpus & View Switcher */}
      <Header
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenSocietySettings={() => setIsSocietySettingsOpen(true)}
      />

      {/* 2. PWA Add to Home Screen Banner */}
      <PwaBanner />

      {/* 3. Main Dynamic Content Area */}
      <main className="content-area">
        {currentView === 'dashboard' ? (
          <SocietyDashboard
            onOpenCreateEvent={() => setIsCreateEventOpen(true)}
            onOpenEditEvent={handleOpenEditEvent}
            onOpenGetStarted={() => setIsGetStartedOpen(true)}
            onOpenSocietySettings={() => setIsSocietySettingsOpen(true)}
            onSelectEvent={handleSelectEvent}
          />
        ) : currentView === 'event' ? (
          <EventDetailView
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenEditEvent={handleOpenEditEvent}
            onOpenMarkPaid={handleOpenMarkPaid}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenEditExpense={handleOpenEditExpense}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenExport={handleOpenExport}
          />
        ) : currentView === 'members' ? (
          <MembersTab
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onOpenEditMember={handleOpenEditMember}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />
        ) : null}

        {/* Production Footer */}
        <footer style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '30px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
            🚩 Community Society Festival & Treasury Management
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginTop: '4px' }}>
            Built for Complete Transparency & Audited Financial Records
          </div>
        </footer>
      </main>

      {/* 4. Bottom Sticky Quick Action Bar (when an event is active or on dashboard) */}
      <div className="bottom-action-bar" id="sticky-bottom-actions">
        <button
          id="btn-whatsapp-share"
          className="action-btn btn-whatsapp-broadcast"
          onClick={() => handleOpenExport('whatsapp')}
          title="Generate clean summary for WhatsApp society group"
        >
          <MessageSquare size={16} />
          <span>WhatsApp Update</span>
        </button>

        <button
          id="btn-export-pdf"
          className="action-btn btn-pdf-export"
          onClick={() => handleOpenExport('pdf')}
          title="Generate Official PDF Balance Sheet"
        >
          <FileDown size={16} />
          <span>Official PDF</span>
        </button>
      </div>

      {/* Modals */}
      <AdminPinModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <GetStartedWizardModal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
      />

      <EditSocietyModal
        isOpen={isSocietySettingsOpen}
        onClose={() => setIsSocietySettingsOpen(false)}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
      />

      <EditEventModal
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
        event={eventToEdit}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />

      <EditMemberModal
        isOpen={isEditMemberOpen}
        onClose={() => setIsEditMemberOpen(false)}
        member={memberToEdit}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <EditExpenseModal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        expense={expenseToEdit}
        eventId={selectedEvent?.id}
      />

      <MarkPaidModal
        isOpen={isMarkPaidOpen}
        onClose={() => setIsMarkPaidOpen(false)}
        member={memberToMarkPaid}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        initialTab={exportInitialTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <MandalProvider>
      <MandalAppContent />
    </MandalProvider>
  );
}
