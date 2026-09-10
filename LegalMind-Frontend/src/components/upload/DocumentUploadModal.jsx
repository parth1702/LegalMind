import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { X, UploadCloud, CheckCircle2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import DropzoneArea from './DropzoneArea';
import UploadQueueList from './UploadQueueList';
import { uploadDocumentApi } from '../../services/documentService';

const STAGE_SEQUENCE = [
  { stage: 'uploading', progress: 15 },
  { stage: 'reading', progress: 35 },
  { stage: 'extracting', progress: 60 },
  { stage: 'analyzing', progress: 80 },
  { stage: 'insights', progress: 95 },
  { stage: 'complete', progress: 100 },
];

export default function DocumentUploadModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState([]);
  const [simulateFailNext, setSimulateFailNext] = useState(false);

  if (!isOpen) return null;

  const handleFilesSelected = async (newFiles) => {
    for (const file of newFiles) {
      const tempId = 'upload-' + Math.random().toString(36).substr(2, 9);
      const queueItem = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop().toUpperCase(),
        stage: 'uploading',
        progress: 30,
        status: 'processing',
      };

      setQueue((prev) => [...prev, queueItem]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);

        const res = await uploadDocumentApi(formData);

        if (res.success) {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === tempId
                ? { ...item, stage: 'complete', progress: 100, status: 'completed' }
                : item
            )
          );
          queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
      } catch (err) {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? {
                  ...item,
                  status: 'failed',
                  errorMessage: err.message || 'File upload failed',
                }
              : item
          )
        );
      }
    }
  };

  const handleCancelItem = (id) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'cancelled', stage: 'uploading', progress: 0 } : item))
    );
  };

  const handleRetryItem = (id) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'processing', stage: 'uploading', progress: 15 } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCompleted = () => {
    setQueue((prev) => prev.filter((item) => item.status !== 'completed'));
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;

  return (
    <div className="modal-backdrop animate-in fade-in duration-150">
      <div
        className="bg-[#0b1021] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Document Upload Console"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                AI Document Upload Console
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Supports PDF, DOCX, TXT • Max 25MB Per File
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone Area */}
        <DropzoneArea onFilesSelected={handleFilesSelected} />

        {/* Test Simulation Controls Bar */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-slate-400">Simulation Controls:</span>
          <button
            type="button"
            onClick={() => setSimulateFailNext(true)}
            className={`btn btn-sm ${
              simulateFailNext
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'btn-secondary text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{simulateFailNext ? 'Next Upload Will Fail' : 'Simulate Network Error'}</span>
          </button>
        </div>

        {/* Upload Queue List */}
        <UploadQueueList
          queue={queue}
          onCancel={handleCancelItem}
          onRetry={handleRetryItem}
          onRemove={handleRemoveItem}
        />

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Hardware Encrypted Upload</span>
          </div>

          <div className="flex items-center gap-3">
            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleClearCompleted}
                className="btn btn-secondary btn-sm text-slate-400"
              >
                Clear Completed ({completedCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                if (completedCount > 0) {
                  navigate('/app/documents');
                }
              }}
              className="btn btn-primary btn-sm"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
