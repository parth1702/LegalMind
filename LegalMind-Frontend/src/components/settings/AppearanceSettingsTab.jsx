import React from 'react';
import { Moon, Sun, Monitor, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AppearanceSettingsTab({ onShowToast }) {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
  } = useTheme();

  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme);
    onShowToast(`Appearance theme updated to ${newTheme.toUpperCase()}.`);
  };

  return (
    <div className="card-base p-6 border-slate-800 space-y-6 bg-[#0b1021]/90">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
          Appearance & Workspace Theme
        </h3>
        <span className="badge badge-ai text-[10px]">Dark-First Visual System</span>
      </div>

      {/* Active Theme Mode Banner */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">Theme Mode</label>
        <div className="p-4 rounded-xl border-2 border-cyan-400 bg-slate-900 shadow-glow space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-slate-950 text-cyan-400 border border-slate-800 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              <span className="text-xs font-bold text-slate-100">Dark Mode (Default & Active)</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            High-contrast cyan & indigo legal console tailored for document analysis, clause extraction, and reduced eye strain.
          </p>
        </div>
      </div>

      {/* Font & Contrast Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">Document Reader Density</label>
          <select
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value);
              onShowToast(`Document text scale updated to ${e.target.value}.`);
            }}
            className="select-base text-xs"
          >
            <option value="compact">Compact (Tight Spacing)</option>
            <option value="normal">Normal (Standard Counsel View)</option>
            <option value="large">Large (High Readability)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">Accessibility Contrast</label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer select-none">
            <span className="text-xs text-slate-300">High Contrast Risk Badges</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => {
                setHighContrast(e.target.checked);
                onShowToast(`High contrast badges ${e.target.checked ? 'enabled' : 'disabled'}.`);
              }}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
