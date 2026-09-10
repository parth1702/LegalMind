import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import AccountSettingsTab from '../components/settings/AccountSettingsTab';
import SecuritySettingsTab from '../components/settings/SecuritySettingsTab';
import AppearanceSettingsTab from '../components/settings/AppearanceSettingsTab';
import NotificationsSettingsTab from '../components/settings/NotificationsSettingsTab';
import PrivacyDataTab from '../components/settings/PrivacyDataTab';
import SettingsConfirmModal from '../components/settings/SettingsConfirmModal';
import {
  User,
  ShieldCheck,
  Moon,
  Bell,
  Database,
  CheckCircle2,
} from 'lucide-react';

import { triggerDataArchiveDownload } from '../utils/archiveUtils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'security' | 'appearance' | 'notifications' | 'privacy'
  const [toastMsg, setToastMsg] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'deleteAccount' });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenConfirmModal = (type) => {
    setModalState({ isOpen: true, type });
  };

  const handleCloseConfirmModal = () => {
    setModalState({ isOpen: false, type: 'deleteAccount' });
  };

  const handleConfirmAction = (type) => {
    if (type === 'deleteAccount') {
      showToast('Account deletion request initiated. Unrecoverable erase in progress...');
    } else if (type === 'revokeSessions') {
      showToast('All active user sessions revoked successfully.');
    } else if (type === 'exportData') {
      triggerDataArchiveDownload();
      showToast('Encrypted enterprise archive generated! File download saved to your PC.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 alert alert-info shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Settings & System Preferences"
        description="Manage your counsel profile, security credentials, appearance themes, and data privacy governance."
        badge={<StatusIndicator status="secure" label="Security Verified" />}
      />

      {/* Settings Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 bg-[#070b18] p-1.5 rounded-2xl border overflow-x-auto text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'account'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Account Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Sessions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Privacy & Data</span>
        </button>
      </div>

      {/* Active Tab Panel Render */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'account' && <AccountSettingsTab onShowToast={showToast} />}
        {activeTab === 'security' && (
          <SecuritySettingsTab
            onShowToast={showToast}
            onOpenConfirmModal={handleOpenConfirmModal}
          />
        )}
        {activeTab === 'appearance' && <AppearanceSettingsTab onShowToast={showToast} />}
        {activeTab === 'notifications' && <NotificationsSettingsTab onShowToast={showToast} />}
        {activeTab === 'privacy' && (
          <PrivacyDataTab
            onShowToast={showToast}
            onOpenConfirmModal={handleOpenConfirmModal}
          />
        )}
      </div>

      {/* Settings Action Confirmation Modal */}
      <SettingsConfirmModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
