import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Building, Briefcase, Globe, Save, CheckCircle2, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountSettingsTab({ onShowToast }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || 'Acme Corporation',
    jobTitle: user?.role || 'Senior Corporate Legal Counsel',
    timezone: 'UTC-5 (Eastern Time - US & Canada)',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        organization: user.organization || prev.organization,
        jobTitle: user.role || prev.jobTitle,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onShowToast) onShowToast('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (onShowToast) onShowToast('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result;
      if (base64Data && updateProfile) {
        try {
          await updateProfile({ avatar: base64Data });
          if (onShowToast) onShowToast('Profile picture updated!');
        } catch (err) {
          if (onShowToast) onShowToast('Failed to update picture.');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (updateProfile) {
      try {
        await updateProfile({ avatar: null });
        if (onShowToast) onShowToast('Profile picture removed.');
      } catch (err) {
        if (onShowToast) onShowToast('Failed to remove picture.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (updateProfile) {
        await updateProfile({ name: formData.name, email: formData.email, organization: formData.organization });
      }
      onShowToast('Account profile details updated cleanly.');
    } catch (err) {
      onShowToast(err.message || 'Failed to update profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-base p-6 border-slate-800 space-y-6 bg-[#0b1021]/90">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          Account & Counsel Profile
        </h3>
        <span className="badge badge-ai text-[10px]">Enterprise Account</span>
      </div>

      {/* Avatar Management Row */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono overflow-hidden shrink-0 shadow-inner">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            getInitials(user?.name)
          )}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="text-xs font-bold text-slate-200">Profile Picture</div>
          <p className="text-[11px] text-slate-400">
            Upload a custom avatar (PNG, JPG or WEBP, max 5MB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>
          {user?.avatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="btn btn-danger btn-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-base pl-9 text-xs"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Work Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-base pl-9 text-xs"
            />
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Organization</label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="input-base pl-9 text-xs"
            />
          </div>
        </div>

        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Job Title / Role</label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="input-base pl-9 text-xs"
            />
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-xs font-medium text-slate-300">Timezone Preference</label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="select-base pl-9 text-xs"
            >
              <option value="UTC-5 (Eastern Time - US & Canada)">UTC-5 (Eastern Time - US & Canada)</option>
              <option value="UTC-8 (Pacific Time - US & Canada)">UTC-8 (Pacific Time - US & Canada)</option>
              <option value="UTC+0 (London - GMT)">UTC+0 (London - GMT)</option>
              <option value="UTC+5:30 (India Standard Time)">UTC+5:30 (India Standard Time)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button type="submit" className="btn btn-primary btn-md shadow-lg shadow-cyan-500/20">
          <Save className="w-4 h-4" />
          <span>Save Account Settings</span>
        </button>
      </div>
    </form>
  );
}
