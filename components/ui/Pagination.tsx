import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange, 
  onPageSizeChange 
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-auto border-t border-slate-800 text-sm">
      <div className="text-slate-500">
        {t('pagination.showing')} <span className="font-medium text-slate-200">{startItem}</span> {t('pagination.to')} <span className="font-medium text-slate-200">{endItem}</span> {t('pagination.of')} <span className="font-medium text-slate-200">{totalItems}</span> {t('pagination.results')}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <select 
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
              value={pageSize}
              onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1); // Reset to page 1 on size change
              }}
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
            </select>
            <span className="text-slate-500 text-xs">{t('pagination.per_page')}</span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-1 px-2">
             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 // Simple logic to show a window of pages around current
                 let p = i + 1;
                 if (totalPages > 5) {
                    if (currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) p = totalPages - 4 + i;
                 }
                 return (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === p ? 'bg-cyan-600 text-white' : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        {p}
                    </button>
                 );
             })}
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};