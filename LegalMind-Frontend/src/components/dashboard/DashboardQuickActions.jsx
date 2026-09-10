import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  ShieldAlert,
  Download,
  MessageSquareCode,
  FileText,
  FileSpreadsheet,
  Table,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  downloadAsPdf,
  downloadAsCsv,
  downloadAsWord,
  triggerDataArchiveDownload,
} from '../../utils/archiveUtils';

export default function DashboardQuickActions({ onUploadClick }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportPdf = () => {
    downloadAsPdf();
    setIsExportModalOpen(false);
    showToast('Executive PDF Report (.pdf) downloaded directly to your PC!');
  };

  const handleExportCsv = () => {
    downloadAsCsv();
    setIsExportModalOpen(false);
    showToast('Executive CSV Summary (.csv) downloaded directly to your PC!');
  };

  const handleExportWord = () => {
    downloadAsWord();
    setIsExportModalOpen(false);
    showToast('Executive Word Document (.docx) downloaded directly to your PC!');
  };

  const handleExportJson = () => {
    triggerDataArchiveDownload();
    setIsExportModalOpen(false);
    showToast('Full Enterprise JSON Archive (.json) downloaded directly to your PC!');
  };

  return (
    <div className="card-base p-4 border-slate-800 bg-[#070b18] space-y-3">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] alert alert-info shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
        Counsel Quick Actions
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onUploadClick}
          className="btn btn-secondary btn-sm justify-start hover:border-cyan-500/40 hover:text-cyan-300"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload Document</span>
        </button>

        <Link
          to="/app/analysis"
          className="btn btn-secondary btn-sm justify-start hover:border-rose-500/40 hover:text-rose-300"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Batch Risk Audit</span>
        </Link>

        <Link
          to="/app/assistant"
          className="btn btn-secondary btn-sm justify-start hover:border-indigo-500/40 hover:text-indigo-300"
        >
          <MessageSquareCode className="w-4 h-4 text-indigo-400" />
          <span>AI Legal Co-Pilot</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="btn btn-secondary btn-sm justify-start hover:border-emerald-500/40 hover:text-emerald-300"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* High-Visibility Export Summary Modal using React Portal */}
      {isExportModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#0b1021] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Export Executive Risk Summary</h3>
                    <p className="text-[11px] font-mono text-slate-400">Direct PC File Download</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Select your preferred report format. The generated file will download directly to your PC downloads folder without print popups.
              </p>

              <div className="space-y-2.5 pt-1">
                {/* PDF Option */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-rose-300">Download PDF Report (.pdf)</div>
                      <div className="text-[11px] text-slate-400">Executive PDF document format for compliance review</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-rose-400 shrink-0" />
                </button>

                {/* CSV Option */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Table className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">Download CSV Spreadsheet (.csv)</div>
                      <div className="text-[11px] text-slate-400">Raw audit matrix spreadsheet compatible with Excel</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>

                {/* Word Option */}
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">Download Word Document (.docx)</div>
                      <div className="text-[11px] text-slate-400">Editable Microsoft Word report template</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                </button>

                {/* JSON Option */}
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">Export JSON Data Archive (.json)</div>
                      <div className="text-[11px] text-slate-400">Complete encrypted JSON backup for data retrieval</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
