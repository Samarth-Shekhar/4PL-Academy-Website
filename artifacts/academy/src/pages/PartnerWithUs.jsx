import { PartnerForm } from '@/components/PartnerForm';
import { ArrowRight } from 'lucide-react';
import { usePublicItem } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { has, asset } from '@/lib/format';
import { mediaUrl } from '@/lib/home';
import { Reveal, Skeleton, ErrorState } from '@/components/ui-kit';
import { RichText } from '@/components/RichText';

export default function PartnerWithUs() {
  const q = usePublicItem('pages', 'for-universities');
  const p = q.data;
  const photos = (Array.isArray(p?.items) ? p.items : []).filter((g) => has(g?.image)).map((g) => ({ src: mediaUrl(g.image), alt: g.altText || '' }));
  const ph = (i) => photos[i] || null;
  const hero = (p && has(p.image) && { src: mediaUrl(p.image), alt: '' }) || ph(0) || { src: asset('images/industry-logistics.webp'), alt: '' };
  useSeo({
    title: 'Partner With Us | 4PL Academy',
    description: has(p?.seoDescription) ? p.seoDescription : 'Universities and organisations can collaborate with 4PL Academy. Share your institution details and collaboration focus with our team.',
  });
  const second = ph(1) || ph(0);
  const third = ph(2);
  return (
    <div>
      <section className="navy-surface on-navy relative isolate overflow-hidden">
        <img src={hero.src} alt={hero.alt} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
        <div className="container-x py-20 sm:py-28">
          <p className="eyebrow mb-5">Partner with us</p>
          <h1 className="display-lg max-w-3xl text-surface">{q.isLoading ? <Skeleton className="h-20 max-w-xl" /> : 'Partner with 4PL Academy'}</h1>
          {has(p?.shortDescription) && <p className="mt-6 max-w-xl text-lg leading-relaxed text-surface/80">{p.shortDescription}</p>}
          <a href="#partner-form" className="btn btn-hero mt-8 inline-flex">Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        </div>
      </section>
      <div className="container-x grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="min-w-0">
          {q.isLoading ? <div className="space-y-3"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-40" /></div> : q.isError ? <ErrorState onRetry={q.refetch} /> : (
            <Reveal>
              {has(p?.description) && <RichText text={p.description} />}
              {second && <img src={second.src} alt={second.alt} loading="lazy" className="mt-10 aspect-[16/10] w-full rounded-3xl object-cover" />}
              {third && <img src={third.src} alt={third.alt} loading="lazy" className="mt-6 aspect-[16/10] w-full rounded-3xl object-cover" />}
            </Reveal>
          )}
        </div>
        <aside id="partner-form" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-navy/10 border-t-4 border-t-gold bg-white p-5 shadow-[0_24px_60px_-40px_hsl(var(--brand-navy)/.6)] sm:p-8">
            <h2 className="text-2xl font-extrabold text-navy">Tell us about your organisation</h2>
            <div className="gold-rule my-4" />
            <PartnerForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
