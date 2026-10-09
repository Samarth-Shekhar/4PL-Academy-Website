// Program titles supplied by the academy owner. University affiliations and
// other facts come exclusively from the corresponding live catalog records.
export const FOCUS_PROGRAMS = [
  {
    slug: 'bba-in-artificial-intelligence-ai',
    title: 'BBA — AI & Digital Transformation',
    key: 'bba-ai',
    image: '/images/edtech/bba-ai-640.webp',
    heroImage: '/images/edtech/bba-ai-1440.webp',
    alt: 'Business analytics dashboards displayed on a laptop',
  },
  {
    slug: 'btech-ai-digital-transformation',
    title: 'B.Tech — AI & Digital Transformation',
    key: 'btech-ai',
    image: '/images/edtech/btech-ai-640.webp',
    heroImage: '/images/edtech/btech-ai-1440.webp',
    alt: 'Industrial robotic arm working on precision manufacturing',
  },
  {
    slug: 'bca-artificial-intelligence',
    title: 'BCA — Artificial Intelligence',
    key: 'bca-ai',
    image: '/images/edtech/bca-ai-640.webp',
    heroImage: '/images/edtech/bca-ai-1440.webp',
    alt: 'Software development code on a computer screen',
  },
  {
    slug: 'sushant-university-bba-in-logistics-supply-chain-management',
    title: 'BBA — Logistics & Supply Chain Management',
    key: 'bba-logistics',
    image: '/images/edtech/bba-logistics-640.webp',
    heroImage: '/images/edtech/bba-logistics-1440.webp',
    alt: 'Shipping containers and cargo operations at a port',
  },
];

export function focusPrograms(list = []) {
  return FOCUS_PROGRAMS.flatMap((focus) => {
    const row = list.find((p) => p.slug === focus.slug && p.status === 'published');
    return row ? [{ ...row, focus: {
      ...focus,
      title: row.name,
      image: row.image || focus.image,
      heroImage: /^\/images\/edtech\/[a-z-]+-(?:640|960|1440)\.webp$/.test(row.image || '')
        ? row.image.replace(/-(?:640|960|1440)\.webp$/, '-1440.webp')
        : row.image || focus.heroImage,
      alt: row.imageAlt || focus.alt,
    } }] : [];
  });
}

export function programFocusImage(program) {
  return program?.image || FOCUS_PROGRAMS.find((focus) => focus.slug === program?.slug)?.image || '';
}
