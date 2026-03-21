import { ChevronRight, X, PanelLeft, LayoutGrid } from 'lucide-react';
import type { Component } from '../../services/componentApi';
import { CATEGORIES } from './constants';

function getFilteredForCategory(components: Component[], cat: string) {
  return components.filter((c) => c.category === cat);
}

export interface ComponentLibrarySidebarProps {
  mobileSidebarOpen: boolean;
  onMobileSidebarOpenChange: (open: boolean) => void;
  sidebarExpanded: boolean;
  onSidebarExpandedChange: (expanded: boolean) => void;
  collapsedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  allComponents: Component[];
  selectedId: string | undefined;
  onSelectComponent: (id: string) => void;
  isLandingActive: boolean;
  onGoToLanding: () => void;
}

export function ComponentLibrarySidebar({
  mobileSidebarOpen,
  onMobileSidebarOpenChange,
  sidebarExpanded,
  onSidebarExpandedChange,
  collapsedCategories,
  onToggleCategory,
  allComponents,
  selectedId,
  onSelectComponent,
  isLandingActive,
  onGoToLanding,
}: ComponentLibrarySidebarProps) {
  return (
    <aside className={`
      fixed lg:static top-14 bottom-0 left-0 z-50 lg:z-auto
      flex flex-col bg-white border-r border-slate-200/80
      transition-all duration-200 ease-in-out flex-shrink-0
      ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${sidebarExpanded ? 'w-[220px]' : 'w-11'}
    `}>
      <button type="button" onClick={() => onSidebarExpandedChange(!sidebarExpanded)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all z-20 hidden lg:flex">
        <PanelLeft className={`w-3 h-3 text-slate-500 transition-transform ${sidebarExpanded ? '' : 'rotate-180'}`} />
      </button>

      {mobileSidebarOpen && (
        <button type="button" onClick={() => onMobileSidebarOpenChange(false)}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 lg:hidden">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      )}

      {/* Browse all — return to landing */}
      <div className="px-1 pt-2 pb-1 border-b border-slate-100 flex-shrink-0">
        <button
          type="button"
          onClick={onGoToLanding}
          aria-label="Browse all components"
          aria-current={isLandingActive ? 'page' : undefined}
          title={!sidebarExpanded ? 'Browse all' : undefined}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors ${
            isLandingActive
              ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200/80'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          } ${!sidebarExpanded ? 'justify-center' : ''}`}
        >
          <LayoutGrid className={`w-3.5 h-3.5 flex-shrink-0 ${isLandingActive ? 'text-indigo-600' : 'text-slate-500'}`} />
          {sidebarExpanded && (
            <span className="text-xs font-semibold truncate">Browse all</span>
          )}
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 py-3 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const items = getFilteredForCategory(allComponents, cat.value);
          const isCollapsed = collapsedCategories.has(cat.value);
          const Icon = cat.icon;
          const hasSelected = items.some((c) => c.id === selectedId);
          if (items.length === 0) return null;

          return (
            <div key={cat.value} className="mb-1">
              <button type="button"
                onClick={() => { if (!sidebarExpanded) { onSidebarExpandedChange(true); } else { onToggleCategory(cat.value); } }}
                title={!sidebarExpanded ? cat.label : undefined}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors group ${
                  hasSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                } ${!sidebarExpanded ? 'justify-center' : ''}`}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {sidebarExpanded && (
                  <>
                    <span className="text-xs font-medium flex-1 text-left truncate">{cat.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {items.length > 0 && (
                        <span className="text-[10px] text-slate-400 tabular-nums">{items.length}</span>
                      )}
                      <ChevronRight className={`w-3 h-3 text-slate-300 transition-transform duration-150 ${!isCollapsed ? 'rotate-90' : ''}`} />
                    </div>
                  </>
                )}
              </button>

              {sidebarExpanded && !isCollapsed && items.length > 0 && (
                <div className="ml-2 border-l border-slate-200 pl-1 mb-2">
                  {items.map((comp) => (
                    <button key={comp.id} type="button" onClick={() => onSelectComponent(comp.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-all ${
                        selectedId === comp.id
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}>
                      {comp.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}