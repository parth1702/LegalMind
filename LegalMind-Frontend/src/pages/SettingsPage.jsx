import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

import { triggerDataArchiveDownload } from '../utils/archiveUtils';

const SETTINGS_TABS = [
  { id: 'account', label: 'Account Profile', icon: User },
  { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Data', icon: Database },
];

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const validTabs = ['account', 'security', 'appearance', 'notifications', 'privacy'];
  const activeTab = urlTab && validTabs.includes(urlTab) ? urlTab : 'account';

  const setActiveTab = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const [toastMsg, setToastMsg] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'deleteAccount' });
  const [isFeatureBundleOpen, setIsFeatureBundleOpen] = useState(false);

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

      {/* Settings Navigation Tabs Container & Light Green 3-Line Menu Bundle */}
      <div className="relative border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b18] p-2 rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          {/* Active Tab Badge Indicator (Horizontal Tab Bar Removed as requested) */}
          <div className="flex items-center gap-2 text-xs font-mono px-2 py-1">
            {(() => {
              const currentTabObj = SETTINGS_TABS.find((t) => t.id === activeTab) || SETTINGS_TABS[0];
              const CurrentIcon = currentTabObj.icon;
              return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-cyan-400 font-bold">
                  <CurrentIcon className="w-4 h-4" />
                  <span>{currentTabObj.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Right-Side Light Green 3-Line Menu Button with Glow & Effect */}
          <button
            type="button"
            onClick={() => setIsFeatureBundleOpen(!isFeatureBundleOpen)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300 shrink-0
              border shadow-lg relative z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
              ${
                isFeatureBundleOpen
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-105'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95'
              }
            `}
            title={isFeatureBundleOpen ? "Collapse 5 Features Menu" : "Expand 5 Features Menu"}
          >
            {isFeatureBundleOpen ? (
              <>
                <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3] animate-pulse" />
                <span className="hidden sm:inline">Close</span>
              </>
            ) : (
              <>
                <div className="flex flex-col justify-between w-4 h-3.5 py-0.5">
                  <span className="w-full h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="w-full h-0.5 bg-emerald-400 dark:bg-emerald-300 rounded-full"></span>
                  <span className="w-full h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                </div>
                <span className="hidden sm:inline">5 Features</span>
                <ChevronLeft className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-bounce-x" />
              </>
            )}
          </button>
        </div>

        {/* Animated Right-to-Left Slide Drawer for 5 Feature Bundle */}
        {isFeatureBundleOpen && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 ease-out">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>5 Bundled Feature Shortcuts</span>
              </span>
              <button
                type="button"
                onClick={() => setIsFeatureBundleOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Close Panel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
              {SETTINGS_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={`bundle-${tab.id}`}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsFeatureBundleOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 group ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-emerald-500/60 text-slate-900 dark:text-slate-100 font-bold shadow-md shadow-emerald-500/10'
                        : 'bg-white dark:bg-[#0a0f24] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-emerald-500'}`}>
                        <TabIcon className="w-4 h-4" />
                      </div>
                      {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                    </div>
                    <span className="text-xs truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
