import { useState } from 'react';
import { Layers, Search, Sparkles, Code2, Box } from 'lucide-react';
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

  const clearFilters = () => {
    setSearch('');
    setActiveCategory(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[min(100%,1200px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18)_0%,transparent_65%)] opacity-40 blur-3xl" />
        <div className="absolute top-[20%] right-[-10%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12)_0%,transparent_70%)] opacity-30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-10 lg:mb-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white shadow-sm">
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                </span>
                Production-ready UI blocks
              </div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Component library
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-slate-600">
                Browse live previews, open any block in the editor, then export clean React code for your product.
              </p>
            </div>

            <dl className="grid w-full max-w-md grid-cols-3 gap-3 sm:max-w-lg lg:w-auto lg:max-w-none lg:shrink-0">
              <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {loading ? '—' : 'Components'}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                  {loading ? '…' : totalCount}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {loading ? '—' : 'Categories'}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                  {loading ? '…' : categoryCount}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {loading ? '—' : 'Showing'}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                  {loading ? '…' : filteredComponents.length}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        {/* Search & filters */}
        <div className="mb-12 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:p-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search by name, tag, or category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-slate-950/5 placeholder:text-slate-400 transition-[box-shadow,border-color] focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
              autoComplete="off"
            />
          </div>

          <div className="mt-4">
            <p className="mb-2.5 text-xs font-medium text-slate-500">Categories</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  !activeCategory
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
                    className={`inline-flex  shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 opacity-90" aria-hidden />
                    <span>{cat.label}</span>
                    <span
                      className={`tabular-nums ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-16">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200/80" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded-md bg-slate-200/80" />
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200/60" />
                  </div>
                </div>
                <div className="space-y-8">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm"
                    >
                      <div className="h-52 animate-pulse bg-slate-100 sm:h-56" />
                      <div className="flex flex-col gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                          <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-100" />
                        </div>
                        <div className="h-9 w-36 shrink-0 animate-pulse rounded-lg bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sections by category */}
        {!loading &&
          categoriesWithItems.map((cat) => {
            const items = filteredComponents.filter((c) => c.category === cat.value);
            if (items.length === 0) return null;
            const Icon = cat.icon;

            return (
              <section key={cat.value} className="mb-16 last:mb-0">
                <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-slate-200/80 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                    <Icon className="h-4 w-4 text-slate-700" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        {cat.label}
                      </h2>
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
                        {items.length}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {items.length} block{items.length === 1 ? '' : 's'} in this group
                    </p>
                  </div>
                </div>

                <div className="grid gap-8">
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

        {/* Empty state */}
        {!loading && filteredComponents.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <Search className="h-6 w-6 text-slate-400" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No components match</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Try a different search term or pick another category.
            </p>
            {(search || activeCategory) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <article className="group overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-950/10">
      <div className="relative min-h-0 overflow-hidden border-b border-slate-100 bg-slate-50/80">
        {hasCode ? (
          <div className="min-h-0 w-full overflow-hidden">
            <LazyLandingLivePreview code={component.code} />
          </div>
        ) : component.thumbnail ? (
          <img
            src={component.thumbnail}
            alt={component.title}
            className="max-h-[500px] w-full object-cover object-top"
          />
        ) : (
          <div className="flex items-center justify-center py-20 text-slate-300">
            <Code2 className="h-9 w-9" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-white p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              {component.title}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              <Box className="h-3 w-3" aria-hidden />
              {component.category}
            </span>
          </div>
          {component.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
              {component.description}
            </p>
          ) : null}
          {component.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {component.tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect(component.id)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm outline-none ring-slate-950/20 transition-colors hover:bg-slate-800 focus-visible:ring-4 focus-visible:ring-slate-900/15 sm:min-w-[140px]"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Open in editor
        </button>
      </div>
    </article>
  );
}
