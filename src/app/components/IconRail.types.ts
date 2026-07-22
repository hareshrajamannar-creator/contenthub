import type React from 'react'

export interface RailNavItem {
  id: string
  label: string
  icon: string | React.ReactNode
  kind?: 'image' | 'element'
  badge?: string
}

export interface RailGroup {
  id: string
  header?: string
  items: RailNavItem[]
}

export interface Product {
  id: string
  label: string
}

export interface IconRailProps {
  /** React node for the logo (e.g. BirdeyeLogoMark) shown in the header cell. */
  logoElement?: React.ReactNode
  /** Fallback image src if logoElement is not provided. */
  logoSrc?: string
  brand: string
  groups: RailGroup[]
  activeId: string
  onSelect?: (id: string) => void
  products?: Product[]
  activeProduct?: string
  onProductChange?: (id: string) => void
  initials?: string
  avatarUrl?: string
  userName?: string
  userEmail?: string
  expandOnHover?: boolean
  onExpandOnHoverChange?: (value: boolean) => void
  onProfileAction?: (action: string) => void
}
