import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, ShieldCheck } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export default function DropzoneArea({ onFilesSelected }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const validateAndProcessFiles = (files) => {
    setErrorMessage('');
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push(`"${file.name}" is an unsupported format. Please upload PDF, DOCX, or TXT.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds the maximum 25MB file size limit.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-3">
      {/* Validation Error Notice */}
      {errorMessage && (
        <div className="alert alert-error animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none
          flex flex-col items-center justify-center space-y-4
          ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/10 shadow-glow'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900/60'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1 max-w-sm">
          <h3 className="text-base font-bold text-slate-100">
            Drag & drop legal documents here
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            or <span className="text-cyan-400 font-semibold underline">browse files</span> from your computer. Supports batch uploading.
          </p>
        </div>

        {/* Accepted formats badge list */}
        <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            PDF (.pdf)
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Word (.docx)
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Text (.txt)
          </span>
          <span>• Max 25MB</span>
        </div>
      </div>
    </div>
  );
}
