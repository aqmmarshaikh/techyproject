import React from 'react';

interface TechItem {
  name: string;
  category: string;
  icon: React.ReactNode;
}

export const TECH_ITEMS: TechItem[] = [
  {
    name: 'Python',
    category: 'Backend / AI',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M63.5 13c-27.4 0-25.8 11.9-25.8 11.9l.1 12.3h26.3v3.7H26.3S12 39.3 12 66.8c0 27.5 12.5 26.5 12.5 26.5h7.5V83c0-10.4 8.9-10.1 8.9-10.1h26.2s8.5.2 8.5-8.3V25.3S66.5 13 63.5 13zm-14.8 8.1c2.6 0 4.7 2.1 4.7 4.7 0 2.6-2.1 4.7-4.7 4.7-2.6 0-4.7-2.1-4.7-4.7 0-2.6 2.1-4.7 4.7-4.7z"
          fill="#3776AB"
        />
        <path
          d="M64.5 115c27.4 0 25.8-11.9 25.8-11.9l-.1-12.3H63.9v-3.7h37.8s14.3 1.6 14.3-25.9c0-27.5-12.5-26.5-12.5-26.5h-7.5v10.3c0 10.4-8.9 10.1-8.9 10.1H50.9s-8.5-.2-8.5 8.3v39.3s-.9 12.3 22.1 12.3zm14.8-8.1c-2.6 0-4.7-2.1-4.7-4.7 0-2.6 2.1-4.7 4.7-4.7 2.6 0 4.7 2.1 4.7 4.7 0 2.6-2.1 4.7-4.7 4.7z"
          fill="#FFD438"
        />
      </svg>
    ),
  },
  {
    name: 'JavaScript',
    category: 'Frontend / Fullstack',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <rect width="128" height="128" rx="16" fill="#F7DF1E" />
        <path
          d="M78.6 98.6c4.6 7.6 10.6 12.4 21.2 12.4 9 0 14.7-4.5 14.7-10.7 0-7.5-6-10.2-16-14.6l-5.5-2.4C77.4 76.5 68 70 68 55c0-14.4 11-25.4 28.3-25.4 12.2 0 21 4.8 26.8 15.3l-12.4 8c-3.1-5.7-6.8-8.2-14.4-8.2-6.5 0-11 4.2-11 9.4 0 6.6 4.3 9.2 14.3 13.5l5.5 2.4c18 7.7 27.5 14.8 27.5 30.6 0 17.5-13.8 26.6-32.2 26.6-18.4 0-29.2-9.1-34.5-20.7l12.7-7.9zM22.5 101.4l13.5-8.2c2.7 4.5 5.2 8.3 10.5 8.3 5.4 0 8.9-2.2 8.9-10.7V31.5h16.8v59.3c0 17.4-10.1 25.2-25.3 25.2-13.6 0-21.7-7.1-24.4-14.6z"
          fill="#000000"
        />
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    category: 'Typed JavaScript',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path
          d="M79.2 100.8c4.3 7 9.8 11.4 19.5 11.4 8.3 0 13.5-4.1 13.5-9.8 0-6.9-5.5-9.4-14.7-13.4l-5.1-2.2C78.1 80.5 69.5 74.5 69.5 60.7c0-13.2 10.1-23.3 26-23.3 11.2 0 19.3 4.4 24.6 14l-11.4 7.3c-2.9-5.2-6.2-7.5-13.2-7.5-6 0-10.1 3.9-10.1 8.6 0 6 3.9 8.4 13.1 12.4l5.1 2.2c16.5 7.1 25.2 13.6 25.2 28.1 0 16.1-12.7 24.4-29.5 24.4-16.9 0-26.8-8.3-31.7-19l11.6-7.1zM24 49.3h45.6V39.4H24v9.9zm16.5 67.8h12.6V49.3H40.5v67.8z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'React',
    category: 'UI Library',
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full" fill="none" aria-hidden="true">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'HTML5',
    category: 'Markup Standard',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path d="M19 113.8L8.7 1h110.6l-10.3 112.8L64 127l-45-13.2z" fill="#E34F26" />
        <path d="M64 117.8l36.5-10.1 8.7-95.7H64v105.8z" fill="#EF652A" />
        <path
          d="M64 47.9H44.6l-1.3-15h20.7V21.4H28.7l3.8 42.9H64V47.9zm0 37.8l-.2.1-17-4.6-1.1-12.2H32.4l2.1 24.3 29.3 8.1.2-.1V85.7z"
          fill="#EBEBEB"
        />
        <path
          d="M63.9 47.9h19.4l-1.8 20.6-17.6 4.8v11.9l29.3-8.1 2.5-27.7.1-1.5 3.8-42.9H63.9v11.5h20.7l-1.3 15H63.9v11.4z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'CSS3',
    category: 'Styling Standard',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path d="M19 113.8L8.7 1h110.6l-10.3 112.8L64 127l-45-13.2z" fill="#1572B6" />
        <path d="M64 117.8l36.5-10.1 8.7-95.7H64v105.8z" fill="#33A9DC" />
        <path
          d="M64 48.6H49.1l-1.1-12.3H64V24.8H34.4l3.4 37.1H64V48.6zm0 37.8l-.2.1-14.7-4-1-10.7H36.7l1.9 21.3 25.2 7 .2-.1V86.4z"
          fill="#EBEBEB"
        />
        <path
          d="M63.9 61.9h14.7l-1.4 15.6-13.3 3.6v11.9l25.1-7 2.7-30.6.3-3.5 3.3-37.1H63.9v11.5h16.7l-1.1 12.3H63.9v11.6z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    category: 'Utility Styling',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M64 32c-17.1 0-27.7 8.5-32 25.6 6.4-8.5 13.9-11.7 22.4-9.6 4.9 1.2 8.3 4.7 12.2 8.6C72.9 63 80.5 70.4 96 70.4c17.1 0 27.7-8.5 32-25.6-6.4 8.5-13.9 11.7-22.4 9.6-4.9-1.2-8.3-4.7-12.2-8.6C87.1 39.4 79.5 32 64 32zM32 66.1c-17.1 0-27.7 8.5-32 25.6 6.4-8.5 13.9-11.7 22.4-9.6 4.9 1.2 8.3 4.7 12.2 8.6C40.9 97.1 48.5 104.5 64 104.5c17.1 0 27.7-8.5 32-25.6-6.4 8.5-13.9 11.7-22.4 9.6-4.9-1.2-8.3-4.7-12.2-8.6C55.1 73.5 47.5 66.1 32 66.1z"
          fill="#06B6D4"
        />
      </svg>
    ),
  },
  {
    name: 'Node.js',
    category: 'JavaScript Runtime',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M64 8.2l48.5 28v56l-48.5 28-48.5-28v-56L64 8.2z"
          fill="#5FA04E"
        />
        <path
          d="M64 19.3L23.2 42.8v47L64 113.3l40.8-23.5v-47L64 19.3zm-5.7 65.6c0 1.9-1.4 3.4-3.3 3.4-1.9 0-3.3-1.5-3.3-3.4V56.6h6.6v28.3zm18 0c0 1.9-1.4 3.4-3.3 3.4-1.9 0-3.3-1.5-3.3-3.4V56.6h6.6v28.3z"
          fill="#333333"
          opacity="0.35"
        />
        <path
          d="M64 42l20.4 11.8v23.6L64 89.2 43.6 77.4V53.8L64 42z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'Firebase',
    category: 'Backend & Database',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M26.2 92.5L42.5 12.3c.5-2.5 3.9-3.3 5.5-1.3l15.8 19.4L26.2 92.5z"
          fill="#FFC400"
        />
        <path
          d="M26.2 92.5l75.6-75.6c1.8-1.8 4.9-.7 5.2 1.8l12.8 73.8-93.6 0z"
          fill="#FFA000"
        />
        <path
          d="M68.7 62.4l14.4-27.7c1.2-2.3 4.6-2.2 5.6.2l31.1 57.6-51.1-30.1z"
          fill="#FF8F00"
        />
        <path
          d="M26.2 92.5l37.8 21.2c2.1 1.2 4.7 1.2 6.8 0l49-21.2-93.6 0z"
          fill="#FFCA28"
        />
      </svg>
    ),
  },
  {
    name: 'Git',
    category: 'Version Control',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M124.7 57.3L70.7 3.3c-4.4-4.4-11.5-4.4-15.9 0L3.3 54.8c-4.4 4.4-4.4 11.5 0 15.9l54 54c4.4 4.4 11.5 4.4 15.9 0l51.5-51.5c4.4-4.4 4.4-11.5 0-15.9z"
          fill="#F05032"
        />
        <path
          d="M87.3 64.9c-2.3-1.3-4.9-1.8-7.5-1.5l-8.6-8.6c.4-1.3.6-2.7.6-4.1 0-7.3-6-13.3-13.3-13.3s-13.3 6-13.3 13.3c0 5.4 3.3 10.1 8 12.1v23.2c-4.7 2-8 6.7-8 12.1 0 7.3 6 13.3 13.3 13.3s13.3-6 13.3-13.3c0-4.3-2.1-8.1-5.3-10.5l8.4-8.4c2.5.6 5.2.4 7.6-1 5.9-3.4 7.9-11 4.5-16.9-1.4-2.4-3.8-4.2-6.7-4.8z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    category: 'Dev Collaboration',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M64 5.3C28.7 5.3 0 34 0 69.3c0 28.3 18.3 52.2 43.8 60.7 3.2.6 4.4-1.4 4.4-3.1 0-1.5-.1-6.6-.1-11.9-17.8 3.9-21.6-7.6-21.6-7.6-2.9-7.4-7.1-9.4-7.1-9.4-5.8-4 .4-3.9.4-3.9 6.4.5 9.8 6.6 9.8 6.6 5.7 9.8 15 7 18.6 5.3.6-4.2 2.2-7 4.1-8.6-14.2-1.6-29.2-7.1-29.2-31.6 0-7 2.5-12.7 6.6-17.2-.7-1.6-2.9-8.1.6-17 0 0 5.4-1.7 17.6 6.6 5.1-1.4 10.6-2.2 16-2.2s10.9.7 16 2.2c12.2-8.3 17.6-6.6 17.6-6.6 3.5 8.9 1.3 15.4.6 17 4.1 4.5 6.6 10.2 6.6 17.2 0 24.6-15 30-29.3 31.6 2.3 2 4.3 5.9 4.3 11.9 0 8.6-.1 15.6-.1 17.7 0 1.7 1.2 3.7 4.4 3.1 25.4-8.5 43.7-32.5 43.7-60.7 0-35.3-28.7-64-64-64z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'Vite',
    category: 'Next-Gen Bundler',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M117.8 19.3L65.5 119.5c-.8 1.5-2.9 1.5-3.7 0L9.8 19.5c-.9-1.7.5-3.7 2.4-3.4l51.5 8.6c.4.1.8.1 1.2 0l50.5-8.8c1.9-.3 3.3 1.7 2.4 3.4z"
          fill="url(#viteGradient1)"
        />
        <path
          d="M87.5 10.7l-47 9.2c-1.8.3-2.7 2.4-1.6 3.8l23.5 30.6c.7 1 2.2 1.1 3.1.2l9.9-9.9c.9-.9 2.4-.6 2.9.6l6.3 15.4c.5 1.3 2.3 1.5 3 .3l18.5-31.5c1-1.7-.3-3.9-2.3-3.6z"
          fill="url(#viteGradient2)"
        />
        <path
          d="M62.6 35.3L46.8 62.5c-.7 1.2.2 2.7 1.6 2.7h13.9l-4.5 25.1c-.3 1.6 1.7 2.6 2.7 1.4l24.4-28.9c1-1.2.2-3.1-1.4-3.1H70.1l7.8-19.1c.6-1.5-1-2.9-2.4-2.2l-12.9 1.6z"
          fill="#FFD427"
        />
        <defs>
          <linearGradient id="viteGradient1" x1="16.4" y1="9.4" x2="114.7" y2="114.3" gradientUnits="userSpaceOnUse">
            <stop stopColor="#41D1FF" />
            <stop offset="1" stopColor="#BD34FE" />
          </linearGradient>
          <linearGradient id="viteGradient2" x1="43.2" y1="13.5" x2="84.9" y2="58.2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFEA83" />
            <stop offset=".5" stopColor="#FFDD35" />
            <stop offset="1" stopColor="#FFA800" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'Next.js',
    category: 'React Framework',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <circle cx="64" cy="64" r="64" fill="#000000" />
        <path
          d="M106.8 111.4L48.2 36H36v56h10.9V49.9l51.5 66c2.9-1.4 5.7-3 8.4-4.5z"
          fill="url(#nextGradient)"
        />
        <path d="M80.9 36h11v36.6h-11z" fill="#FFFFFF" />
        <defs>
          <linearGradient id="nextGradient" x1="68" y1="62.5" x2="98.5" y2="101" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: 'MongoDB',
    category: 'NoSQL Database',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M63.8 3C60.6 6.3 54.2 13 48.7 20.3 35.8 37.6 27.5 56.4 27.5 74.4c0 23.3 15.6 42.1 35.7 48.8.8.3 1.2.2 1.2-.4V3.9c-.1-.7-.4-.8-.6-.9z"
          fill="#47A248"
        />
        <path
          d="M64.2 3c3.2 3.3 9.6 10 15.1 17.3 12.9 17.3 21.2 36.1 21.2 54.1 0 23.3-15.6 42.1-35.7 48.8-.8.3-1.2.2-1.2-.4V3.9c.1-.7.4-.8.6-.9z"
          fill="#499D4A"
        />
        <path
          d="M64.4 125.8c-.3.4-.6.3-.7 0-2.3-5.2-1.3-12.2.7-17.7 1.3 3.6 2.5 8.8 2.2 13.9-.1 1.7-1 3-2.2 3.8z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    category: 'Relational Database',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M63.6 8.5C40 8.5 24 23.6 24 45.4c0 14.5 7.4 26.6 18.2 32.7v18.5c0 2.4 1.7 4.5 4.1 4.9 10.6 1.8 16.5 7.6 17.3 8.4.9.9 2.1 1.4 3.4 1.4s2.5-.5 3.4-1.4c.8-.8 6.7-6.6 17.3-8.4 2.4-.4 4.1-2.5 4.1-4.9V78.1C102.6 72 110 59.9 110 45.4c0-21.8-16-36.9-46.4-36.9zm16.5 44.2c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2 4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2zm-33 0c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2 4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2z"
          fill="#4169E1"
        />
      </svg>
    ),
  },
  {
    name: 'Figma',
    category: 'UI/UX Design',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path d="M42.7 128c11.8 0 21.3-9.5 21.3-21.3V85.3H42.7C30.9 85.3 21.3 94.9 21.3 106.7S30.9 128 42.7 128z" fill="#0ACF83" />
        <path d="M21.3 64c0-11.8 9.5-21.3 21.3-21.3h21.3V85.3H42.7C30.9 85.3 21.3 75.8 21.3 64z" fill="#A259FF" />
        <path d="M21.3 21.3C21.3 9.5 30.9 0 42.7 0h21.3v42.7H42.7C30.9 42.7 21.3 33.1 21.3 21.3z" fill="#F24E1E" />
        <path d="M64 0h21.3c11.8 0 21.3 9.5 21.3 21.3s-9.5 21.3-21.3 21.3H64V0z" fill="#FF7262" />
        <circle cx="85.3" cy="64" r="21.3" fill="#1ABCFE" />
      </svg>
    ),
  },
  {
    name: 'Docker',
    category: 'Containers & Cloud',
    icon: (
      <svg viewBox="0 0 128 128" className="w-full h-full" fill="none" aria-hidden="true">
        <path
          d="M123.6 57.3c-2.4-1.7-7.7-2.6-12.8-1.4-.8-5.3-4.3-9.8-9.2-12.5l-3.3-1.8-2 3.1c-4.4 6.9-4.8 14.8-1.5 21.8-3.4 1.8-8.2 3.3-13.8 3.5H5.8c-1.8 7.3-.2 15.6 4.7 22.8 7.7 11.4 20.8 18.2 39.8 18.2 30.5 0 54.3-15.6 64.9-42.3 5.4.3 10.9-.9 14.5-5.3.6-.8 1.1-1.7 1.4-2.7l-7.5-3.5zM27 50.1h10.9v10.9H27V50.1zm13.6 0h10.9v10.9H40.6V50.1zm0-13.6h10.9v10.9H40.6V36.5zm13.6 13.6h10.9v10.9H54.2V50.1zm0-13.6h10.9v10.9H54.2V36.5zm13.6 13.6h10.9v10.9H67.8V50.1zm0-13.6h10.9v10.9H67.8V36.5zm13.6 13.6h10.9v10.9H81.4V50.1zm-40.8-13.6H51.5v10.9H40.6V36.5z"
          fill="#2496ED"
        />
      </svg>
    ),
  },
];

