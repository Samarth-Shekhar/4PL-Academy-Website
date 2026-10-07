import { Link } from 'wouter';
import { Award, ExternalLink } from 'lucide-react';
import { usePublicList } from '@/lib/api';
import { useSeo } from '@/lib/seo';
import { has, val } from '@/lib/format';
import { mediaUrl } from '@/lib/home';
import { PageHero, CardSkeletons, ErrorState, EmptyState, Fact } from '@/components/ui-kit';
import { BookButton } from '@/components/BookCta';

export default function Certifications() {
  useSeo({ title: 'Certifications', description: 'Verified certifications linked to 4PL Academy programs and courses.' });
  const q = usePublicList('certifications');
  const courses = usePublicList('courses').data || [];
  const programs = usePublicList('programs').data || [];
  const list = (q.data || []).filter((c) => c.verified === true);
  return (
    <>
      <PageHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Certifications' }]} eyebrow="Certifications" title="Credentials worth earning" body="Explore professional certifications and the pathways they support." />
      <div className="container-x py-10 sm:py-14">
        {q.isLoading ? <CardSkeletons n={3} /> : q.isError ? <ErrorState onRetry={q.refetch} /> : !list.length ? (
          <EmptyState icon={Award} title="Certifications coming soon" body="Browse professional courses or speak to admissions about credential options." action={<div className="flex flex-wrap justify-center gap-3"><Link href="/professional-courses" className="btn btn-navy">Professional courses</Link><BookButton ctx={{ interestedIn: 'Certification' }} size="" /></div>} />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => {
            const co = courses.find((x) => x.id === c.courseId); const pr = programs.find((x) => x.id === c.programId);
            return (
              <li key={c.id} className="card-s flex flex-col p-5" data-testid={`card-certification-${c.id}`}>
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">{has(c.logo) ? <img src={mediaUrl(c.logo)} alt={`${c.issuer || c.name} logo`} loading="lazy" className="h-full w-full object-contain p-1" /> : <Award className="h-6 w-6 text-gold-deep" aria-hidden="true" />}</div>
                  <h2 className="text-xl leading-snug text-navy">{c.name}</h2>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3"><Fact label="Issuer" value={val(c.issuer)} /><Fact label="Type" value={val(c.credentialType)} /><Fact label="Duration" value={val(c.duration)} /></div>
                {has(c.shortDescription) && <p className="mt-3 text-sm text-foreground/75">{c.shortDescription}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {co && <Link href={`/professional-courses/${co.slug}`} className="btn btn-navy btn-sm flex-1">View course</Link>}
                  {!co && pr && <Link href={`/programs/${pr.slug}`} className="btn btn-navy btn-sm flex-1">View program</Link>}
                  {has(c.websiteUrl) && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><ExternalLink className="h-4 w-4" aria-hidden="true" />Issuer</a>}
                  <BookButton ctx={{ course: co?.name, program: pr?.name, interestedIn: 'Certification' }} className="flex-1" />
                </div>
              </li>
            );
          })}</ul>
        )}
      </div>
    </>
  );
}
