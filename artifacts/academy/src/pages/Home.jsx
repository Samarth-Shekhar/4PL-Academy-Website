import { Link } from 'wouter';
import { Bot } from 'lucide-react';
import { usePublicItem, usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { asset, has } from '@/lib/format';
import { openBot } from '@/lib/events';
import { Skeleton, CardSkeletons, SectionHead, EmptyState } from '@/components/ui-kit';
import { BlogCard } from '@/components/Cards';
import { ProgramVideoHero } from '@/components/home/ProgramVideoHero';
import { Ecosystem } from '@/components/home/Ecosystem';
import { UniversityNetwork } from '@/components/home/UniversityNetwork';
import { ProgramShowcase } from '@/components/home/ProgramShowcase';
import { IndustryLogoMarquee } from '@/components/home/IndustryLogoMarquee';
import { PracticalLearning } from '@/components/home/PracticalLearning';
import { CertificationShowcase } from '@/components/home/CertificationShowcase';
import { LearningJourney } from '@/components/home/LearningJourney';
import { CareerPathway } from '@/components/home/CareerPathway';
import { StudentLifeGallery, GalleryShowcase } from '@/components/home/StudentLifeGallery';
import { TestimonialCarousel } from '@/components/home/TestimonialCarousel';
import { AdmissionTimeline } from '@/components/home/AdmissionTimeline';
import { FinalCta } from '@/components/home/FinalCta';
import { UniversityLogoCarousel } from '@/components/home/UniversityLogoCarousel';
import { FocusPrograms } from '@/components/home/FocusPrograms';
import { ProgramFinder } from '@/components/home/ProgramFinder';
import { GenericSection } from '@/components/home/GenericSection';
import { motion, useReducedMotion } from 'framer-motion';
import { AiLearningStudio } from '@/components/home/AiLearningStudio';

const MAP = { 'university-logos': UniversityLogoCarousel, ecosystem: Ecosystem, universities: UniversityNetwork, programs: ProgramShowcase, industry: IndustryLogoMarquee, practical: PracticalLearning, certifications: CertificationShowcase, journey: LearningJourney, careers: CareerPathway, 'student-life': StudentLifeGallery, gallery: GalleryShowcase, testimonials: TestimonialCarousel, admissions: AdmissionTimeline, 'final-cta': FinalCta };

function Blogs() {
  const q = usePublicList('blogs');
  const list = (q.data || []).slice(0, 3);
  if (q.isLoading) return <section className="container-x py-16"><CardSkeletons n={3} /></section>;
  if (!list.length) return null;
  return (
    <section className="py-16 sm:py-24" aria-label="Blogs and Insights of 4PL Academy">
      <div className="container-x"><SectionHead eyebrow="Insights" title="Blogs and Insights of 4PL Academy"><Link href="/blogs" className="btn btn-outline self-start">All articles</Link></SectionHead></div>
      <div className="container-x grid min-w-0 gap-5 md:grid-cols-3">{list.map((b) => <div key={b.id} className="min-w-0"><BlogCard b={b} compact /></div>)}</div>
    </section>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  const home = usePublicItem('pages', 'home').data;
  const hp = usePublicList('homepage', undefined, { refetchOnWindowFocus: true });
  useSeo({
    title: home?.seoTitle || '4PL Academy | Creating Global Professionals',
    description: home?.seoDescription || 'Industry-integrated education built for real-world careers. Explore degree programs, professional courses and a university directory.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: '4PL Academy', slogan: 'Creating Global Professionals', parentOrganization: { '@type': 'Organization', name: '4PL Consultancy Ltd' }, logo: new URL(asset('images/4pl-logo.jpg'), window.location.origin).href, url: window.location.origin },
  });
  const live = (y) => y.enabled !== false && y.status !== 'archived' && y.status !== 'draft';
  const sections = (hp.data || []).filter((x, _i, all) => !((x.section || x.slug) === 'journey' && all.some((y) => (y.section || y.slug) === 'practical' && y.enabled !== false && y.status !== 'archived' && y.status !== 'draft')) && x.enabled !== false && x.status !== 'archived' && x.status !== 'draft' && (x.section || x.slug) !== 'gallery').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
  const finalIdx = sections.findIndex((x) => (x.section || x.slug) === 'admissions' || (x.section || x.slug) === 'final-cta');
  if (hp.isLoading) return <div><Skeleton className="h-[100svh] rounded-none" /></div>;
  if (!sections.length) {
    return (
      <>
        {!hp.data?.length && <ProgramVideoHero section={null} fallbackTitle={has(home?.name) && home.name.toLowerCase() !== 'home' ? home.name : 'Creating Global Professionals'} fallbackBody={home?.shortDescription || 'Industry-integrated education built for real-world careers.'} />}
        <section className="container-x py-16">
          <EmptyState icon={Bot} title={hp.isError ? 'The full homepage could not load' : 'More of the homepage is on its way'} body="Explore programs and universities directly, or book a counselling session." action={<div className="flex flex-wrap justify-center gap-3"><Link href="/universities" className="btn btn-navy">Find a university</Link><button type="button" onClick={() => openBot()} className="btn btn-outline">Ask ACAD BOT</button>{hp.isError && <button type="button" onClick={() => hp.refetch()} className="btn btn-outline">Retry</button>}</div>} />
        </section>
        <Blogs />
      </>
    );
  }
  const hasPrograms = sections.some((x) => (x.section || x.slug) === 'programs');
  const studioKeys = new Set(['ecosystem', 'practical', 'industry', 'journey']);
  const studioSections = sections.filter((s) => studioKeys.has(s.section || s.slug));
  const studioFirst = studioSections[0]?.id;
  const blogsAt = finalIdx === -1 ? sections.length : finalIdx;
  return (
    <div className="home-page ai-home">
      {sections.map((s, i) => {
        const sectionType = s.section || s.slug;
        if (studioKeys.has(sectionType) && s.id !== studioFirst) return null;
        const C = MAP[sectionType] || GenericSection;
        return <motion.div key={s.id} initial={reduce || sectionType === 'hero' ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.04 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>{i === blogsAt && <Blogs />}{sectionType === 'hero'
          ? <><ProgramVideoHero section={s} fallbackTitle={home?.name} fallbackBody={home?.shortDescription} /><FocusPrograms />{!hasPrograms && <ProgramFinder />}</>
          : s.id === studioFirst ? <AiLearningStudio sections={studioSections} /> : sectionType === 'programs' ? <ProgramFinder s={s} /> : <C s={s} />}</motion.div>;
      })}
      {blogsAt === sections.length && <Blogs />}
    </div>
  );
}
