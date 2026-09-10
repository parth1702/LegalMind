import React from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
} from 'lucide-react';

export default function AnalysisToolbar({
  documentTitle,
  currentPage,
  totalPages,
  onPageChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  searchQuery,
  onSearchChange,
  leftPanelOpen,
  onToggleLeftPanel,
  rightPanelOpen,
  onToggleRightPanel,
  onExport,
}) {
  return (
    <div className="bg-[#070b18] border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left Group: Panel Toggles & Title */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleLeftPanel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:block"
          title={leftPanelOpen ? 'Hide Document Outline' : 'Show Document Outline'}
          aria-label="Toggle left panel"
        >
          {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="font-bold text-slate-100 font-mono truncate max-w-[180px] sm:max-w-[280px]">
          {documentTitle}
        </div>
      </div>

      {/* Center Group: Page Navigation & Zoom Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Page Nav */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-slate-300 px-1">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
          <button
            type="button"
            onClick={onZoomOut}
            disabled={zoomLevel <= 75}
            className="p-1 rounded text-slate-400 hover:text-slate-100 disabled:opacity-30"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono text-cyan-400 px-1 font-semibold w-11 text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={onZoomIn}
            disabled={zoomLevel >= 175}
            className="p-1 rounded text-slate-400 hover:text-slate-100 disabled:opacity-30"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onResetZoom}
            className="p-1 rounded text-slate-500 hover:text-slate-200"
            title="Reset Zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right Group: Document Search & Export */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search text..."
            className="input-base pl-8 py-1.5 text-[11px] w-36 lg:w-48"
          />
        </div>

        <button
          type="button"
          onClick={onExport}
          className="btn btn-secondary btn-sm text-cyan-400 hover:text-cyan-300"
          title="Export Analysis Report"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Export Audit</span>
        </button>

        <button
          type="button"
          onClick={onToggleRightPanel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden sm:block"
          title={rightPanelOpen ? 'Hide AI Insights' : 'Show AI Insights'}
          aria-label="Toggle right panel"
        >
          {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
