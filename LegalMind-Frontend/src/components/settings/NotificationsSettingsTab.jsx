import React, { useState } from 'react';
import { Bell, Mail, ShieldAlert, Sparkles, Save } from 'lucide-react';

export default function NotificationsSettingsTab({ onShowToast }) {
  const [notifications, setNotifications] = useState({
    emailSummary: true,
    highRiskAlerts: true,
    analysisComplete: true,
    aiAssistantUpdates: false,
    riskThreshold: 'high', // 'all' | 'high' | 'critical'
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onShowToast('Notification & Risk Alert preferences saved.');
  };

  return (
    <form onSubmit={handleSave} className="card-base p-6 border-slate-800 space-y-6 bg-[#0b1021]/90">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Notification & Risk Alert Settings
          </h3>
        </div>
        <span className="badge badge-ai text-[10px]">Real-Time Notifications</span>
      </div>

      <div className="space-y-4">
        {/* Email Digest */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">Weekly Executive Digest</span>
              <span className="text-[11px] text-slate-400">Receive weekly email summary of repository risk trends.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.emailSummary}
            onChange={() => handleToggle('emailSummary')}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
          />
        </label>

        {/* High Risk Anomaly Alerts */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">High-Risk Anomaly Alerts</span>
              <span className="text-[11px] text-slate-400">Instant notification when a contract contains uncapped liability or critical flags.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.highRiskAlerts}
            onChange={() => handleToggle('highRiskAlerts')}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
          />
        </label>

        {/* Analysis Completed */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">Analysis Completion Signals</span>
              <span className="text-[11px] text-slate-400">Notify when document parsing and clause extraction finishes.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.analysisComplete}
            onChange={() => handleToggle('analysisComplete')}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
          />
        </label>

        {/* AI Assistant Updates */}
        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">AI Co-Pilot Model Enhancements</span>
              <span className="text-[11px] text-slate-400">Updates on new legal neural model rules and fallback playbooks.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifications.aiAssistantUpdates}
            onChange={() => handleToggle('aiAssistantUpdates')}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
          />
        </label>
      </div>

      {/* Risk Alert Threshold Selector */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="block text-xs font-medium text-slate-300">Risk Threshold Push Alerts</label>
        <select
          value={notifications.riskThreshold}
          onChange={(e) => setNotifications({ ...notifications, riskThreshold: e.target.value })}
          className="select-base text-xs"
        >
          <option value="high">Notify on High & Critical Risk Only (Recommended)</option>
          <option value="critical">Notify on Critical Risk Only</option>
          <option value="all">Notify on All Risk Level Discoveries</option>
        </select>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button type="submit" className="btn btn-primary btn-md shadow-lg shadow-cyan-500/20">
          <Save className="w-4 h-4" />
          <span>Save Notification Settings</span>
        </button>
      </div>
    </form>
  );
}
