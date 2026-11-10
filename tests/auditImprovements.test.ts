import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { interactionRepository } from '../src/repositories/interactionRepository';

describe('Audit Improvements Verification', () => {
  describe('Firestore Interaction Optimization', () => {
    it('provides listUserLikedProjectIds for single batch query of user likes', () => {
      expect(typeof interactionRepository.listUserLikedProjectIds).toBe('function');
    });

    it('verifies ExplorePage uses listUserLikedProjectIds for batch query', () => {
      const exploreContent = fs.readFileSync(
        path.resolve(__dirname, '../src/pages/ExplorePage.tsx'),
        'utf-8'
      );
      expect(exploreContent).toContain('interactionRepository.listUserLikedProjectIds');
      // Verify no sequential Promise.all(items.map(... getLike ...)) exists
      expect(exploreContent).not.toMatch(/Promise\.all\(\s*items\.map\(async\s*\(p\)\s*=>\s*\{\s*const liked = await interactionRepository\.getLike/);
    });
  });

  describe('CSS and Tailwind Class Hygiene', () => {
    it('verifies no non-existent or invalid Tailwind classes exist across src', () => {
      const srcDir = path.resolve(__dirname, '../src');

      function scanDir(dir: string): string[] {
        let files: string[] = [];
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            files = files.concat(scanDir(fullPath));
          } else if (/\.(tsx|ts|css|html)$/.test(item)) {
            files.push(fullPath);
          }
        }
        return files;
      }

      const allFiles = scanDir(srcDir);

      allFiles.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        // Check for non-standard classes
        expect(content).not.toMatch(/\b(w|h|p|m|gap)-18\b/);
        expect(content).not.toMatch(/\bshadow-2xs\b/);
        expect(content).not.toMatch(/\bscale-102\b/);
        expect(content).not.toMatch(/\bring-3\b/);
      });
    });
  });

  describe('Route Code Splitting', () => {
    it('verifies AppRoutes implements React.lazy and Suspense for secondary routes', () => {
      const routesContent = fs.readFileSync(
        path.resolve(__dirname, '../src/routes/AppRoutes.tsx'),
        'utf-8'
      );

      expect(routesContent).toContain('React.lazy');
      expect(routesContent).toContain('<Suspense');
      expect(routesContent).toContain('AdminReviewQueuePage');
      expect(routesContent).toContain('SuperAdminProjectsPage');
    });
  });

  describe('Error Boundary Availability', () => {
    it('verifies ErrorBoundary is mounted in App.tsx', () => {
      const appContent = fs.readFileSync(
        path.resolve(__dirname, '../src/app/App.tsx'),
        'utf-8'
      );

      expect(appContent).toContain('ErrorBoundary');
      expect(appContent).toContain('<ErrorBoundary>');
    });
  });
});
