import { asset } from './format';

export const HUMAN_LEARNING_PHOTOS = [
  { src: asset('images/ai-human-learning/lab-collaboration-1280.webp'), alt: 'Learners collaborating on a robotics project in a technology lab' },
  { src: asset('images/ai-human-learning/robotics-project-1280.webp'), alt: 'Two learners examining a robotics project together' },
  { src: asset('images/ai-human-learning/digital-mentor-1280.webp'), alt: 'A researcher using a computer in a collaborative laboratory' },
  { src: asset('images/ai-human-learning/engineering-research-1280.webp'), alt: 'An engineer researching technology with a laptop in a workshop' },
];

// Refresh known editorial defaults, not institution photos or owner uploads.
export function refreshLearningPhoto(photo) {
  const src = String(photo?.src || '');
  const replacement = [
    [/about-logistics-team|about-warehouse-discussion|shared-ideas|student-life\.webp/, 0],
    [/about-practical-work|student-projects|student-collaboration/, 1],
    [/student-perspectives|editorial\/business|credentials\.webp/, 2],
    [/editorial\/(?:port|trade|warehouse)|learning-refresh\/(?:practice|experience)/, 3],
  ].find(([match]) => match.test(src));
  return replacement ? { ...photo, ...HUMAN_LEARNING_PHOTOS[replacement[1]] } : photo;
}
