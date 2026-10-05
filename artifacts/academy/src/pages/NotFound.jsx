import { Link } from 'wouter';
import { Compass } from 'lucide-react';
import { useSeo } from '@/lib/seo';

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true });
  return (
    <div className="container-x grid min-h-[60dvh] place-items-center py-16 text-center">
      <div>
        <Compass className="mx-auto h-12 w-12 text-gold-deep" aria-hidden="true" />
        <p className="eyebrow mt-4">Error 404</p>
        <h1 className="mt-2 text-4xl text-navy sm:text-5xl">This page is off the map</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">The page you are looking for may have moved, been unpublished, or never existed.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/" className="btn btn-navy">Back to home</Link><Link href="/programs" className="btn btn-outline">Explore programs</Link></div>
      </div>
    </div>
  );
}
