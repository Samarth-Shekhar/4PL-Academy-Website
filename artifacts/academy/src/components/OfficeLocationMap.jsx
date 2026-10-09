import { useState, useId } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { usePublicList } from '@/lib/api';

export function useIndiaOffice() {
  const q = usePublicList('settings', undefined, { staleTime: 120000 });
  return (q.data || []).find(s => s.slug === 'contact-india' && s.verified);
}

export function OfficeLocationMap({ compact = false }) {
  const office = useIndiaOffice();
  const [show, setShow] = useState(true);
  const headingId = useId();
  if (!office?.location) return null;
  // Locate the current street address, not an approximate city-centre pin
  // or an older Google business listing.
  const streetParts = office.location.split('\n')
    .map(line => line.replace(/^.*\bfloor\b,?\s*/i, '').trim())
    .filter(line => line && !/^4PL Academy$/i.test(line))
    .flatMap(line => line.split(','))
    .map(part => part.trim())
    .filter(Boolean);
  // Keep the lookup to building/street/locality: verbose administrative
  // tails and repeated commas can leave Google's embedded search blank.
  // The complete postal address remains displayed above the map.
  const query = encodeURIComponent(streetParts.slice(0, 4).join(', '));
  return (
    <section className={compact ? 'overflow-hidden' : 'card-s overflow-hidden p-5'} aria-labelledby={headingId}>
      <h2 id={headingId} className={`flex items-center gap-2 text-navy ${compact ? 'text-base' : 'text-xl'}`}><MapPin className="h-5 w-5 text-gold-deep" aria-hidden="true" />4PL Academy, {office.city || 'Noida'}</h2>
      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{office.location}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-outline btn-sm" aria-expanded={show} onClick={() => setShow(v => !v)}>{show ? 'Hide map' : 'Show office map'}</button>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${query}`} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-sm" data-testid="link-office-directions">Open directions <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
      </div>
      {show && <iframe title="Google Maps: 4PL Academy Noida office" src={`https://www.google.com/maps?q=${query}&z=16&output=embed`} loading="eager" referrerPolicy="no-referrer-when-downgrade" className={`mt-4 w-full rounded-xl border-0 ${compact ? 'h-40' : 'h-72'}`} data-testid="map-office" />}
      {!compact && <p className="mt-3 text-xs text-muted-foreground">Map results are provided by Google. Confirm the building entrance with the team before visiting.</p>}
    </section>
  );
}
