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
import { GenericSection } from '@/components/home/GenericSection';

const MAP = { ecosystem: Ecosystem, universities: UniversityNetwork, programs: ProgramShowcase, industry: IndustryLogoMarquee, practical: PracticalLearning, certifications: CertificationShowcase, journey: LearningJourney, careers: CareerPathway, 'student-life': StudentLifeGallery, gallery: GalleryShowcase, testimonials: TestimonialCarousel, admissions: AdmissionTimeline, 'final-cta': FinalCta };

function Blogs() {
  const q = usePublicList('blogs');
  const list = (q.data || []).slice(0, 3);
  if (q.isLoading) return <section className="container-x py-16"><CardSkeletons n={3} /></section>;
  if (!list.length) return null;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHead eyebrow="Insights" title="From the 4PL Academy desk"><Link href="/blogs" className="btn btn-outline self-start">All articles</Link></SectionHead>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BlogCard key={b.id} b={b} />)}</div>
    </section>
  );
}

export default function Home() {
  const home = usePublicItem('pages', 'home').data;
  const hp = usePublicList('homepage', undefined, { refetchOnWindowFocus: true });
  useSeo({
    title: home?.seoTitle || '4PL Academy | Creating Global Professionals',
    description: home?.seoDescription || 'Industry-integrated education built for real-world careers. Explore degree programs, professional courses and a university directory.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: '4PL Academy', slogan: 'Creating Global Professionals', parentOrganization: { '@type': 'Organization', name: '4PL Consultancy Ltd' }, logo: new URL(asset('images/4pl-logo.jpg'), window.location.origin).href, url: window.location.origin },
  });
  const sections = (hp.data || []).filter((x) => x.enabled !== false && x.status !== 'archived' && x.status !== 'draft').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
  const finalIdx = sections.findIndex((x) => (x.section || x.slug) === 'final-cta');
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
  const blogsAt = finalIdx === -1 ? sections.length : finalIdx;
  return (
    <>
      {sections.map((s, i) => {
        const sectionType = s.section || s.slug;
        const C = MAP[sectionType] || GenericSection;
        return <div key={s.id}>{i === blogsAt && <Blogs />}{sectionType === 'hero'
          ? <ProgramVideoHero section={s} fallbackTitle={home?.name} fallbackBody={home?.shortDescription} />
          : <C s={s} />}</div>;
      })}
      {blogsAt === sections.length && <Blogs />}
    </>
  );
}
