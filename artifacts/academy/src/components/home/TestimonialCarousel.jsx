import { useRef } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Quote, BadgeCheck, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useVerified, mediaUrl } from '@/lib/home';
import { has, initials } from '@/lib/format';
import { Head, CtaRow } from './shared';

const STUDENT_THOUGHTS = [
  { title: 'Every ambition matters', text: 'Our students bring different interests, strengths and ambitions. At 4PL Academy, we believe choosing a degree should begin with understanding those goals and exploring the options that fit.' },
  { title: 'Clarity builds confidence', text: 'Taking the next step in education can raise many questions. We believe students deserve clear guidance on applications, documents and requirements so they can make informed decisions.' },
  { title: 'Learning beyond the classroom', text: 'We value curiosity and the willingness to put knowledge into practice. For us, meaningful learning connects academic understanding with practical skills and a commitment to keep growing.' },
];

function StudentRating({ value }) {
  if (!(typeof value === 'number' || (typeof value === 'string' && value.trim()))) return null;
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  return <p className="mb-4 flex items-center gap-2 text-sm font-bold text-gold">
    <span aria-hidden="true" className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="relative h-4 w-4"><Star className="absolute h-4 w-4 opacity-35" /><span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.min(1, Math.max(0, rating - i)) * 100}%` }}><Star className="h-4 w-4 max-w-none" fill="currentColor" /></span></span>)}</span>
    <span aria-label={`Rated ${rating} out of 5`}>{rating}/5</span>
  </p>;
}

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
    <section className="testimonial-envelope relative isolate overflow-hidden py-16 text-navy sm:py-20" aria-labelledby="sec-testimonials">
      <div className="container-x">
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div id="sec-testimonials" className="mx-auto max-w-3xl">{items.length ? <><Head s={s} />{has(s.shortDescription) && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy/75">{s.shortDescription}</p>}</> : <><Head s={{ name: 'Our Thoughts About Our Students' }} /><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy/75">At 4PL Academy, we believe every student deserves thoughtful guidance, practical learning and the space to pursue their ambitions.</p></>}</div>
          <div className="flex items-center gap-3">{items.length > 0 && <CtaRow s={s} />}{items.length > 1 && <div className="hidden gap-2 sm:flex"><button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-navy/25 hover:border-gold hover:text-gold-deep" onClick={() => by(-1)} aria-label="Previous testimonials"><ChevronLeft className="h-5 w-5" /></button><button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-navy/25 hover:border-gold hover:text-gold-deep" onClick={() => by(1)} aria-label="Next testimonials"><ChevronRight className="h-5 w-5" /></button></div>}</div>
        </div>
        <div className="envelope-shell relative mt-14 pt-5 sm:px-10 sm:pb-24 sm:pt-10">
          {!items.length ? (
            <div>
              <ul className="envelope-stage grid gap-5 md:grid-cols-3" aria-label="4PL Academy thoughts about our students">
                {STUDENT_THOUGHTS.map((x, i) => (
                  <motion.li key={x.title} initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ delay: i * .12, duration: .6, ease: [0.22, 1, 0.36, 1] }} className="relative z-10">
                    <article className={`stationery stationery-${i} h-full rounded-md border-t-4 border-gold bg-surface p-6 text-navy shadow-lg`} data-testid={`card-student-thought-${i}`}>
                      <Quote className="mb-5 h-8 w-8 text-gold-deep" aria-hidden="true" />
                      <h3 className="font-display text-xl leading-snug">{x.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-foreground/80">{x.text}</p>
                    </article>
                  </motion.li>
                ))}
              </ul>
              <div className="relative z-20 mt-8 text-center"><Link href="/book-counselling" className="btn btn-gold">Request counselling</Link></div>
            </div>
          ) : (
            <div ref={row} className="snap-row -mx-4 cursor-grab select-none px-4 pb-3 active:cursor-grabbing sm:mx-0 sm:px-0" role="region" aria-label="Student testimonials" tabIndex={0} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onKeyDown={(e) => { if (e.key === 'ArrowRight') by(1); if (e.key === 'ArrowLeft') by(-1); }}>
              {items.map((t) => (
                <motion.figure key={t.id} initial={reduce ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .6 }} className="stationery relative z-10 flex w-[18.5rem] flex-col rounded-md border-t-4 border-gold bg-surface p-6 text-navy shadow-lg sm:w-[23rem]" data-testid={`card-testimonial-${t.id}`}>
                  <StudentRating value={t.rating} />
                  <Quote className="h-8 w-8 text-gold" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 font-display text-xl leading-snug">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-navy font-display text-gold">{has(t.image) ? <img src={mediaUrl(t.image)} alt={t.studentName || t.name} className="h-full w-full object-cover" loading="lazy" draggable="false" /> : initials(t.studentName || t.name)}</span>
                    <span className="min-w-0 text-sm"><span className="flex items-center gap-1 font-bold">{t.studentName || t.name}<BadgeCheck className="h-4 w-4 text-gold-deep" aria-label="Approved testimonial" /></span><span className="block text-muted-foreground">{[t.degree, t.universityName, t.year].filter(has).join(' · ')}</span></span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
