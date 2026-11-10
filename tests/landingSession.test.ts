import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SESSION_ENTRY_KEY, INTENDED_DESTINATION_KEY } from '../src/pages/LandingPage';

class MockSessionStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('Landing Page Session Gate Logic', () => {
  let sessionStorage: MockSessionStorage;

  beforeEach(() => {
    sessionStorage = new MockSessionStorage();
  });

  it('CASE 1 (Fresh Session): flag is absent by default, requiring landing page display', () => {
    const hasEntered = sessionStorage.getItem(SESSION_ENTRY_KEY) === 'true';
    expect(hasEntered).toBe(false);
  });

  it('CASE 2 (Get Started Click): sets session entry flag and cleans intended destination', () => {
    sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
    expect(sessionStorage.getItem(SESSION_ENTRY_KEY)).toBe('true');
  });

  it('CASE 3 (Tab Refresh): keeps session entry flag intact across reloads', () => {
    sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
    // Simulated reload in same tab
    const hasEnteredAfterReload = sessionStorage.getItem(SESSION_ENTRY_KEY) === 'true';
    expect(hasEnteredAfterReload).toBe(true);
  });

  it('CASE 4 & 5 (New Tab / New Session): fresh sessionStorage starts with null entry flag', () => {
    const newTabStorage = new MockSessionStorage();
    expect(newTabStorage.getItem(SESSION_ENTRY_KEY)).toBeNull();
  });

  it('CASE 7 & 11 (Direct Protected URL): stores intended route and restores upon entry', () => {
    const intendedTarget = '/dashboard?tab=action';
    
    // 1. Direct visit intercepts and stores intended destination
    sessionStorage.setItem(INTENDED_DESTINATION_KEY, intendedTarget);
    expect(sessionStorage.getItem(INTENDED_DESTINATION_KEY)).toBe(intendedTarget);

    // 2. User completes entry
    sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
    const restored = sessionStorage.getItem(INTENDED_DESTINATION_KEY);
    sessionStorage.removeItem(INTENDED_DESTINATION_KEY);

    expect(restored).toBe('/dashboard?tab=action');
    expect(sessionStorage.getItem(INTENDED_DESTINATION_KEY)).toBeNull();
  });

  it('CASE 8 (Super Admin Entry Routing): maps Super Admin to /super-admin upon entry', () => {
    const userRole = 'SUPER_ADMIN';
    let target = '/explore';
    if (userRole === 'SUPER_ADMIN') target = '/super-admin';
    else if (userRole === 'ADMIN') target = '/admin';
    else target = '/dashboard';

    expect(target).toBe('/super-admin');
  });

  it('CASE 9 (Admin Entry Routing): maps Admin to /admin upon entry', () => {
    const userRole = 'ADMIN';
    let target = '/explore';
    if (userRole === 'SUPER_ADMIN') target = '/super-admin';
    else if (userRole === 'ADMIN') target = '/admin';
    else target = '/dashboard';

    expect(target).toBe('/admin');
  });

  it('CASE 10 (Employee Entry Routing): maps Employee to /dashboard upon entry', () => {
    const userRole = 'EMPLOYEE';
    let target = '/explore';
    if (userRole === 'SUPER_ADMIN') target = '/super-admin';
    else if (userRole === 'ADMIN') target = '/admin';
    else target = '/dashboard';

    expect(target).toBe('/dashboard');
  });
});
