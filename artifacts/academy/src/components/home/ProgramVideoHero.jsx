import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useVerified, mediaUrl } from '@/lib/home';
import { bookHref } from '@/lib/booking';
import { has } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Cta } from './shared';
import { focusPrograms } from '@/lib/program-focus';

const ease = [0.22, 1, 0.36, 1];
const ai = (p) => /^(bba-in-artificial|btech-ai|bca-artificial)/.test(p.slug);

export function ProgramVideoHero({ section, fallbackTitle, fallbackBody }) {
  const reduce = useReducedMotion();
  const { list: progs } = useVerified('programs');
  const focus = focusPrograms(progs);
  const words = String(section?.name || fallbackTitle || 'Creating Global Professionals').split(/\s+/);
  const body = section?.shortDescription || fallbackBody;
  const book = bookHref({});
  const a = { label: section?.ctaLabel || (section ? '' : 'Explore programs'), url: section?.ctaUrl || '/programs', testid: 'link-hero-programs' };
  const b = { label: section?.secondaryCtaLabel || (section ? '' : 'Book Counselling'), url: section?.secondaryCtaUrl || '/book-counselling', testid: 'button-hero-bot' };
  const isBook = (x) => /counsel|book/i.test(`${x.label} ${x.url}`);
  const [first, second] = isBook(a) ? [b, a] : [a, b];
  const fx = (d) => (reduce ? {} : { initial: { opacity: 1, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: Math.min(d * .15, .15), duration: 0.5, ease } });
  return (
    <section className="ai-hero relative isolate overflow-hidden text-navy" aria-label="4PL Academy introduction" data-testid="section-home-hero">
      <div aria-hidden="true" className="ai-sun" />
      <div aria-hidden="true" className="ai-grid" />
      <div className="container-x relative pb-10 pt-8 sm:pt-12 lg:pb-14">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-12">
          <div className="hero-copy min-w-0">
          <motion.p {...fx(0.05)} className="hero-copy-eyebrow mb-2 max-w-full text-xs font-bold uppercase tracking-[0.13em] text-gold-deep">AI, digital transformation and logistics degrees</motion.p>
            <h1 className="ai-title min-w-0">
              {words.map((w, i) => (
                <span key={i} className="block overflow-hidden pb-[0.04em]">
                  <motion.span className={cn('block', i === words.length - 1 ? 'text-gold' : 'text-navy')} initial={reduce ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.04 + i * 0.06, duration: .55, ease }}>{w}</motion.span>
                </span>
              ))}
            </h1>
             <div className="hero-copy-detail mt-6 max-w-md">
              {has(body) && <motion.p {...fx(0.7)} className="text-base leading-relaxed text-navy/80 sm:text-lg">{body}</motion.p>}
              <motion.div {...fx(0.85)} className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Cta {...first} url={isBook(first) && first.url !== 'bot' ? book : first.url} className="btn-hero" variant="gold" />
                <Cta {...second} url={isBook(second) && second.url !== 'bot' ? book : second.url} variant="outline" className="btn-hero" />
              </motion.div>
            </div>
          </div>
          <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease }} className="ai-cutouts hero-art mx-auto w-full min-w-0" aria-hidden="false">
            <img className="ai-brain" src={mediaUrl('/images/edtech/neural-cutout-960.webp')} srcSet={`${mediaUrl('/images/edtech/neural-cutout-640.webp')} 640w, ${mediaUrl('/images/edtech/neural-cutout-960.webp')} 960w`} sizes="(min-width:1024px) 40vw, 80vw" alt="Navy and gold illustration of a brain wrapped in circuit traces and orbiting gold rings" width="960" height="960" fetchPriority="high" decoding="async" />
            <img className="ai-chip-art" src={mediaUrl('/images/edtech/chip-cutout-640.webp')} srcSet={`${mediaUrl('/images/edtech/chip-cutout-640.webp')} 640w, ${mediaUrl('/images/edtech/chip-cutout-960.webp')} 960w`} sizes="(min-width:1024px) 16vw, 32vw" alt="Navy and gold AI processor chip" width="960" height="960" decoding="async" />
          </motion.div>
        </div>
        {focus.length > 0 && (
          <motion.ul {...fx(1.0)} className="relative z-10 mt-6 flex flex-wrap gap-3" aria-label="Featured programs">
            {focus.map((p, i) => (
              <li key={p.id || p.slug} className="min-w-0">
                <Link href={`/programs/${p.slug}`} aria-label={p.name} className="ai-chip group flex min-w-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold">
                  <span>{p.degree || 'Degree'} · {ai(p) ? 'AI' : 'Logistics'}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-deep transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
