import React, { useState } from 'react';
import { Bell, Mail, ShieldAlert, Sparkles, Save } from 'lucide-react';

export default function NotificationsSettingsTab({ onShowToast }) {
  const [notifications, setNotifications] = useState({
    emailSummary: true,
    highRiskAlerts: true,
    analysisComplete: true,
    aiAssistantUpdates: false,
    riskThreshold: 'high',
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onShowToast('Notification & Risk Alert preferences saved.');
  };

  return (
    <form onSubmit={handleSave} className="card-base p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
            Notification &amp; Risk Alert Settings
          </h3>
        </div>
        <span className="badge badge-ai text-[10px]">Real-Time Notifications</span>
      </div>

      <div className="space-y-4">
        {/* Email Digest */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-200 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Weekly Executive Digest</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive weekly email summary of repository risk trends.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.emailSummary}
            onChange={() => handleToggle('emailSummary')}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 shrink-0"
          />
        </label>

        {/* High Risk Anomaly Alerts */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-rose-200 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">High-Risk Anomaly Alerts</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Instant notification when a contract contains uncapped liability or critical flags.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.highRiskAlerts}
            onChange={() => handleToggle('highRiskAlerts')}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 shrink-0"
          />
        </label>

        {/* Analysis Completed */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-200 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Analysis Completion Signals</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Notify when document parsing and clause extraction finishes.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.analysisComplete}
            onChange={() => handleToggle('analysisComplete')}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 shrink-0"
          />
        </label>

        {/* AI Assistant Updates */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-200 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">AI Co-Pilot Model Enhancements</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Updates on new legal neural model rules and fallback playbooks.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.aiAssistantUpdates}
            onChange={() => handleToggle('aiAssistantUpdates')}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 shrink-0"
          />
        </label>
      </div>

      {/* Risk Alert Threshold Selector */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Risk Threshold Push Alerts</label>
        <select
          value={notifications.riskThreshold}
          onChange={(e) => setNotifications({ ...notifications, riskThreshold: e.target.value })}
          className="select-base text-xs"
        >
          <option value="high">Notify on High &amp; Critical Risk Only (Recommended)</option>
          <option value="critical">Notify on Critical Risk Only</option>
          <option value="all">Notify on All Risk Level Discoveries</option>
        </select>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button type="submit" className="btn btn-primary btn-md">
          <Save className="w-4 h-4" />
          <span>Save Notification Settings</span>
        </button>
      </div>
    </form>
  );
}
