import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import StatusIndicator from '../components/brand/StatusIndicator';
import {
  User,
  Mail,
  Building,
  Briefcase,
  ShieldCheck,
  Award,
  Calendar,
  Camera,
  Activity,
  FileText,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const mockProfileActivity = [
  { id: 'act-1', action: 'Reviewed Contract Risk Matrix', target: 'Commercial_Software_MSA_2026.pdf', time: '2 hours ago' },
  { id: 'act-2', action: 'Exported Executive Risk Summary', target: 'Enterprise_Vendor_NDA_v4.pdf', time: '1 day ago' },
  { id: 'act-3', action: 'Updated Fallback Playbook Rules', target: 'Section 14.2 Limitation of Liability', time: '3 days ago' },
  { id: 'act-4', action: 'Uploaded Batch Contracts', target: '3 Agreements Processed', time: '5 days ago' },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [toastMsg, setToastMsg] = useState(null);
  const fileInputRef = React.useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getInitials = (name) => {
    if (!name) return 'LM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      if (base64Data && updateProfile) {
        try {
          await updateProfile({ avatar: base64Data });
          showToast('Profile picture updated successfully!');
        } catch (err) {
          showToast(err.message || 'Failed to update profile picture.');
        }
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleRemoveAvatar = async (e) => {
    e.stopPropagation();
    if (updateProfile) {
      try {
        await updateProfile({ avatar: null });
        showToast('Profile picture removed.');
      } catch (err) {
        showToast('Failed to remove profile picture.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 alert alert-info shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Counsel Profile"
        description="Manage your counsel profile, enterprise license tier, and review activity history."
        badge={<StatusIndicator status="secure" label="API Session Active" />}
        actions={
          <Link to="/app/settings" className="btn btn-secondary btn-md">
            <span>Edit Account Settings</span>
          </Link>
        }
      />

      {/* Top Profile Summary Card */}
      <div className="card-elevated p-6 sm:p-8 bg-gradient-to-r from-[#0b1021] via-[#0e162e] to-[#0b1021] border-slate-800 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            <div
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-2xl font-mono shadow-glow cursor-pointer overflow-hidden relative group"
              title="Click to upload profile picture"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'Profile Avatar'}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{getInitials(user?.name)}</span>
              )}

              {/* Hover overlay prompt */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 text-[10px] font-mono gap-1">
                <Camera className="w-5 h-5" />
                <span>Upload</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-cyan-200 transition-colors shadow-lg"
              title="Change Profile Avatar"
            >
              <Camera className="w-4 h-4" />
            </button>

            {user?.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 p-1.5 rounded-xl bg-rose-950/90 border border-rose-700/80 text-rose-300 hover:text-white transition-colors shadow-lg"
                title="Remove Profile Avatar"
              >
                <Lock className="w-3 h-3 hidden" />
                <span className="text-[10px] font-bold px-1">✕</span>
              </button>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{user?.name || 'Legal Counsel'}</h1>
                <span className="badge badge-ai text-[10px] capitalize">{user?.role || 'Attorney'}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {user?.email || 'counsel@legalmind.ai'} • {user?.organization || 'LegalMind Enterprise'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span className="capitalize">{user?.role || 'Attorney'} Counsel</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user?.organization || 'LegalMind Enterprise'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Session'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Plan Details & Activity Feed */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Tier & Security Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* License Tier */}
          <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Enterprise License Tier
                </h3>
              </div>
              <span className="badge badge-low text-[10px]">Active</span>
            </div>

            <div className="space-y-2">
              <div className="text-lg font-bold text-slate-100 font-mono">Enterprise AI Plan</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes unlimited document vector parsing, 4-tier risk matrix extraction, and multi-user counsel seat access.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 space-y-1">
              <div className="flex justify-between">
                <span>Vector Capacity:</span>
                <span className="font-bold">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span>Model Intelligence:</span>
                <span className="font-bold">Legal AI</span>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="card-base p-6 border-slate-800 space-y-3 bg-[#0b1021]/90">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Security Readiness
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">2-Factor Authentication</span>
                <span className="badge badge-low text-[10px]">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">SAML 2.0 Single Sign-On</span>
                <span className="badge badge-low text-[10px]">Connected</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Zero LLM Data Retention</span>
                <span className="badge badge-ai text-[10px]">Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-7 card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Recent Counsel Activity Stream
              </h3>
            </div>
            <span className="badge badge-neutral text-[10px]">Audit Log</span>
          </div>

          <div className="space-y-3">
            {mockProfileActivity.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">{act.action}</span>
                    <span className="text-[11px] font-mono text-slate-400">{act.target}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
