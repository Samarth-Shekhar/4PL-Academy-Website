import { Link } from 'wouter';
import { usePublicItem } from '@/lib/api';
import { useSeo, seoFrom } from '@/lib/seo';
import { PageHero, Skeleton } from '@/components/ui-kit';
import { RichText } from '@/components/RichText';

export default function Legal({ slug, title }) {
  const q = usePublicItem('pages', slug);
  const p = q.data;
  useSeo({ ...seoFrom(p, { title, description: `${title} information from 4PL Academy.` }), robots: p ? (p.robots || 'index, follow') : 'noindex, follow' });
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: title }]} eyebrow="4PL Academy" title={p?.name || title} body={p?.shortDescription || 'Official information from the 4PL Academy team.'} />
      <section className="container-x py-12 sm:py-16">
        {q.isLoading ? <Skeleton className="h-64" /> : p?.description ? <div className="story-body mx-auto max-w-3xl"><RichText text={p.description} /></div> : (
          <div className="card-s mx-auto max-w-3xl p-6 sm:p-10">
            <h2 className="text-2xl text-navy">Approved policy content is not available here yet</h2>
            <p className="mt-3 text-muted-foreground">Please contact the 4PL Academy team for the current {title.toLowerCase()}. This page does not substitute for an approved policy.</p>
            <Link href="/contact" className="btn btn-navy mt-6">Contact 4PL Academy</Link>
            {q.isError && <button type="button" className="btn btn-outline ml-0 mt-3 sm:ml-3 sm:mt-6" onClick={() => q.refetch()}>Check again</button>}
          </div>
        )}
      </section>
    </>
  );
}