export const TechMarquee: React.FC = () => {
  // Duplicated track to create a completely seamless infinite loop
  const marqueeItems = [...TECH_ITEMS, ...TECH_ITEMS];

  return (
    <div
      className="w-full relative overflow-hidden py-7 sm:py-9 bg-[#0A1229]/80 border-y border-white/10 backdrop-blur-md select-none group"
      aria-label="Technology Stack Showcase Marquee"
    >
      {/* Subtle Ambient Background Hue */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(255,61,136,0.06),transparent_80%)]"
        aria-hidden="true"
      />

      {/* Understated Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5 text-center">
        <p className="text-[10px] sm:text-[11px] font-decorative uppercase tracking-[0.25em] text-slate-400">
          Technologies That Power Team Innovation
        </p>
      </div>

      {/* Soft Edge Fade Masks (Left & Right gradients) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 z-20 bg-gradient-to-r from-[#0A1229] via-[#0A1229]/80 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 z-20 bg-gradient-to-l from-[#0A1229] via-[#0A1229]/80 to-transparent"
        aria-hidden="true"
      />

      {/* Continuously Scrolling Track (Right to Left) */}
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee-track flex items-center gap-3.5 sm:gap-5 py-1">
          {marqueeItems.map((tech, idx) => (
            <div
              key={`${tech.name}-${idx}`}
              className="flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#FF3D88]/40 transition-all duration-300 shrink-0 shadow-sm group/item"
              title={`${tech.name} (${tech.category})`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 flex items-center justify-center drop-shadow-sm group-hover/item:scale-110 transition-transform duration-200">
                {tech.icon}
              </div>
              <span className="text-xs sm:text-sm font-medium font-sans text-slate-200 group-hover/item:text-white transition-colors whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

