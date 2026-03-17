import type { Profile } from '../types'

export function isAdmin(profile: Profile | null): boolean {
  if (!profile) return false
  return profile.role === 'admin' || profile.role_detail?.name === 'Administrador'
}

export function isAttendant(profile: Profile | null): boolean {
  if (!profile) return false
  return profile.role_detail?.name === 'Atendente' || isAdmin(profile)
}

export function canAccessFullAgenda(profile: Profile | null): boolean {
  return isAttendant(profile)
}

export function canSelfBook(profile: Profile | null): boolean {
  if (!profile) return false
  if (isAdmin(profile) || isAttendant(profile)) return true
  return profile.can_self_book === true
}
