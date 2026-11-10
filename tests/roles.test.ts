import { describe, it, expect } from 'vitest';
import { resolveUserRoleByEmail } from '../src/utils/roleResolver';

describe('Role Resolution & Access Differentiation', () => {
  it('assigns SUPER_ADMIN exclusively to authorized admin email', () => {
    expect(resolveUserRoleByEmail('ammarshaikh6100@gmail.com')).toBe('SUPER_ADMIN');
    expect(resolveUserRoleByEmail('AMMARSHAIKH6100@GMAIL.COM')).toBe('SUPER_ADMIN');
    expect(resolveUserRoleByEmail('  ammarshaikh6100@gmail.com  ')).toBe('SUPER_ADMIN');
  });

  it('assigns EMPLOYEE strictly to any other employee or random email', () => {
    expect(resolveUserRoleByEmail('employee@company.com')).toBe('EMPLOYEE');
    expect(resolveUserRoleByEmail('john.doe@gmail.com')).toBe('EMPLOYEE');
    expect(resolveUserRoleByEmail('someone.else@organization.org')).toBe('EMPLOYEE');
    expect(resolveUserRoleByEmail('admin@fakecompany.com')).toBe('EMPLOYEE');
    expect(resolveUserRoleByEmail('superadmin@attacker.com')).toBe('EMPLOYEE');
  });

  it('safely defaults null, undefined, or empty inputs to EMPLOYEE', () => {
    expect(resolveUserRoleByEmail(null)).toBe('EMPLOYEE');
    expect(resolveUserRoleByEmail(undefined)).toBe('EMPLOYEE');
    expect(resolveUserRoleByEmail('')).toBe('EMPLOYEE');
  });
});

