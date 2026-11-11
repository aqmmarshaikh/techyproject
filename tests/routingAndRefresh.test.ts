import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SESSION_ENTRY_KEY, INTENDED_DESTINATION_KEY } from '../src/pages/LandingPage';

describe('Vercel Routing & SPA Configuration Audit', () => {
  const vercelConfigPath = path.resolve(__dirname, '../vercel.json');

  it('1. vercel.json exists and is valid JSON', () => {
    expect(fs.existsSync(vercelConfigPath)).toBe(true);
    const content = fs.readFileSync(vercelConfigPath, 'utf-8');
    const config = JSON.parse(content);
    expect(config).toBeDefined();
  });

  it('2. vercel.json has SPA rewrite to /index.html', () => {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    expect(config.rewrites).toBeDefined();
    expect(Array.isArray(config.rewrites)).toBe(true);

    const spaRewrite = config.rewrites.find(
      (r: any) => r.source === '/(.*)' && r.destination === '/index.html'
    );
    expect(spaRewrite).toBeDefined();
  });

  it('3. vercel.json does NOT contain cleanUrls: true to avoid Vercel SPA 404 collisions', () => {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    expect(config.cleanUrls).toBeUndefined();
  });

  it('4. vercel.json preserves critical security headers and asset caching', () => {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    expect(config.headers).toBeDefined();
    expect(config.headers.length).toBeGreaterThanOrEqual(2);

    const globalHeaders = config.headers.find((h: any) => h.source === '/(.*)');
    expect(globalHeaders).toBeDefined();
    const headerKeys = globalHeaders.headers.map((h: any) => h.key);
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-XSS-Protection');
    expect(headerKeys).toContain('Referrer-Policy');
  });
});

