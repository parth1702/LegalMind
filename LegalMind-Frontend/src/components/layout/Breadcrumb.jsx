import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
  app: 'Application',
  dashboard: 'Dashboard',
  documents: 'Document Repository',
  analysis: 'AI Risk Analysis',
  assistant: 'AI Assistant',
  activity: 'Audit Activity',
  profile: 'User Profile',
  settings: 'System Settings',
};

export default function Breadcrumb({ className = '' }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb navigation" className={`flex items-center text-xs font-medium ${className}`}>
      <ol className="flex items-center space-x-1.5 text-slate-400">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1"
            title="Back to Home"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>LegalMind</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          if (value === 'app' && index === 0) return null;

          return (
            <li key={to} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              {isLast ? (
                <span className="text-slate-100 font-semibold px-1" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded px-1"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
