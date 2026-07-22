import { useEffect, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { FigmaIconSettings } from '@/app/components/l1Icons'
import type { IconRailProps, RailGroup, RailNavItem } from '@/app/components/IconRail.types'

const RAIL_ICON_PX = 14

interface OverflowEntry { item: RailNavItem; groupLabel?: string }

function _computeRaw(groups: RailGroup[], budget: number) {
  let rem = budget
  const visibleGroups: RailGroup[] = []
  const overflow: OverflowEntry[] = []
  let hasOverflow = false
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]
    if (gi > 0) rem -= 20
    if (group.header) rem -= 28
    const visible: RailNavItem[] = []
    for (const item of group.items) {
      if (!hasOverflow && rem >= 34) { rem -= 34; visible.push(item) }
      else { hasOverflow = true; overflow.push({ item, groupLabel: group.header }) }
    }
    if (visible.length > 0) visibleGroups.push({ ...group, items: visible })
  }
  return { visibleGroups, overflow, hasOverflow }
}

function computeLayout(groups: RailGroup[], containerHeight: number) {
  const first = _computeRaw(groups, containerHeight - 12)
  if (!first.hasOverflow) return first
  return _computeRaw(groups, containerHeight - 12 - 34)
}

function NavTab({ item, active, onSelect, grouped = false }: { item: RailNavItem; active: boolean; onSelect?: (id: string) => void; grouped?: boolean }) {
  return (
    <button type="button" title={item.label} aria-label={item.label} onClick={() => onSelect?.(item.id)}
      style={{ paddingLeft: grouped ? 12 : RAIL_ICON_PX, paddingRight: grouped ? 12 : RAIL_ICON_PX }}
      className={`relative flex h-7 w-full items-center rounded-sm transition-colors ${active ? '' : 'hover:bg-black/[0.04]'}`}
    >
      {active && <span className="pointer-events-none absolute inset-y-0 left-1 right-1 rounded-sm bg-surface-selected-l1 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />}
      <span className={`relative flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors text-text-icon ${active ? 'bg-surface-selected-l1 group-hover:bg-transparent' : ''}`}>
        {item.kind === 'element' ? item.icon : <img src={item.icon as string} alt="" className="size-[18px]" />}
      </span>
      <span className="relative ml-[10px] min-w-0 flex-1 truncate text-left text-body text-text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">{item.label}</span>
      {item.badge && <span className="mr-[14px] flex h-5 shrink-0 items-center justify-center rounded-sm bg-accent-positive px-sm text-[10px] leading-[18px] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">{item.badge}</span>}
    </button>
  )
}

function BottomIconButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick}
      style={{ paddingLeft: RAIL_ICON_PX, paddingRight: RAIL_ICON_PX }}
      className={`flex h-7 w-full items-center rounded-sm transition-colors ${active ? '' : 'hover:bg-black/[0.04]'}`}
    >
      <span className={`relative flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors text-text-icon ${active ? 'bg-surface-selected-l1 group-hover:bg-transparent' : ''}`}>{children}</span>
      <span className="relative ml-[10px] min-w-0 flex-1 truncate text-left text-body text-text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">{label}</span>
    </button>
  )
}