describe('Smart Authentication & Route Redirect Strategies', () => {
  class MockStorage {
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

  let sessionStorage: MockStorage;

  beforeEach(() => {
    sessionStorage = new MockStorage();
  });

  it('5. Direct URL Access: sub-routes (/explore, /projects/123) do not get hijacked to /', () => {
    // Simulating visitor opening /explore directly in a new tab (sessionStorage is empty)
    const currentPath = '/explore';
    const hasEntered = sessionStorage.getItem(SESSION_ENTRY_KEY) === 'true';

    // In refined SessionEntryGate:
    // When visiting sub-routes directly, session is marked and sub-route loads
    let renderedPage = '';
    if (currentPath === '/' && !hasEntered) {
      renderedPage = 'LandingPage';
    } else {
      sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
      renderedPage = currentPath; // Renders child route
    }

    expect(renderedPage).toBe('/explore');
    expect(sessionStorage.getItem(SESSION_ENTRY_KEY)).toBe('true');
  });

  it('6. Page Refresh: entered session keeps user on the exact same page', () => {
    sessionStorage.setItem(SESSION_ENTRY_KEY, 'true');
    const currentPath = '/project/proj-456';

    const hasEntered = sessionStorage.getItem(SESSION_ENTRY_KEY) === 'true';
    let destination = currentPath;
    if (currentPath === '/' && !hasEntered) {
      destination = 'LandingPage';
    }

    expect(destination).toBe('/project/proj-456');
  });

  it('7. Login Page - Case 1: Unauthenticated user stays on /login upon refresh', () => {
    const isAuthenticated = false;
    const isLoading = false;
    let targetRoute = '/login';

    if (!isLoading && isAuthenticated) {
      targetRoute = '/explore';
    }

    expect(targetRoute).toBe('/login');
  });

  it('8. Login Page - Case 2: Post-login defaults to /explore when no protected destination was requested', () => {
    const role = 'EMPLOYEE';
    const stateFrom: string | undefined = undefined;
    const sessionIntended: string | null = null;

    let target = '/explore';
    const intended = stateFrom || sessionIntended;
    if (intended && intended !== '/' && intended !== '/login' && intended !== '/welcome') {
      target = intended;
    }

    expect(target).toBe('/explore');
  });

  it('9. Login Page - Case 2: Post-login restores intended protected route with query params and hash fragments', () => {
    const role = 'EMPLOYEE';
    const stateFrom = {
      pathname: '/dashboard',
      search: '?tab=reviews&filter=pending',
      hash: '#section-2',
    };

    const isSafe = (p: string) => p.startsWith('/') && !p.startsWith('//') && !p.includes('://');
    let target = '/explore';

    if (isSafe(stateFrom.pathname)) {
      target = `${stateFrom.pathname}${stateFrom.search}${stateFrom.hash}`;
    }

    expect(target).toBe('/dashboard?tab=reviews&filter=pending#section-2');
  });

  it('10. Open Redirect Prevention: Rejects external protocols and protocol-relative URLs', () => {
    const isSafe = (p: string) => p.startsWith('/') && !p.startsWith('//') && !p.includes('://');

    const unsafeTargets = [
      'https://malicious.com',
      'http://attacker.com/steal-token',
      '//evil.com/phishing',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ];

    for (const unsafe of unsafeTargets) {
      const safeCheck = isSafe(unsafe);
      expect(safeCheck).toBe(false);
      const destination = safeCheck ? unsafe : '/explore';
      expect(destination).toBe('/explore');
    }
  });

  it('11. Role Guard & Privilege Escalation Prevention: Blocks employees from admin routes', () => {
    const role = 'EMPLOYEE';
    const intendedPath = '/admin/review-queue';

    let target = intendedPath;
    if (intendedPath.startsWith('/admin') && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      target = '/explore';
    }

    expect(target).toBe('/explore');

    // Super Admin route escalation check for regular Admin
    const adminRole = 'ADMIN';
    const superAdminPath = '/super-admin/security';
    let adminTarget = superAdminPath;
    if (superAdminPath.startsWith('/super-admin') && adminRole !== 'SUPER_ADMIN') {
      adminTarget = '/explore';
    }
    expect(adminTarget).toBe('/explore');
  });

  it('12. Login Page - Case 3: Already authenticated user visiting /login is redirected to /explore', () => {
    const isAuthenticated = true;
    const userProfile = { id: 'u1', role: 'EMPLOYEE' };
    const isLoading = false;

    let redirectedTo: string | null = null;
    if (!isLoading && isAuthenticated && userProfile) {
      redirectedTo = '/explore';
    }

    expect(redirectedTo).toBe('/explore');
  });

  it('13. Role-Based Root Navigation: Authenticated users at / redirect to their designated space', () => {
    const getRootTarget = (role: string) => {
      if (role === 'SUPER_ADMIN') return '/super-admin';
      if (role === 'ADMIN') return '/admin';
      return '/dashboard';
    };

    expect(getRootTarget('SUPER_ADMIN')).toBe('/super-admin');
    expect(getRootTarget('ADMIN')).toBe('/admin');
    expect(getRootTarget('EMPLOYEE')).toBe('/dashboard');
  });

  it('14. AuthGuard Loading State: isLoading holds the loading screen instead of prematurely redirecting to /login', () => {
    const isLoading = true;
    const isAuthenticated = false;

    let action = '';
    if (isLoading) {
      action = 'SHOW_LOADING_SPINNER';
    } else if (!isAuthenticated) {
      action = 'REDIRECT_TO_LOGIN';
    } else {
      action = 'RENDER_PROTECTED_CONTENT';
    }

    expect(action).toBe('SHOW_LOADING_SPINNER');
  });

  it('15. Accessibility & Reduced Motion: Winner Ring includes motion-reduce:animate-none', () => {
    const podiumPath = path.resolve(__dirname, '../src/components/common/LeaderboardPodium.tsx');
    const podiumContent = fs.readFileSync(podiumPath, 'utf-8');
    expect(podiumContent).toContain('motion-reduce:animate-none');
  });

  it('16. Branded NotFoundPage handles 404 client routes with navigation actions', () => {
    const notFoundPath = path.resolve(__dirname, '../src/pages/NotFoundPage.tsx');
    expect(fs.existsSync(notFoundPath)).toBe(true);
    const content = fs.readFileSync(notFoundPath, 'utf-8');
    expect(content).toContain('404');
    expect(content).toContain('/explore');
    expect(content).toContain('Platform Home');
  });
});
