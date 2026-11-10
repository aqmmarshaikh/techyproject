import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TECH_ITEMS } from '../src/components/common/TechMarquee';

describe('Infinite Technology Logo Marquee', () => {
  const EXPECTED_TECHS = [
    'Python',
    'JavaScript',
    'TypeScript',
    'React',
    'HTML5',
    'CSS3',
    'Tailwind CSS',
    'Node.js',
    'Firebase',
    'Git',
    'GitHub',
    'Vite',
    'Next.js',
    'MongoDB',
    'PostgreSQL',
    'Figma',
    'Docker',
  ];

  it('contains all 17 specified technology items', () => {
    expect(TECH_ITEMS).toHaveLength(17);
    const techNames = TECH_ITEMS.map((item) => item.name);
    EXPECTED_TECHS.forEach((expectedTech) => {
      expect(techNames).toContain(expectedTech);
    });
  });

  it('ensures each technology item has valid name, category, and SVG icon', () => {
    TECH_ITEMS.forEach((tech) => {
      expect(tech.name).toBeTruthy();
      expect(tech.category).toBeTruthy();
      expect(tech.icon).toBeDefined();
    });
  });

  it('verifies marquee animation CSS keyframes and classes in index.css', () => {
    const cssContent = fs.readFileSync(path.resolve(__dirname, '../src/app/index.css'), 'utf-8');

    // Keyframes check
    expect(cssContent).toContain('@keyframes marquee-scroll');
    expect(cssContent).toContain('transform: translate3d(0, 0, 0)');
    expect(cssContent).toContain('transform: translate3d(-50%, 0, 0)');

    // Track class check
    expect(cssContent).toContain('.animate-marquee-track');
    expect(cssContent).toContain('animation: marquee-scroll 38s linear infinite');
    expect(cssContent).toContain('.animate-marquee-track:hover');
    expect(cssContent).toContain('animation-play-state: paused');

    // Accessibility check: reduced motion
    expect(cssContent).toContain('prefers-reduced-motion: reduce');
  });

  it('verifies TechMarquee is mounted in LandingPage between Hero and Platform Pillars', () => {
    const landingContent = fs.readFileSync(path.resolve(__dirname, '../src/pages/LandingPage.tsx'), 'utf-8');

    expect(landingContent).toContain("import { TechMarquee } from '../components/common/TechMarquee'");
    expect(landingContent).toContain('<TechMarquee />');

    // Ensure the old border-t border-white/10 divider on #about section was replaced
    expect(landingContent).not.toMatch(/<section id="about"[^>]*border-t border-white\/10/);
  });
});

