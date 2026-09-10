import React from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrengthMeter({ password = '' }) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  const strengthConfig = [
    { label: 'Too Weak', color: 'bg-rose-500', text: 'text-rose-400', width: 'w-1/4' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400', width: 'w-2/4' },
    { label: 'Good', color: 'bg-cyan-500', text: 'text-cyan-300', width: 'w-3/4' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400', width: 'w-full' },
  ];

  const currentStrength = score > 0 ? strengthConfig[score - 1] : { label: 'Empty', color: 'bg-slate-800', text: 'text-slate-500', width: 'w-0' };

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 animate-in fade-in duration-150">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono">Password Strength</span>
        <span className={`font-mono font-semibold ${currentStrength.text}`}>{currentStrength.label}</span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${currentStrength.color} ${currentStrength.width}`} />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {item.met ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-slate-600 shrink-0" />
            )}
            <span className={item.met ? 'text-slate-300' : 'text-slate-500'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
