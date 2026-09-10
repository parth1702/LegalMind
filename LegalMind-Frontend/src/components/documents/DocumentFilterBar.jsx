import React from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Star,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  documentTypesList,
  documentStatusesList,
  riskLevelsList,
} from '../../data/documentsMockData';

export default function DocumentFilterBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  riskFilter,
  onRiskChange,
  sortBy,
  onSortChange,
  showFavoritesOnly,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResultsCount,
}) {
  return (
    <div className="card-base p-4 space-y-4 border-slate-800 bg-[#070b18]">
      {/* Top Search & Primary Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by document title, author, or metadata..."
            className="input-base pl-9 text-xs py-2.5"
          />
        </div>

        {/* View Toggle & Favorites Toggles */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={onToggleFavorites}
            className={`btn btn-sm ${
              showFavoritesOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'btn-secondary text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
              aria-label="Switch to list view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-1 border-t border-slate-800/80">
        {/* 1. Document Type Filter */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
            Document Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="select-base text-xs py-1.5"
          >
            {documentTypesList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Status Filter */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="select-base text-xs py-1.5"
          >
            {documentStatusesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Risk Filter */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
            Risk Tier
          </label>
          <select
            value={riskFilter}
            onChange={(e) => onRiskChange(e.target.value)}
            className="select-base text-xs py-1.5"
          >
            {riskLevelsList.map((r) => (
              <option key={r} value={r}>
                {r === 'All Risks' ? r : `${r.charAt(0).toUpperCase() + r.slice(1)} Risk`}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Sort Order */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="select-base text-xs py-1.5"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_risk">Highest Risk</option>
            <option value="name_asc">Filename A–Z</option>
          </select>
        </div>

        {/* 5. Reset Action */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
          <button
            type="button"
            onClick={onResetFilters}
            className="btn btn-secondary btn-sm w-full justify-center text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
        <span>Showing {totalResultsCount} documents</span>
        <span className="flex items-center gap-1 text-[11px]">
          <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Active Filters Applied
        </span>
      </div>
    </div>
  );
}
