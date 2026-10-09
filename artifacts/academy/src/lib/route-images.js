import { asset } from './format';

const IMG = {
  about: 'images/ai-human-learning/lab-collaboration-1280.webp',
  courses: 'images/ai-human-learning/engineering-research-1280.webp',
  ug: 'images/ai-human-learning/robotics-project-1280.webp',
  pg: 'images/ai-human-learning/digital-mentor-1280.webp',
  short: 'images/learning-refresh/build.webp',
  long: 'images/learning-refresh/credentials.webp',
  universities: 'images/university-campus/vgu.webp',
  blogs: 'images/ai-human-learning/engineering-research-1280.webp',
  contact: 'images/ai-human-learning/digital-mentor-1280.webp',
  life: 'images/ai-human-learning/robotics-project-1280.webp',
  programs: 'images/ai-human-learning/lab-collaboration-1280.webp',
  counselling: 'images/page-refresh/students-conversations.webp',
  faq: 'images/page-refresh/partner-workshop.webp',
  compare: 'images/learning-refresh/admission.webp',
  certs: 'images/learning-refresh/choose-program.webp',
};

// Ordered: specific routes before broad prefixes.
const RULES = [
  ['/programs/undergraduate', 'ug'],
  ['/programs/postgraduate', 'pg'],
  ['/courses/short-term', 'short'],
  ['/courses/long-term', 'long'],
  ['/professional-courses/short-term', 'short'],
  ['/professional-courses/long-term', 'long'],
  ['/professional-courses', 'courses'],
  ['/courses', 'courses'],
  ['/programs', 'programs'],
  ['/universities', 'universities'],
  ['/blogs', 'blogs'],
  ['/about', 'about'],
  ['/contact', 'contact'],
  ['/student-life', 'life'],
  ['/book-counselling', 'counselling'],
  ['/counselling', 'counselling'],
  ['/faq', 'faq'],
  ['/compare', 'compare'],
  ['/certifications', 'certs'],
];

export function routeHeroImage(path = '') {
  const p = String(path).split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const hit = RULES.find(([r]) => p === r || p.startsWith(`${r}/`));
  return hit ? asset(IMG[hit[1]]) : asset(IMG.courses);
}
