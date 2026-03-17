import type { Profile } from '../types'

function roleNameIs(profile: Profile | null, name: string): boolean {
  if (!profile?.role_detail?.name) return false
  return profile.role_detail.name.toLowerCase() === name.toLowerCase()
}

export function isAdmin(profile: Profile | null): boolean {
  if (!profile) return false
  const role = profile.role?.toString?.()?.toLowerCase?.()
  if (role === 'admin') return true
  return roleNameIs(profile, 'Administrador')
}

export function isAttendant(profile: Profile | null): boolean {
  if (!profile) return false
  if (roleNameIs(profile, 'Atendente')) return true
  return isAdmin(profile)
}

export function canAccessFullAgenda(profile: Profile | null): boolean {
  return isAttendant(profile)
}

export function canSelfBook(profile: Profile | null): boolean {
  if (!profile) return false
  if (isAdmin(profile) || isAttendant(profile)) return true
  return profile.can_self_book === true
}