function ProfileDropdown({ initials, avatarUrl, userName, userEmail, expandOnHover, onExpandOnHoverChange, onAction, onClose }: { initials: string; avatarUrl?: string; userName: string; userEmail: string; expandOnHover: boolean; onExpandOnHoverChange: (v: boolean) => void; onAction: (action: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  const menuItems = [{ id: 'my-profile', label: 'My profile' }, { id: 'shared-by-me', label: 'Shared by me' }, { id: 'scheduled-deliveries', label: 'Scheduled deliveries' }, { id: 'settings', label: 'Settings' }, { id: 'keyboard-shortcuts', label: 'Keyboard shortcuts' }]
  return (
    <div ref={ref} className="absolute bottom-2 left-[56px] z-[60] w-[280px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
      <div className="flex items-center gap-sm px-md py-sm">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/10">
          {avatarUrl ? <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover" /> : <span className="text-[13px] text-text-secondary">{initials}</span>}
        </span>
        <div className="min-w-0 flex-1"><p className="truncate text-body text-text-primary">{userName}</p><p className="truncate text-small text-text-tertiary">{userEmail}</p></div>
      </div>
      <div className="my-xs h-px bg-border" />
      {menuItems.map((item) => <button key={item.id} type="button" onClick={() => { onAction(item.id); onClose() }} className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover">{item.label}</button>)}
      <div className="my-xs h-px bg-border" />
      <div className="flex items-center justify-between px-md py-sm">
        <span className="text-body text-text-primary">Expand sidebar on hover</span>
        <button type="button" role="switch" aria-checked={expandOnHover} onClick={() => onExpandOnHoverChange(!expandOnHover)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${expandOnHover ? 'bg-primary' : 'bg-black/20'}`}>
          <span className={`absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${expandOnHover ? 'translate-x-[16px]' : 'translate-x-0'}`} />
        </button>
      </div>
      <button type="button" onClick={() => { onAction('switch-appearance'); onClose() }} className="block w-full px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover">Switch appearance</button>
      <div className="my-xs h-px bg-border" />
      <button type="button" onClick={() => { onAction('sign-out'); onClose() }} className="block w-full px-md py-sm text-left text-body text-chip-danger-text hover:bg-surface-hover">Sign out</button>
    </div>
  )
}

function OverflowFlyout({ items, activeId, onSelect, onClose, bottomOffset }: { items: OverflowEntry[]; activeId: string; onSelect?: (id: string) => void; onClose: () => void; bottomOffset: number }) {
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
    <div ref={ref} className="absolute left-[56px] z-[60] w-[220px] rounded-sm border border-border bg-surface py-xs shadow-dropdown" style={{ bottom: bottomOffset }}>
      {grouped.map((g, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="my-xs h-px bg-border" />}
          {g.label && <p className="px-md pb-xs pt-xs text-small text-text-tertiary">{g.label}</p>}
          {g.items.map((item) => (
            <button key={item.id} type="button" onClick={() => { onSelect?.(item.id); onClose() }}
              className={`flex w-full items-center gap-sm px-md py-sm text-left text-body transition-colors hover:bg-surface-hover ${item.id === activeId ? 'text-primary' : 'text-text-primary'}`}>
              <span className={`flex size-5 shrink-0 items-center justify-center ${item.id === activeId ? 'text-primary' : 'text-text-icon'}`}>
                {item.kind === 'element' ? item.icon : <img src={item.icon as string} alt="" className="size-[18px]" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export function IconRail({ logoElement, logoSrc, brand, groups, activeId, onSelect, products, activeProduct, onProductChange, initials = 'HR', avatarUrl, userName = 'John Doe', userEmail = 'john.doe@example.com', expandOnHover = true, onExpandOnHoverChange, onProfileAction }: IconRailProps) {
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
      <nav className={`absolute inset-y-0 left-0 z-[40] flex flex-col overflow-hidden bg-surface-shell transition-[width] duration-200 ${expandOnHover ? 'w-[52px] hover:w-[260px]' : 'w-[52px]'}`}>

        {/* Logo */}
        <div className="relative h-[52px] shrink-0" ref={switcherRef}>
          <button type="button" onClick={() => products && products.length > 0 && setSwitcherOpen(o => !o)} aria-label="Switch product" className="flex h-full w-full items-center gap-md px-[12px] transition-colors hover:bg-black/5">
            <span className="flex size-7 shrink-0 items-center justify-center">
              {logoElement ?? (logoSrc ? <img src={logoSrc} alt="" className="size-7" /> : null)}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-xs opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <span className="truncate text-h3 text-text-primary">{brand}</span>
            </span>
          </button>
          {switcherOpen && products && (
            <div className="absolute left-0 top-[56px] z-[50] min-w-[220px] rounded-sm border border-border bg-surface py-xs shadow-dropdown">
              <p className="px-md pb-xs pt-xs text-small text-text-tertiary">Switch product</p>
              {products.map((p) => (
                <button key={p.id} type="button" onClick={() => { onProductChange?.(p.id); setSwitcherOpen(false) }} className="flex w-full items-center gap-xs px-md py-sm text-left text-body text-text-primary hover:bg-surface-hover">
                  {p.id === activeProduct ? '✓ ' : '  '}{p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav items */}
        <div ref={navContainerRef} className="l1-rail-nav flex flex-1 flex-col gap-[6px] overflow-hidden py-[6px]">
          {visibleGroups.map((group, gi) => (
            <div key={group.id} className="flex flex-col gap-[6px]">
              {gi > 0 && <span className="my-xs h-px bg-black/10" style={{ marginLeft: RAIL_ICON_PX, marginRight: RAIL_ICON_PX }} />}
              {group.header && (
                <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-200 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                  <p className="min-h-0 overflow-hidden truncate px-[12px] text-small text-text-tertiary">{group.header}</p>
                </div>
              )}
              {group.items.map((item) => <NavTab key={item.id} item={item} active={item.id === activeId} onSelect={onSelect} />)}
            </div>
          ))}
          {hasOverflow && (
            <button ref={dotsBtnRef} type="button" title="More" aria-label="More modules" onClick={handleDotsClick}
              style={{ paddingLeft: RAIL_ICON_PX, paddingRight: RAIL_ICON_PX }}
              className="flex h-7 w-full items-center gap-[10px] rounded-sm transition-colors hover:bg-black/[0.04]">
              <span className="flex size-6 shrink-0 items-center justify-center text-text-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </span>
              <span className="relative text-body text-text-secondary opacity-0 transition-opacity duration-150 group-hover:opacity-100">More</span>
            </button>
          )}
        </div>

        {/* Bottom: Settings, Help, Profile */}
        <div className="l1-rail-nav flex shrink-0 flex-col gap-[6px] border-t border-black/10 py-[6px]">
          <BottomIconButton label="Settings" active={activeId === 'settings'} onClick={() => onSelect?.('settings')}>
            <FigmaIconSettings size={18} />
          </BottomIconButton>
          <BottomIconButton label="Help"><CircleHelp size={18} strokeWidth={1.5} /></BottomIconButton>
          <button type="button" title="Profile" aria-label="Profile" onClick={() => setProfileOpen(o => !o)} className="flex h-8 w-full items-center px-[12px] transition-colors hover:bg-black/[0.04]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-sm">
              {avatarUrl ? <img src={avatarUrl} alt="" className="size-6 rounded-full object-cover" /> : <span className="flex size-6 items-center justify-center rounded-full bg-black/10 text-[11px] text-text-secondary">{initials}</span>}
            </span>
            <span className="relative ml-lg min-w-0 flex-1 truncate text-left text-body text-text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">Profile</span>
          </button>
        </div>
      </nav>

      {profileOpen && <ProfileDropdown initials={initials} avatarUrl={avatarUrl} userName={userName} userEmail={userEmail} expandOnHover={expandOnHover} onExpandOnHoverChange={(v) => { onExpandOnHoverChange?.(v) }} onAction={(action) => { onProfileAction?.(action) }} onClose={() => setProfileOpen(false)} />}
      {overflowOpen && hasOverflow && <OverflowFlyout items={overflow} activeId={activeId} onSelect={onSelect} onClose={() => setOverflowOpen(false)} bottomOffset={dotsBtnBottom} />}
    </div>
  )
}
