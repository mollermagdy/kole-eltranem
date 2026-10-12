import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpenText,
  Check,
  ChevronDown,
  CornerDownLeft,
  Music2,
  Search,
  ScrollText,
  TrendingUp,
  Volume2,
} from 'lucide-react'
import clsx from 'clsx'
import { hymns, popularSearches, searchModes, searchScopes } from '../data/content'
import { searchHymns } from '../lib/search'
import { toArabic } from '../lib/format'

const HAS_ICONS = { text: BookOpenText, melody: Music2, story: ScrollText, audio: Volume2 }

/** Wraps the matched part of `text` in a <mark>, ignoring diacritics on a best-effort basis. */
function Highlight({ text, query }) {
  const i = query ? text.indexOf(query) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-melody/40 rounded px-0.5 text-inherit">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  )
}

function ResultRow({ hymn, query, active, onHover }) {
  return (
    <a
      href={`#${hymn.id}`}
      onMouseEnter={onHover}
      className={clsx(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
        active ? 'bg-surface ring-line ring-1' : 'hover:bg-surface',
      )}
    >
      <span className="bg-lyrics/10 font-naskh text-lyrics grid size-10 shrink-0 place-items-center rounded-lg text-lg font-bold">
        {hymn.title.replace(/[ً-ٟ]/g, '').charAt(0)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-naskh text-ink block truncate text-[17px] font-bold">
          <Highlight text={hymn.title} query={query} />
        </span>
        <span className="text-muted block truncate text-[13px]">
          {hymn.writer} · {hymn.composer}
          {hymn.original && (
            <span className="text-muted/70 ms-1 font-sans text-[12px]" dir="ltr">
              ({hymn.original})
            </span>
          )}
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 sm:flex">
        {hymn.has.map((k) => {
          const Icon = HAS_ICONS[k]
          return <Icon key={k} className="text-muted/60 size-3.5" />
        })}
      </span>
      <span className="shrink-0 text-start">
        <span className="bg-emerald/10 text-emerald block rounded-full px-2 py-0.5 text-[12px] font-bold">
          {hymn.maqam}
        </span>
        <span className="text-muted mt-0.5 block text-center text-[11px]">{toArabic(hymn.year)}</span>
      </span>
    </a>
  )
}

export default function SearchBox() {
  const [mode, setMode] = useState(searchModes[0])
  const [scope, setScope] = useState(searchScopes[0])
  const [scopeOpen, setScopeOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listId = useId()

  const results = useMemo(() => searchHymns(hymns, query, scope.id), [query, scope])
  const shown = query ? results : hymns.slice(0, 4)

  // close on outside click, focus with ⌘K / Ctrl+K or "/"
  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false)
        setScopeOpen(false)
      }
    }
    const onKey = (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement === document.body)) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && shown[active]) {
      window.location.hash = shown[active].id
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative z-30 mx-auto w-full max-w-[680px]">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className={clsx(
          'shadow-card ring-line relative flex h-14 items-center gap-2 rounded-full bg-white ps-5 pe-2 ring-1 transition-all sm:h-16 sm:gap-3 sm:ps-6',
          open && 'shadow-lift ring-lyrics/30',
        )}
      >
        <Search className="text-muted size-[18px] shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="ابحث عن ترنيمة، مرنم، لحن…"
          aria-label="بحث"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className="text-ink placeholder:text-muted/80 h-full min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd
          className="border-line text-muted hidden shrink-0 rounded-md border px-1.5 py-0.5 font-sans text-[11px] lg:block"
          dir="ltr"
        >
          ⌘K
        </kbd>
        <div className="bg-line h-8 w-px shrink-0" />
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setScopeOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={scopeOpen}
            className="hover:bg-surface flex items-center gap-1.5 rounded-full px-2 py-1.5 text-start transition-colors sm:px-3"
          >
            <span className="leading-tight">
              <span className="text-muted block text-[11px] sm:text-[12px]">بحث في</span>
              <span className="text-ink block text-[14px] font-bold sm:text-[15px]">{scope.label}</span>
            </span>
            <ChevronDown className={clsx('text-muted size-4 transition-transform', scopeOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {scopeOpen && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="shadow-lift ring-line absolute end-0 top-full z-40 mt-2 w-44 origin-top-left rounded-2xl bg-white p-1.5 ring-1"
              >
                {searchScopes.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={s.id === scope.id}
                      onClick={() => {
                        setScope(s)
                        setScopeOpen(false)
                        inputRef.current?.focus()
                      }}
                      className="text-ink hover:bg-surface flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold"
                    >
                      {s.label}
                      {s.id === scope.id && <Check className="text-lyrics size-4" />}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* results panel */}
      <AnimatePresence>
        {open && !scopeOpen && (
          <motion.div
            id={listId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="shadow-lift ring-line absolute inset-x-0 top-full z-30 mt-3 overflow-hidden rounded-3xl bg-white/95 ring-1 backdrop-blur-xl"
          >
            {!query && (
              <div className="border-line border-b px-5 pt-4 pb-3">
                <p className="text-muted flex items-center gap-1.5 text-[12px] font-bold">
                  <TrendingUp className="size-3.5" /> عمليات بحث شائعة
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {popularSearches.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setQuery(p)
                        inputRef.current?.focus()
                      }}
                      className="bg-surface text-ink ring-line hover:bg-lyrics hover:ring-lyrics rounded-full px-3 py-1 text-[13px] font-bold ring-1 transition-colors hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-[340px] overflow-y-auto p-2">
              <p className="text-muted px-3 pt-1 pb-2 text-[12px] font-bold">
                {query ? `${toArabic(results.length)} نتيجة في «${scope.label}»` : 'أُضيفت حديثًا'}
              </p>
              {shown.map((h, i) => (
                <ResultRow key={h.id} hymn={h} query={query} active={i === active} onHover={() => setActive(i)} />
              ))}
              {query && results.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <p className="text-ink font-bold">لا توجد نتائج لـ «{query}»</p>
                  <p className="text-muted mt-1 text-sm">جرّب كلمة أخرى، أو ساعدنا بإضافة هذه الترنيمة.</p>
                  <a href="#contact" className="text-lyrics mt-3 inline-block text-sm font-bold hover:underline">
                    أرسل ترنيمة ←
                  </a>
                </div>
              )}
            </div>

            <div className="border-line bg-surface text-muted hidden items-center justify-between border-t px-5 py-2.5 text-[12px] sm:flex">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="border-line rounded border bg-white px-1">↑↓</kbd> للتنقل
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border-line rounded border bg-white px-1">
                    <CornerDownLeft className="inline size-3" />
                  </kbd>{' '}
                  للفتح
                </span>
              </span>
              <a href="#archive" className="text-lyrics font-bold hover:underline">
                عرض كل النتائج ←
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex justify-center sm:justify-start sm:ps-6">
        <div
          role="tablist"
          aria-label="نوع البحث"
          className="shadow-card ring-line flex rounded-full bg-white p-1 ring-1"
        >
          {searchModes.map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={clsx(
                'relative rounded-full px-4 py-2 text-[13px] font-bold transition-colors sm:px-5 sm:text-sm',
                mode === m ? 'text-white' : 'text-muted hover:text-ink',
              )}
            >
              {mode === m && (
                <motion.span
                  layoutId="search-tab"
                  className="bg-lyrics absolute inset-0 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{m}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
