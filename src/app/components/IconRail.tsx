import React, { useEffect, useRef, useState } from 'react'
import { CircleHelp, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import type { IconRailProps, RailGroup, RailNavItem } from '@/app/components/IconRail.types'

// Rail collapses to 52px. Icon cell is 24px. Centering: (52-24)/2 = 14px.
const RAIL_ICON_PX = 14

// ─── Overflow computation ─────────────────────────────────────────────────────

interface OverflowEntry { item: RailNavItem; groupLabel?: string }

function _computeRaw(groups: RailGroup[], budget: number) {
  let rem = budget
  const visibleGroups: RailGroup[] = []
  const overflow: OverflowEntry[] = []
  let hasOverflow = false
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi]
    if (gi > 0) rem -= 20  // separator
    if (g.header) rem -= 28
    const visible: RailNavItem[] = []
    for (const item of g.items) {
      if (!hasOverflow && rem >= 34) { rem -= 34; visible.push(item) }
      else { hasOverflow = true; overflow.push({ item, groupLabel: g.header }) }
    }
    if (visible.length > 0) visibleGroups.push({ ...g, items: visible })
  }
  return { visibleGroups, overflow, hasOverflow }
}

function computeLayout(groups: RailGroup[], containerHeight: number) {
  const first = _computeRaw(groups, containerHeight - 12)
  if (!first.hasOverflow) return first
  return _computeRaw(groups, containerHeight - 12 - 34)
}

// ─── NavTab ───────────────────────────────────────────────────────────────────

