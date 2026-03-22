import { useState } from 'react';
import { Layers, Search, ArrowRight, Sparkles, Code2 } from 'lucide-react';
import { LazyLandingLivePreview } from '../../components/LandingLivePreview';
import type { ComponentDetail } from '../../services/componentApi';
import { CATEGORIES } from './constants';

export interface ComponentLibraryLandingProps {
  components: ComponentDetail[];
  loading: boolean;
  totalCount: number;
  categoryCount: number;
  onSelect: (id: string) => void;
}

export function ComponentLibraryLanding({
  components,
  loading,
  totalCount,
  categoryCount,
  onSelect,
}: ComponentLibraryLandingProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredComponents = components.filter((c) => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesWithItems = CATEGORIES.filter((cat) =>
    filteredComponents.some((c) => c.category === cat.value)
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Component Library</h1>
              <p className="text-sm text-slate-500">
                {loading ? 'Loading...' : `${totalCount} components across ${categoryCount} categories`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search + Category filters ── */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search components, categories, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 placeholder-slate-400 transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), inset 0 1px 2px rgba(0,0,0,0.02)' }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !activeCategory
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const count = components.filter((c) => c.category === cat.value).length;
              if (count === 0) return null;
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? null : cat.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                  <span className={`text-[10px] tabular-nums ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── How it works strip ── */}
        {/* <div className="flex items-center gap-6 mb-10 px-1">
          {[
            { num: '1', label: 'Browse & interact with live components' },
            { num: '2', label: 'Open in editor to customize with AI or code' },
            { num: '3', label: 'Export the .tsx file into your project' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                {s.num}
              </div>
              <span>{s.label}</span>
              {i < 2 && <ArrowRight className="w-3 h-3 text-slate-300 ml-2 flex-shrink-0" />}
            </div>
          ))}
        </div> */}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-5 w-32 bg-slate-100 rounded animate-pulse mb-4" />
                <div className="space-y-6">
                  {[1, 2].map((j) => (
                    <div key={j} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="h-48 bg-slate-50 animate-pulse" />
                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-40" />
                          <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
                        </div>
                        <div className="h-8 w-28 bg-slate-100 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Component sections by category ── */}
        {!loading && categoriesWithItems.map((cat) => {
          const items = filteredComponents.filter((c) => c.category === cat.value);
          if (items.length === 0) return null;
          const Icon = cat.icon;

          return (
            <section key={cat.value} className="mb-14">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">{cat.label}</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                  {items.length}
                </span>
              </div>

              <div className="space-y-6">
                {items.map((comp) => (
                  <ComponentPreviewCard
                    key={comp.id}
                    component={comp}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* ── Empty state ── */}
        {!loading && filteredComponents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-medium text-slate-700 mb-1">No components found</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Try adjusting your search or filters.
            </p>
            {(search || activeCategory) && (
              <button type="button" onClick={() => { setSearch(''); setActiveCategory(null); }}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component Preview Card ──────────────────────────────────────────────────
// Renders via LandingLivePreview (gallery variant: intrinsic height, no iframe scrollbars).
// Editor/detail still uses LivePreview.

function ComponentPreviewCard({
  component,
  onSelect,
}: {
  component: ComponentDetail;
  onSelect: (id: string) => void;
}) {
  const hasCode = !!component.code;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      
      <div className="relative overflow-hidden border-b border-slate-100 min-h-0">
        {hasCode ? (
          <div className="w-full min-h-0 overflow-hidden">
            <LazyLandingLivePreview code={component.code} />
          </div>
        ) : component.thumbnail ? (
          <img src={component.thumbnail} alt={component.title}
            className="w-full object-cover object-top" style={{ maxHeight: '500px' }} />
        ) : (
          <div className="flex items-center justify-center py-16 text-slate-300">
            <Code2 className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Info bar + action */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{component.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500 truncate">{component.description}</p>
            {component.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {component.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded border border-slate-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(component.id)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <Sparkles className="w-3 h-3" />
          Open in Editor
        </button>
      </div>
    </div>
  );
}