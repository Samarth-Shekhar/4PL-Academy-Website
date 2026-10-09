import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
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
        <motion.p {...fx(0.05)} className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-gold/50 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] backdrop-blur"><Sparkles className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" /><span className="min-w-0">AI, digital transformation and logistics degrees</span></motion.p>
        <div className="relative min-w-0 lg:min-h-[34rem]">
          <h1 className="ai-title relative z-10 min-w-0">
            {words.map((w, i) => (
              <span key={i} className="block overflow-hidden pb-[0.04em]">
                <motion.span className={cn('block', i === words.length - 1 ? 'text-gold' : 'text-navy')} initial={reduce ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.04 + i * 0.06, duration: .55, ease }}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.div initial={reduce ? false : { opacity: .7, scale: 0.94, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .7, ease }} className="ai-sculpt pointer-events-none">
            <img className="ai-float h-full w-full object-contain" src={mediaUrl('/images/edtech/ai-sculpture-960.webp')} srcSet={`${mediaUrl('/images/edtech/ai-sculpture-640.webp')} 640w, ${mediaUrl('/images/edtech/ai-sculpture-960.webp')} 960w`} sizes="(min-width:1024px) 640px, 80vw" alt="Conceptual sculpture of a navy and gold brain circled by gold orbits, representing artificial intelligence" width="960" height="960" fetchPriority="high" decoding="async" />
          </motion.div>
          <div className="relative z-10 mt-6 max-w-md">
            {has(body) && <motion.p {...fx(0.7)} className="text-base leading-relaxed text-navy/80 sm:text-lg">{body}</motion.p>}
            <motion.div {...fx(0.85)} className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Cta {...first} url={isBook(first) && first.url !== 'bot' ? book : first.url} className="btn-hero" variant="gold" />
              <Cta {...second} url={isBook(second) && second.url !== 'bot' ? book : second.url} variant="outline" className="btn-hero" />
            </motion.div>
          </div>
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
