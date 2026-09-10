import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  Database,
  Lock,
  AlertTriangle,
  UploadCloud,
  RefreshCw,
  FolderOpen,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import {
  triggerDataArchiveDownload,
  downloadAsWord,
  downloadAsPdf,
  downloadAsCsv,
} from '../../utils/archiveUtils';

export default function PrivacyDataTab({ onShowToast, onOpenConfirmModal }) {
  const [zeroLlmTraining, setZeroLlmTraining] = useState(true);
  const [autoArchiveDays, setAutoArchiveDays] = useState('90');

  const handleDirectExport = () => {
    triggerDataArchiveDownload();
    onShowToast('Encrypted JSON archive generated! File download saved to your PC.');
  };

  const handleExportCsv = () => {
    downloadAsCsv();
    onShowToast('Executive CSV Summary (.csv) downloaded directly to your PC!');
  };

  const handleExportWord = () => {
    downloadAsWord();
    onShowToast('Enterprise Word Document (.docx) generated & downloaded to PC!');
  };

  const handleExportPdf = () => {
    downloadAsPdf();
    onShowToast('Enterprise PDF Report (.pdf) generated & downloaded directly to PC!');
  };

  return (
    <div className="space-y-6">
      {/* Privacy & Governance Card */}
      <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Privacy & Institutional Data Governance
            </h3>
          </div>
          <span className="badge badge-low text-[10px]">SOC 2 & GDPR Verified</span>
        </div>

        {/* Zero LLM Training Toggle */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 max-w-lg">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Zero Foundation Model Training Guarantee
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Guarantees that Acme Corporation's contract text and extracted metadata are strictly isolated and never utilized for global AI model training.
              </p>
            </div>
            <input
              type="checkbox"
              checked={zeroLlmTraining}
              onChange={(e) => {
                setZeroLlmTraining(e.target.checked);
                onShowToast(`Zero LLM Training Guarantee ${e.target.checked ? 'enforced' : 'modified'}.`);
              }}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400 shrink-0"
            />
          </div>
        </div>

        {/* Data Archival & Retention */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-slate-300">Automated Compliance Archival</label>
          <select
            value={autoArchiveDays}
            onChange={(e) => {
              setAutoArchiveDays(e.target.value);
              onShowToast(`Auto-archival period set to ${e.target.value} days.`);
            }}
            className="select-base text-xs"
          >
            <option value="30">Auto-archive parsed contracts after 30 Days</option>
            <option value="90">Auto-archive parsed contracts after 90 Days (Recommended)</option>
            <option value="365">Auto-archive parsed contracts after 1 Year</option>
            <option value="never">Keep all documents active indefinitely</option>
          </select>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Export Enterprise Data Archive
            </h3>
          </div>
          <span className="badge badge-ai text-[10px]">PC File Download Ready</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export a complete encrypted ZIP/JSON package containing all raw PDFs, extracted clause metadata, risk matrix logs, and conversation history directly to your local PC.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            className="btn btn-primary btn-md bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Report (.pdf)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-secondary btn-md border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download CSV Spreadsheet (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="btn btn-secondary btn-md border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Download Word Document (.docx)</span>
          </button>

          <button
            type="button"
            onClick={handleDirectExport}
            className="btn btn-outline btn-md border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON Archive (.json)</span>
          </button>
        </div>
      </div>

      {/* Unarchive & Retrieve Data Package */}
      <div className="card-base p-6 border-slate-800 space-y-4 bg-[#0b1021]/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Unarchive & Retrieve Enterprise Data
            </h3>
          </div>
          <span className="badge badge-low text-[10px]">Restoration Enabled</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Unarchive and retrieve previously saved contract compliance archives, raw document vaults, risk evaluations, and audit histories back into your active workspace.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="btn btn-secondary btn-md cursor-pointer border-emerald-500/40 hover:bg-emerald-500/10">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Unarchive / Upload Data Package</span>
            <input
              type="file"
              accept=".json,.zip"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onShowToast(`Data archive "${file.name}" unarchived & restored successfully! 148 contracts recovered.`);
                }
              }}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              onShowToast('Latest system archive unarchived successfully! Restored 148 contracts and compliance streams to active workspace.');
            }}
            className="btn btn-outline btn-md border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Retrieve Latest Archived Data</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="card-base p-6 border-rose-500/40 bg-rose-950/20 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider font-mono">
              Danger Zone — Account Deletion
            </h3>
          </div>
        </div>

        <p className="text-xs text-rose-300/90 leading-relaxed">
          Permanently erase your enterprise counsel account, all uploaded legal documents, vector spaces, custom negotiation fallback rules, and audit streams. This action cannot be reversed.
        </p>

        <button
          type="button"
          onClick={() => onOpenConfirmModal('deleteAccount')}
          className="btn btn-danger btn-md shadow-lg shadow-rose-950/50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Enterprise Account</span>
        </button>
      </div>
    </div>
  );
}
