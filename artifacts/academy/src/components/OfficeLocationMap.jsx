import { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { usePublicList } from '@/lib/api';

export function useIndiaOffice() {
  const q = usePublicList('settings', undefined, { staleTime: 120000 });
  return (q.data || []).find(s => s.slug === 'contact-india' && s.verified);
}

export function OfficeLocationMap() {
  const office = useIndiaOffice();
  const [show, setShow] = useState(false);
  if (!office?.location) return null;
  const query = encodeURIComponent(office.location);
  return (
    <section className="card-s overflow-hidden p-5" aria-labelledby="office-map-title">
      <h2 id="office-map-title" className="flex items-center gap-2 text-xl text-navy"><MapPin className="h-5 w-5 text-gold-deep" aria-hidden="true" />4PL Academy, {office.city || 'Noida'}</h2>
      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{office.location}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-outline btn-sm" aria-expanded={show} onClick={() => setShow(v => !v)}>{show ? 'Hide map' : 'Show office map'}</button>
        <a href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-sm">Open directions <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
      </div>
      {show && <iframe title="Map search for 4PL Academy Noida office" src={`https://maps.google.com/maps?q=${query}&output=embed`} loading="lazy" referrerPolicy="no-referrer" className="mt-4 h-64 w-full rounded-xl border-0" />}
      <p className="mt-3 text-xs text-muted-foreground">Map results are provided by Google. Confirm the building entrance with the team before visiting.</p>
    </section>
  );
}
