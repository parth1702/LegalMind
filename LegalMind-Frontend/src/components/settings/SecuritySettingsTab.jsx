import React, { useState } from 'react';
import { Lock, ShieldCheck, Laptop, Smartphone, Key, LogOut, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const mockSessions = [
  { id: 's1', device: 'Chrome on Windows 11', ip: '192.168.1.14', location: 'New York, USA', current: true, time: 'Active now' },
  { id: 's2', device: 'Safari on iPhone 15 Pro', ip: '172.56.21.9', location: 'New York, USA', current: false, time: '2 hours ago' },
];

const mockLoginActivity = [
  { id: 'a1', timestamp: '2026-08-04 10:14:02', device: 'Chrome / Windows', ip: '192.168.1.14', status: 'Success (2FA Verified)' },
  { id: 'a2', timestamp: '2026-08-03 14:22:50', device: 'Safari / iOS', ip: '172.56.21.9', status: 'Success (SAML SSO)' },
  { id: 'a3', timestamp: '2026-08-01 09:11:15', device: 'Chrome / macOS', ip: '198.51.100.42', status: 'Success (2FA Verified)' },
];

export default function SecuritySettingsTab({ onShowToast, onOpenConfirmModal }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.new || passwords.new !== passwords.confirm) {
      onShowToast('New passwords do not match or are empty.');
      return;
    }
    setPasswords({ current: '', new: '', confirm: '' });
    onShowToast('Security password updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <form onSubmit={handlePasswordSubmit} className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Change Security Password
            </h3>
          </div>
          <span className="badge badge-secure text-[10px]">256-bit Encrypted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••••••"
                className="input-base text-xs pr-9"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="••••••••••••"
                className="input-base text-xs pr-9"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="••••••••••••"
              className="input-base text-xs"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" className="btn btn-secondary btn-sm">
            Update Password
          </button>
        </div>
      </form>

      {/* Active Sessions Card */}
      <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Active Authorized Sessions
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onOpenConfirmModal('revokeSessions')}
            className="btn btn-ghost btn-sm text-rose-400 hover:bg-rose-950/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Revoke All Sessions</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {mockSessions.map((s) => (
            <div
              key={s.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                  {s.device.includes('iPhone') ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span>{s.device}</span>
                    {s.current && <span className="badge badge-low text-[9px]">Current Device</span>}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    IP: {s.ip} • Location: {s.location} • {s.time}
                  </div>
                </div>
              </div>

              {!s.current && (
                <button
                  type="button"
                  onClick={() => onShowToast(`Session on ${s.device} revoked.`)}
                  className="btn btn-ghost btn-sm text-slate-400 hover:text-rose-400"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity Stream */}
      <div className="card-base p-6 border-slate-800 space-y-3 bg-[#0b1021]/90">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
          Recent Security Audit Logs
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Device / Client</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {mockLoginActivity.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-2 px-3 text-slate-200">{log.device}</td>
                  <td className="py-2 px-3 text-slate-400">{log.ip}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
