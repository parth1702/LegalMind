import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

export default function VerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef([]);

  // Resend code countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    setErrorMsg('');

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of your verification code');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 1200);
    }, 1000);
  };

  const handleResend = () => {
    setResendTimer(45);
    setErrorMsg('');
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="card-elevated p-6 sm:p-8 space-y-6 bg-[#0b1021]/90 border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 mx-auto sm:mx-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
          Verify Your Email
        </h2>
        <p className="text-xs text-slate-400">
          Enter the 6-digit security code sent to your registered email address.
        </p>
      </div>

      {isVerified ? (
        <div className="space-y-4 text-center py-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100">Email Verified</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your security verification is complete. Redirecting to workspace...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          {errorMsg && (
            <p className="text-xs text-rose-400 font-mono text-center bg-rose-950/40 p-2 rounded border border-rose-900/40">
              {errorMsg}
            </p>
          )}

          {/* 6-Digit Code Input Group */}
          <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 sm:w-12 h-12 text-center text-lg font-bold font-mono bg-[#050814] border border-slate-800 text-cyan-300 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-md w-full justify-center shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <span>Complete Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Resend Code Section */}
      {!isVerified && (
        <div className="text-center pt-2 border-t border-slate-800/80">
          {resendTimer > 0 ? (
            <p className="text-xs font-mono text-slate-500">
              Resend code available in <span className="text-cyan-400 font-semibold">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Verification Code</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
