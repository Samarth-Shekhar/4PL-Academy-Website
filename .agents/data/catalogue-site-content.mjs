import { programmes } from './programme-catalogue.mjs';

const img = key => `/images/programme-brochures/${key}-1280.webp`;
const masterUrl = '/brochures/master-programme-catalogue-2026-27.pdf';
const source = 'Owner-supplied 4PL Academy programme brochures and master catalogue 2026–27.';
const stages = [
  ['Learn', 'Build academic foundations, conceptual clarity and AI/digital literacy.', 'bba-ai'],
  ['Apply', 'Put learning into practice through labs, simulations, case studies and real-world problems.', 'bca-ai'],
  ['Experience', 'Connect with industry mentors, workplace projects and professional environments.', 'academy-global'],
  ['Innovate', 'Use design thinking, prototypes and interdisciplinary startup challenges to turn ideas into value.', 'btech-ai'],
  ['Lead', 'Develop communication, ethical judgement, sustainability awareness and a global mindset.', 'mba-ai'],
].map(([name, description, key]) => ({ name, description, image: img(key), altText: 'Artwork from the academy programme brochures', url: '/about' }));
export const sitePatches = [
  { kind: 'homepage', slug: 'hero', data: { source, shortDescription: '4PL Academy is the learning and development arm of 4PL Consultancy. Explore industry-integrated programmes in AI business, intelligent computing, cloud engineering and global trade—connecting academic foundations with practical experience and a global outlook.' } },
  { kind: 'homepage', slug: 'programs', data: { source, shortDescription: 'Explore five flagship programmes across four schools: AI & Business, Intelligent Computing, Engineering & Emerging Technologies, and Global Trade, Logistics & Supply Chain.' } },
  { kind: 'homepage', slug: 'careers', data: { source, shortDescription: 'Business, computing, engineering and global trade—with AI and practical learning at the centre.', image: img('bba-ai'), items: programmes.map(p => ({ name: p.name, description: p.shortDescription, image: p.image, altText: p.imageAlt, url: `/programs/${p.slug}` })) } },
  { kind: 'homepage', slug: 'practical', name: 'Learn. Apply. Experience. Innovate. Lead.', data: { source, shortDescription: 'IIAP™—the Industry Integrated Academic Programme—connects academic foundations, technology, industry experience, innovation and purposeful leadership.', items: stages, ctaUrl: '/about', ctaLabel: 'Discover the IIAP experience' } },
  { kind: 'homepage', slug: 'journey', name: 'Your IIAP™ Learning Journey', data: { source, items: stages } },
  { kind: 'homepage', slug: 'industry', data: { source, image: img('academy-global'), shortDescription: 'Build capability through industry masterclasses, live projects, simulations, expert mentoring and workplace experience. Your 4PL Professional Passport™ brings together evidence of learning, projects, technology skills and professional development.' } },
  { kind: 'homepage', slug: 'certifications', data: { source, shortDescription: 'Explore programme-specific pathways in AI, analytics, cloud, cybersecurity, DevOps, trade compliance and CPD professional learning. Optional credentials depend on provider requirements, approvals and availability; additional costs may apply.' } },
  { kind: 'homepage', slug: 'student-life', data: { source, shortDescription: 'Innovation labs, hackathons, collaborative projects, student communities, mentoring and the 4PL Startup Challenge—learning that develops capability and confidence beyond the classroom.' } },
  { kind: 'homepage', slug: 'ecosystem', data: { source, shortDescription: 'Academic learning + technology + industry + global exposure: one connected approach to professional development.', items: [
    { name: 'Academic Learning', description: 'Explore five flagship programmes across four future-focused schools.', image: img('bba-ai'), altText: 'AI business programme artwork', url: '/programs' },
    { name: 'Enterprise Technology', description: 'Build programme-specific capabilities with AI, analytics, cloud, cybersecurity and digital trade tools.', image: img('btech-ai'), altText: 'Cloud engineering programme artwork', url: '/about' },
    { name: 'Industry Experience', description: 'Connect concepts with projects, mentoring, masterclasses and workplace learning.', image: img('academy-global'), altText: 'Professional learning artwork from the academy catalogue', url: '/career-industry' },
    { name: 'Global Outlook', description: 'Explore optional international industry and academic exposure alongside a global learning perspective.', image: img('academy-london'), altText: 'London skyline from the academy brochure', url: '/about' },
  ] } },
  { kind: 'homepage', slug: 'final-cta', data: { source, shortDescription: 'Find your programme, explore the IIAP™ learning experience and discuss your next step with the academy team.' } },
  { kind: 'pages', slug: 'home', data: { source, shortDescription: 'Industry-integrated AI, business, computing, engineering and global trade programmes.', seoDescription: 'Explore 4PL Academy’s BBA, MBA, BCA (Hons.) and B.Tech (Hons.) programmes, with AI, industry projects, technology skills and global opportunities.' } },
  { kind: 'pages', slug: 'career-industry', data: { source, highlights: ['AI business & digital transformation', 'Intelligent computing, cloud & cybersecurity', 'AI engineering, DevOps & enterprise infrastructure', 'Trade compliance, global logistics & supply chains'], description: 'Career preparation grows throughout the IIAP™ learning journey. Students develop communication, teamwork, digital productivity and professional behaviour, progressing towards CVs, LinkedIn profiles, project portfolios, networking and interview preparation.\n\n## Demonstrate what you can do\nLive projects, simulations, consulting challenges, technology assignments and capstones create evidence of problem-solving and practical application. The 4PL Professional Passport™ brings these experiences together with academic learning, certifications, technology skills and professional development.\n\n## Workplace experience and employer engagement\nInternships, industry visits, workplace projects, professional shadowing and employer-led sessions help learners understand deadlines, workplace expectations and organisational culture. Career panels, mentoring, presentations and selection preparation connect learning with professional opportunities.\n\n## Professional growth\nBuild communication, adaptability, initiative, ethical judgement, teamwork and digital fluency. Placement or employment is not guaranteed; the focus is on career readiness and meaningful professional experience.' } },
  { kind: 'pages', slug: 'student-life', data: {
    source, image: img('bba-ai'), shortDescription: 'Discover ideas, build practical skills and grow through collaboration, innovation and an AI-enabled learning journey.',
    highlights: ['Innovation labs and hackathons', 'Interdisciplinary Startup Challenge', 'Industry and academic mentoring', 'Professional Passport™ portfolio', 'Student communities and teamwork', 'Optional international exposure'],
    description: 'At 4PL Academy, learning goes beyond textbooks. The IIAP™ experience connects academic development with technology, industry perspectives, creativity and professional growth through five pillars: Learn, Apply, Experience, Innovate and Lead.\n\n## Learning with AI and technology\nExplore generative AI, prompting, AI productivity, responsible use and human–AI collaboration. Each programme has its own Enterprise Technology Kit, from business analytics and CRM tools to programming, cloud platforms, cybersecurity labs and digital trade systems.\n\n## Projects, labs and hackathons\nTurn concepts into practical work through labs, simulations, coding challenges, business consulting exercises and capstones. Build evidence of problem-solving, teamwork and analytical thinking across your learning journey.\n\n## Innovation Lab and the 4PL Startup Challenge\nWork with learners from business, computing, engineering and trade. Discover a real problem, research it, design a solution, build a prototype, test it and present your idea. The Startup Challenge encourages interdisciplinary teams to pitch ventures or solutions to academic and industry perspectives.\n\n## Communities, collaboration and leadership\nStudent communities, technology interests, peer learning and collaborative projects create opportunities to exchange ideas and develop communication. Leadership means contributing thoughtfully, listening to others and approaching challenges with integrity.\n\n## Mentoring and industry perspectives\nAcademic and industry mentors, expert sessions, masterclasses and project reviews help connect learning with professional contexts. Internships and workplace assignments develop understanding of expectations, deadlines and organisational culture.\n\n## Your 4PL Professional Passport™\nKeep a growing record of academic learning, projects, technology skills, certifications, innovation, workplace experience and professional development. Your portfolio helps you explain what you have learned and demonstrate what you can do.\n\n## A global outlook\nOptional global industry and academic exposure may include Dubai, Malta and selected European destinations. Academic visits, industry interaction, networking and cultural learning can broaden your perspective. Availability, travel arrangements and visa requirements vary; additional costs may apply.\n\n## Wellbeing and personal growth\nThe catalogue’s holistic learning approach values wellbeing, creativity, community participation and a balanced lifestyle alongside academic progress. Develop habits of reflection, constructive feedback and responsible collaboration.\n\n## Prepare for your next step\nDevelop your CV, LinkedIn presence, project portfolio and interview confidence. Explore the programmes and speak with a counsellor about your interests, entry requirements and learning priorities.',
  } },
];
export const aboutAppendix = `

## Our Schools & Programmes

Four academic schools connect different disciplines through one IIAP™ philosophy.

- **Artificial Intelligence & Business:** BBA in AI Business & Digital Transformation (3 years) and MBA in AI Business Strategy & Digital Transformation (2 years).
- **Intelligent Computing:** BCA (Hons.) in AI, Cloud Computing & Cybersecurity (4 years).
- **Engineering & Emerging Technologies:** B.Tech (Hons.) in Artificial Intelligence, Cloud Engineering & DevOps (4 years).
- **Global Trade, Logistics & Supply Chain:** BBA (Hons.) in Trade Compliance & Global Logistics (3 years).

[Explore the programmes](/programs) · [Read the complete 2026–27 catalogue](${masterUrl})

## Industry Integrated Academic Programme

IIAP™ is the academic heartbeat of the academy. Its five pillars are **Learn, Apply, Experience, Innovate and Lead**: build foundations, practise through labs and cases, experience professional contexts, create and test solutions, and develop purposeful leadership. Industry projects, mentoring, technology exposure and professional skills complement academic study.

## Enterprise Technology Kit

The ETK is the technology layer of the IIAP experience. Business students explore generative AI, analytics, Microsoft 365, CRM, automation and strategy tools. Computing learners work with programming, databases, Git, cloud platforms, AI development and cybersecurity labs. Engineering learners explore cloud infrastructure, containers, Kubernetes, Infrastructure as Code and DevOps. Trade learners use logistics platforms, documentation systems, ERP concepts, supply-chain analytics and AI-assisted workflows.

AI for every student includes generative AI, prompting and communication, productivity, responsible use and human–AI collaboration.

## 4PL Professional Passport

The 4PL Professional Passport™ progressively brings together academic learning, IIAP experience, professional and technology certifications, industry projects, workplace experience, global exposure, innovation and professional development. It is evidence of what you know and what you can do.

## Innovation & Entrepreneurship

Innovation Lab, design thinking, AI entrepreneurship and venture development help learners identify problems, research markets, build prototypes and test ideas. The interdisciplinary 4PL Startup Challenge encourages students to pitch, build and refine solutions with academic and industry feedback.

## Global Industry & Academic Exposure

The optional programme may include Dubai, Malta and selected European destinations, combining industry visits, university interaction, innovation, networking and cultural learning. Destinations and activities depend on academic relevance, availability, travel and visa arrangements; additional costs may apply.

## Professional Learning & Career Readiness

Programme-specific certification and CPD pathways complement academic study. They vary with provider requirements, approvals, availability and programme structure; additional costs may apply. CVs, LinkedIn profiles, portfolios, presentations, interviews, mentoring and workplace experience support professional development. Placement and employment are not guaranteed.

## Additional Learning Locations

Alongside the C-27, Trapezoid IT Park office in Sector 62, Noida, the catalogue lists a Noida Experience Centre at Unit TF-19, 3rd Floor, Tower C, Spectrum@metro, Phase 1, Sector 75, Noida, and a Bengaluru location at S-2214, Tower B, 2nd Floor, Ardente Office One, Hoodi Circle, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560048. Contact the academy team before planning a visit.
`;
export { masterUrl, img, source };