function NavTab({ item, active, onSelect }: {
  item: RailNavItem
  active: boolean
  onSelect?: (id: string) => void
}) {
  return (
    <button
      type="button"
      title={item.label}
      aria-label={item.label}
      onClick={() => onSelect?.(item.id)}
      style={{ paddingLeft: RAIL_ICON_PX, paddingRight: RAIL_ICON_PX }}
      className={`relative flex h-7 w-full items-center rounded-sm transition-colors ${
        active ? '' : 'hover:bg-app-shell-l1-nav-highlight'
      }`}
    >
      {/* Expanded-state full-row highlight (fades in on hover) */}
      {active && (
        <span className="pointer-events-none absolute inset-y-0 left-1 right-1 rounded-sm bg-[#c7d6f6] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      )}
      {/* Icon pill — visible in both states; active bg transitions away on hover */}
      <span className={`relative flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors ${
        active
          ? 'bg-[#c7d6f6] text-primary group-hover:bg-transparent'
          : 'text-[#303030]'
      }`}>
        {item.kind === 'element' ? (item.icon as React.ReactNode) : (
          <img src={item.icon as string} alt="" className="size-[18px]" />
        )}
      </span>
      {/* Label — hidden collapsed, fades in on hover */}
      <span className={`relative ml-[10px] min-w-0 flex-1 truncate text-left text-sm ${
        active ? 'text-primary' : 'text-[#0d0d12]'
      } opacity-0 transition-opacity duration-150 group-hover:opacity-100`}>
        {item.label}
      </span>
    </button>
  )
}

// ─── BottomIconButton ─────────────────────────────────────────────────────────

function BottomIconButton({ label, active, onClick, children }: {
  label: string; active?: boolean; onClick?: () => void; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      style={{ paddingLeft: RAIL_ICON_PX, paddingRight: RAIL_ICON_PX }}
      className={`flex h-7 w-full items-center rounded-sm transition-colors ${
        active ? '' : 'hover:bg-app-shell-l1-nav-highlight'
      }`}
    >
      <span className={`flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors ${
        active ? 'bg-[#c7d6f6] text-primary group-hover:bg-transparent' : 'text-[#303030]'
      }`}>
        {children}
      </span>
      <span className="ml-[10px] min-w-0 flex-1 truncate text-left text-sm text-[#0d0d12] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

// ─── ProfileDropdown ──────────────────────────────────────────────────────────

function ProfileDropdown({ initials, avatarUrl, userName, userEmail, expandOnHover, onExpandOnHoverChange, onAction, onClose }: {
  initials: string; avatarUrl?: string; userName: string; userEmail: string
  expandOnHover: boolean; onExpandOnHoverChange: (v: boolean) => void
  onAction: (action: string) => void; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const menuItems = [
    { id: 'my-profile', label: 'My profile' },
    { id: 'shared-by-me', label: 'Shared by me' },
    { id: 'scheduled-deliveries', label: 'Scheduled deliveries' },
    { id: 'settings', label: 'Settings' },
    { id: 'keyboard-shortcuts', label: 'Keyboard shortcuts' },
  ]

  return (
    <div ref={ref} className="absolute bottom-2 left-[56px] z-[60] w-[280px] rounded-md border border-border bg-background py-1 shadow-lg">
      {/* User header */}
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/10">
          {avatarUrl
            ? <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover" />
            : <span className="text-[13px] text-muted-foreground">{initials}</span>
          }
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
      </div>
      <div className="my-1 h-px bg-border" />
      {menuItems.map((item) => (
        <button key={item.id} type="button" onClick={() => { onAction(item.id); onClose() }}
          className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent">
          {item.label}
        </button>
      ))}
      <div className="my-1 h-px bg-border" />
      {/* Expand sidebar toggle */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-foreground">Expand sidebar on hover</span>
        <button type="button" role="switch" aria-checked={expandOnHover}
          onClick={() => onExpandOnHoverChange(!expandOnHover)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${expandOnHover ? 'bg-primary' : 'bg-black/20'}`}>
          <span className={`absolute left-[2px] top-[2px] size-4 rounded-full bg-white shadow-sm transition-transform ${expandOnHover ? 'translate-x-[16px]' : 'translate-x-0'}`} />
        </button>
      </div>
      <button type="button" onClick={() => { onAction('switch-appearance'); onClose() }}
        className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent">
        Switch appearance
      </button>
      <div className="my-1 h-px bg-border" />
      <button type="button" onClick={() => { onAction('sign-out'); onClose() }}
        className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent">
        Sign out
      </button>
    </div>
  )
}

// ─── OverflowFlyout ───────────────────────────────────────────────────────────

function OverflowFlyout({ items, activeId, onSelect, onClose, bottomOffset }: {
  items: OverflowEntry[]; activeId: string; onSelect?: (id: string) => void
  onClose: () => void; bottomOffset: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const grouped: { label?: string; items: RailNavItem[] }[] = []
  let cg: { label?: string; items: RailNavItem[] } | null = null
  for (const entry of items) {
    if (!cg || cg.label !== entry.groupLabel) { cg = { label: entry.groupLabel, items: [] }; grouped.push(cg) }
    cg.items.push(entry.item)
  }

  return (
    <div ref={ref}
      className="absolute left-[56px] z-[60] w-[220px] rounded-md border border-border bg-background py-1 shadow-lg"
      style={{ bottom: bottomOffset }}>
      {grouped.map((g, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="my-1 h-px bg-border" />}
          {g.label && <p className="px-4 pb-1 pt-1 text-xs text-muted-foreground">{g.label}</p>}
          {g.items.map((item) => (
            <button key={item.id} type="button" onClick={() => { onSelect?.(item.id); onClose() }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-accent ${
                item.id === activeId ? 'text-primary' : 'text-foreground'
              }`}>
              <span className={`flex size-5 shrink-0 items-center justify-center ${item.id === activeId ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.kind === 'element' ? (item.icon as React.ReactNode) : (
                  <img src={item.icon as string} alt="" className="size-[18px]" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── IconRail ─────────────────────────────────────────────────────────────────

export function IconRail({
  logoElement, logoSrc, brand,
  groups, activeId, onSelect,
  products, activeProduct, onProductChange,
  initials = 'HR', avatarUrl,
  userName = 'John Doe', userEmail = 'john.doe@example.com',
  expandOnHover = true, onExpandOnHoverChange,
  onProfileAction,
}: IconRailProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [containerHeight, setContainerHeight] = useState(9999)
  const [dotsBtnBottom, setDotsBtnBottom] = useState(0)

  const switcherRef = useRef<HTMLDivElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)
  const dotsBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = navContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height))
    ro.observe(el)
    setContainerHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!switcherOpen) return
    function h(e: MouseEvent) { if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) setSwitcherOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [switcherOpen])

  const { visibleGroups, overflow, hasOverflow } = computeLayout(groups, containerHeight)

  function handleDotsClick() {
    if (dotsBtnRef.current) {
      const railEl = dotsBtnRef.current.closest('.icon-rail-outer') as HTMLElement | null
      const btnRect = dotsBtnRef.current.getBoundingClientRect()
      const railRect = railEl?.getBoundingClientRect()
      setDotsBtnBottom(railRect ? railRect.bottom - btnRect.bottom + 4 : 40)
    }
    setOverflowOpen(o => !o)
  }

  return (
    <div className={`icon-rail-outer ${expandOnHover ? 'group' : ''} relative h-full w-[52px] shrink-0 overflow-visible`}>
      <nav className={`absolute inset-y-0 left-0 z-[40] flex flex-col overflow-hidden bg-app-shell-rail transition-[width] duration-200 ease-in-out ${
        expandOnHover ? 'w-[52px] hover:w-[260px]' : 'w-[52px]'
      }`}>

        {/* ── Logo / brand header ── */}
        <div className="relative h-[52px] shrink-0" ref={switcherRef}>
          <button type="button"
            onClick={() => products && products.length > 0 && setSwitcherOpen(o => !o)}
            aria-label="Switch product"
            className="flex h-full w-full items-center gap-4 px-[12px] transition-colors hover:bg-black/[0.04]">
            <span className="flex size-7 shrink-0 items-center justify-center">
              {logoElement ?? (logoSrc ? <img src={logoSrc} alt="" className="size-7" /> : null)}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <span className="truncate text-sm text-foreground">{brand}</span>
              {products && products.length > 0 && (
                switcherOpen
                  ? <ChevronUp size={14} className="shrink-0 text-muted-foreground" />
                  : <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
              )}
            </span>
          </button>
          {switcherOpen && products && (
            <div className="absolute left-0 top-[56px] z-[50] min-w-[220px] rounded-md border border-border bg-background py-1 shadow-lg">
              <p className="px-4 pb-1 pt-1 text-xs text-muted-foreground">Switch product</p>
              {products.map((p) => (
                <button key={p.id} type="button"
                  onClick={() => { onProductChange?.(p.id); setSwitcherOpen(false) }}
                  className="flex w-full items-center gap-1 px-4 py-2 text-left text-sm text-foreground hover:bg-accent">
                  <span className="size-[18px]">{p.id === activeProduct ? '✓' : ''}</span>
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main nav items ── */}
        <div ref={navContainerRef}
          className="flex flex-1 flex-col gap-[6px] overflow-hidden py-[6px]">
          {visibleGroups.map((group, gi) => (
            <div key={group.id} className="flex flex-col gap-[6px]">
              {gi > 0 && (
                <span className="my-1 h-px bg-black/[0.08]"
                  style={{ marginLeft: RAIL_ICON_PX, marginRight: RAIL_ICON_PX }} />
              )}
              {group.header && (
                <p className="h-0 overflow-hidden truncate px-[14px] text-[11px] text-[#9ca3af] opacity-0 transition-all duration-200 group-hover:h-[20px] group-hover:opacity-100">
                  {group.header}
                </p>
              )}
              {group.items.map((item) => (
                <NavTab key={item.id} item={item} active={item.id === activeId} onSelect={onSelect} />
              ))}
            </div>
          ))}

          {/* Three-dots overflow */}
          {hasOverflow && (
            <button ref={dotsBtnRef} type="button" title="More" aria-label="More modules"
              onClick={handleDotsClick}
              style={{ paddingLeft: RAIL_ICON_PX, paddingRight: RAIL_ICON_PX }}
              className="flex h-7 w-full items-center gap-[10px] rounded-sm transition-colors hover:bg-app-shell-l1-nav-highlight">
              <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                </svg>
              </span>
              <span className="text-sm text-foreground/80 opacity-0 transition-opacity duration-150 group-hover:opacity-100">More</span>
            </button>
          )}
        </div>

        {/* ── Bottom: Settings, Help, Profile ── */}
        <div className="flex shrink-0 flex-col gap-[6px] border-t border-black/[0.08] py-[6px]">
          <BottomIconButton label="Settings" active={activeId === 'settings'} onClick={() => onSelect?.('settings')}>
            <Settings size={18} strokeWidth={1.6} />
          </BottomIconButton>

          <BottomIconButton label="Help">
            <CircleHelp size={18} strokeWidth={1.6} />
          </BottomIconButton>

          {/* Profile */}
          <button type="button" title="Profile" aria-label="Profile"
            onClick={() => setProfileOpen(o => !o)}
            className="flex h-8 w-full items-center transition-colors hover:bg-app-shell-l1-nav-highlight"
            style={{ paddingLeft: RAIL_ICON_PX, paddingRight: RAIL_ICON_PX }}>
            <span className="flex size-7 shrink-0 items-center justify-center">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" />
                : <span className="flex size-6 items-center justify-center rounded-full bg-black/10 text-[11px] text-muted-foreground">{initials}</span>
              }
            </span>
            <span className="ml-[10px] min-w-0 flex-1 truncate text-left text-sm text-[#0d0d12] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Profile
            </span>
          </button>
        </div>
      </nav>

      {/* Profile dropdown — outside nav so it's not clipped by overflow-hidden */}
      {profileOpen && (
        <ProfileDropdown
          initials={initials} avatarUrl={avatarUrl} userName={userName} userEmail={userEmail}
          expandOnHover={expandOnHover}
          onExpandOnHoverChange={(v) => { onExpandOnHoverChange?.(v) }}
          onAction={(action) => { onProfileAction?.(action) }}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {/* Overflow flyout */}
      {overflowOpen && hasOverflow && (
        <OverflowFlyout items={overflow} activeId={activeId} onSelect={onSelect}
          onClose={() => setOverflowOpen(false)} bottomOffset={dotsBtnBottom} />
      )}
    </div>
  )
}
