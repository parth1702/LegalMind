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
    <div className="card-base p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
          Appearance & Workspace Theme
        </h3>
        <span className="badge badge-ai text-[10px]">Light-First Visual System</span>
      </div>

      {/* Theme Mode Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Theme Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Mode Option (Default/Recommended) */}
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-white text-slate-900 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Sun className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-900">Light Mode (Clean White & Blue)</span>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clean white & blue SaaS theme for high-contrast reading, corporate presentation, and minimal visual noise.
            </p>
          </button>

          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-blue-500 bg-slate-900 text-slate-100 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sky-400">
                <Moon className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</span>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sleek dark slate workspace optimized for late-night contract analysis and reduced eye strain.
            </p>
          </button>
        </div>
      </div>

      {/* Font & Contrast Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Document Reader Density</label>
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
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Accessibility Contrast</label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer select-none">
            <span className="text-xs text-slate-700 dark:text-slate-300">High Contrast Risk Badges</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => {
                setHighContrast(e.target.checked);
                onShowToast(`High contrast badges ${e.target.checked ? 'enabled' : 'disabled'}.`);
              }}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
