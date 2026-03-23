'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex items-center bg-theme-50/50 p-1 rounded-2xl border border-theme-100">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-xl transition-all ${
          viewMode === 'grid'
            ? 'bg-white text-theme-600 shadow-sm'
            : 'text-theme-300 hover:text-theme-400'
        }`}
        title="Grid View"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-xl transition-all ${
          viewMode === 'list'
            ? 'bg-white text-theme-600 shadow-sm'
            : 'text-theme-300 hover:text-theme-400'
        }`}
        title="List View"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewToggle;
