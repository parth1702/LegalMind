import React from 'react';
import { FileText, UploadCloud, SearchX, RotateCcw } from 'lucide-react';

export default function DocumentEmptyState({
  isFiltered = false,
  onResetFilters,
  onUploadClick,
}) {
  if (isFiltered) {
    return (
      <div className="card-base p-8 text-center py-16 space-y-4 border-slate-800 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <SearchX className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-100">No Matching Legal Documents Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No agreements match your current search query or applied filter parameters. Try adjusting your document type, risk, or status selections.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="btn btn-secondary btn-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="card-base p-8 text-center py-16 space-y-4 border-slate-800 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
        <FileText className="w-8 h-8" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-100">No Legal Documents in Repository</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your organization's document store is empty. Upload commercial contracts, NDAs, or SLAs to extract key clauses and flag risk anomalies automatically.
        </p>
      </div>
      <button
        type="button"
        onClick={onUploadClick}
        className="btn btn-primary btn-md shadow-lg shadow-cyan-500/20"
      >
        <UploadCloud className="w-4 h-4" />
        <span>Upload Document Now</span>
      </button>
    </div>
  );
}
