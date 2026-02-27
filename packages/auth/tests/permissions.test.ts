import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions
} from '../permissions'

describe('Permissions', () => {
  it('user role has read permission', () => {
    expect(hasPermission('user', 'read')).toBe(true)
  })

  it('user role does not have write permission', () => {
    expect(hasPermission('user', 'write')).toBe(false)
  })

  it('editor role has read and write', () => {
    expect(hasAllPermissions('editor', ['read', 'write'])).toBe(true)
    expect(hasPermission('editor', 'admin')).toBe(false)
  })

  it('admin role has all permissions', () => {
    expect(hasAllPermissions('admin', ['read', 'write', 'admin'])).toBe(true)
  })

  it('hasAnyPermission works correctly', () => {
    expect(hasAnyPermission('user', ['read', 'admin'])).toBe(true)
    expect(hasAnyPermission('user', ['write', 'admin'])).toBe(false)
  })

  it('getRolePermissions returns correct structure', () => {
    const perms = getRolePermissions('admin')
    expect(perms.role).toBe('admin')
    expect(perms.permissions).toEqual(['read', 'write', 'admin'])
  })
})
