import { useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Quote, BadgeCheck } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { MovingCards } from './MovingCards';
import { useVerified, mediaUrl } from '@/lib/home';
import { has, initials } from '@/lib/format';
import { Head, Body, CtaRow } from './shared';

const STUDENT_THOUGHTS = [
  { title: 'Every ambition matters', text: 'Our students bring different interests, strengths and ambitions. At 4PL Academy, we believe choosing a degree should begin with understanding those goals and exploring the options that fit.' },
  { title: 'Clarity builds confidence', text: 'Taking the next step in education can raise many questions. We believe students deserve clear guidance on applications, documents and requirements so they can make informed decisions.' },
  { title: 'Learning beyond the classroom', text: 'We value curiosity and the willingness to put knowledge into practice. For us, meaningful learning connects academic understanding with practical skills and a commitment to keep growing.' },
];

export function TestimonialCarousel({ s }) {
  const { list } = useVerified('testimonials');
  const reduce = useReducedMotion();
  const row = useRef(null);
  const drag = useRef(null);
  const by = (d) => row.current?.scrollBy({ left: d * 380, behavior: reduce ? 'auto' : 'smooth' });
  const items = list.filter((t) => has(t.quote));
  const down = (e) => { if (e.pointerType !== 'mouse') return; drag.current = { x: e.clientX, l: row.current.scrollLeft, moved: false }; };
  const move = (e) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 4) { d.moved = true; row.current.style.scrollSnapType = 'none'; row.current.scrollLeft = d.l - dx; } };
  const up = () => { drag.current = null; if (row.current) row.current.style.scrollSnapType = ''; };
  return (
    <section className="navy-surface on-navy py-20 sm:py-28" aria-labelledby="sec-testimonials">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div id="sec-testimonials">{items.length ? <><Head s={s} light /><Body s={s} light /></> : <><Head s={{ name: 'Our Thoughts About Our Students' }} light /><p className="mt-5 max-w-2xl text-lg leading-relaxed text-surface/80">At 4PL Academy, we believe every student deserves thoughtful guidance, practical learning and the space to pursue their ambitions.</p></>}</div>
          <div className="flex items-center gap-3">{items.length > 0 && <CtaRow s={s} light />}{items.length > 1 && <div className="hidden gap-2 sm:flex"><button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-surface/40 hover:border-gold hover:text-gold" onClick={() => by(-1)} aria-label="Previous testimonials"><ChevronLeft className="h-5 w-5" /></button><button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-surface/40 hover:border-gold hover:text-gold" onClick={() => by(1)} aria-label="Next testimonials"><ChevronRight className="h-5 w-5" /></button></div>}</div>
        </div>
        <div className="mt-10">
          {!items.length ? (
            <div>
              <MovingCards label="4PL Academy thoughts about our students" items={STUDENT_THOUGHTS} render={(x) => (
                <article className="flex h-full w-[18.5rem] flex-col rounded-lg bg-surface p-6 text-navy sm:w-[22rem]">
                  <span className="mb-5 h-1 w-10 rounded-full bg-gold" aria-hidden="true" />
                  <h3 className="font-display text-xl leading-snug">{x.title}</h3>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-foreground/80">{x.text}</p>
                </article>
              )} />
              <Link href="/book-counselling" className="btn btn-gold mt-2">Request counselling</Link>
            </div>
          ) : (
            <div ref={row} className="snap-row -mx-4 cursor-grab select-none px-4 pb-3 active:cursor-grabbing sm:mx-0 sm:px-0" role="region" aria-label="Student testimonials" tabIndex={0} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onKeyDown={(e) => { if (e.key === 'ArrowRight') by(1); if (e.key === 'ArrowLeft') by(-1); }}>
              {items.map((t) => (
                <figure key={t.id} className="flex w-[18.5rem] flex-col rounded-lg bg-surface p-6 text-navy sm:w-[23rem]" data-testid={`card-testimonial-${t.id}`}>
                  <Quote className="h-8 w-8 text-gold" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 font-display text-xl leading-snug">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-navy font-display text-gold">{has(t.image) ? <img src={mediaUrl(t.image)} alt={t.studentName || t.name} className="h-full w-full object-cover" loading="lazy" draggable="false" /> : initials(t.studentName || t.name)}</span>
                    <span className="min-w-0 text-sm"><span className="flex items-center gap-1 font-bold">{t.studentName || t.name}<BadgeCheck className="h-4 w-4 text-gold-deep" aria-label="Approved testimonial" /></span><span className="block text-muted-foreground">{[t.degree, t.universityName, t.year].filter(has).join(' · ')}</span></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
