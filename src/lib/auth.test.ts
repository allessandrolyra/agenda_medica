import { describe, it, expect } from 'vitest'
import { isAdmin, isAttendant, canSelfBook } from './auth'
import type { Profile } from '../types'

describe('auth', () => {
  describe('isAdmin', () => {
    it('retorna true quando role é admin', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Admin',
        role: 'admin',
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(isAdmin(profile)).toBe(true)
    })

    it('retorna true quando role_detail.name é Administrador', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Admin',
        role: 'paciente',
        role_detail: { id: '1', name: 'Administrador', is_system: true, permissions: [] },
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(isAdmin(profile)).toBe(true)
    })

    it('retorna false quando role é paciente e sem role_detail', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Paciente',
        role: 'paciente',
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(isAdmin(profile)).toBe(false)
    })

    it('retorna false quando profile é null', () => {
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('isAttendant', () => {
    it('retorna true quando role_detail.name é Atendente', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Atendente',
        role: 'paciente',
        role_detail: { id: '1', name: 'Atendente', is_system: true, permissions: [] },
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(isAttendant(profile)).toBe(true)
    })

    it('retorna true quando é admin', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Admin',
        role: 'admin',
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(isAttendant(profile)).toBe(true)
    })
  })

  describe('canSelfBook', () => {
    it('retorna true quando can_self_book é true', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Paciente',
        role: 'paciente',
        can_self_book: true,
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(canSelfBook(profile)).toBe(true)
    })

    it('retorna true quando é atendente', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Atendente',
        role: 'paciente',
        role_detail: { id: '1', name: 'Atendente', is_system: true, permissions: [] },
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(canSelfBook(profile)).toBe(true)
    })

    it('retorna false quando paciente sem can_self_book', () => {
      const profile: Profile = {
        id: '1',
        email: 'a@b.com',
        full_name: 'Paciente',
        role: 'paciente',
        can_self_book: false,
        data_consent: true,
        created_at: '',
        updated_at: '',
      }
      expect(canSelfBook(profile)).toBe(false)
    })
  })
})
