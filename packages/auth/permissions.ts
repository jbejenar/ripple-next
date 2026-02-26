import type { Role, Permission, RolePermissions } from './types'

const rolePermissionMap: Record<Role, Permission[]> = {
  user: ['read'],
  editor: ['read', 'write'],
  admin: ['read', 'write', 'admin']
}

export function getRolePermissions(role: Role): RolePermissions {
  return {
    role,
    permissions: rolePermissionMap[role] ?? []
  }
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissionMap[role]
  return permissions?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}
