export const DEFAULT_CATEGORIES = [
  'Web App',
  'Mobile App',
  'AI / ML',
  'Game',
  'Design',
  'API / Backend',
  'Other'
];

export const DEFAULT_STATUSES = [
  'in-progress',
  'completed',
  'beta',
  'prototype'
];

export const STATUS_DISPLAY_NAMES: Record<string, string> = {
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'beta': 'Beta',
  'prototype': 'Prototype'
};
export const PLACEHOLDER_IMAGE_URL = '/cyberpunk-placeholder.png';

export const getCategoryPlaceholder = (category: string): string => {
  const cat = category.toLowerCase();
  if (cat.includes('ai') || cat.includes('ml')) {
    return '/category_ai.png';
  } else if (cat.includes('web')) {
    return '/category_web.png';
  } else if (cat.includes('mobile') || cat.includes('app')) {
    return '/category_mobile.png';
  } else if (cat.includes('game') || cat.includes('iot') || cat.includes('hardware')) {
    return '/category_iot.png';
  }
  return PLACEHOLDER_IMAGE_URL;
};

export const COLLECTIONS = {
  PROJECTS: 'projects',
  LIKES: 'likes',
  VIEWS: 'views',
  CONFIG: 'config'
};
