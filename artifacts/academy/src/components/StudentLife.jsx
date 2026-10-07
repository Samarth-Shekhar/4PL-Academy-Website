import { motion, useReducedMotion } from 'framer-motion';
import { RichText, ListBlock } from '@/components/RichText';
import { splitMarkdown } from '@/components/AboutSections';
import { Link } from 'wouter';
import { FaqList } from '@/components/FaqList';
import { has, lines, asset } from '@/lib/format';
import { mediaUrl } from '@/lib/home';

function Reveal({ children, className = '', id, reduce }) {
  const a = reduce ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } };
  return <motion.section id={id} {...a} className={className}>{children}</motion.section>;
}

export function StudentLife({ page, photos }) {
  const reduce = useReducedMotion();
  const { intro, sections } = splitMarkdown(page.description);
   const image = mediaUrl(page.image);
   const supplied = image ? [{ src: image, alt: photos.find((p) => p.src === image)?.alt || '' }, ...photos.filter((p) => p.src !== image)] : photos;
   const pics = supplied.length ? supplied : [{ src: asset('images/hero-students.webp'), alt: '' }];
   const introPic = pics[0];
   const photoSlots = new Map(pics.slice(1).map((p, i) => [Math.floor(sections.length * (i + 1) / pics.length), p]));
  const hl = lines(page.highlights);
  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        {has(intro) && (
           <Reveal reduce={reduce} className="grid items-center gap-8 pb-10 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-12">
             <div><RichText text={intro} /><div className="mt-5 flex flex-wrap gap-3"><Link href="/programs" className="btn btn-gold">Explore programs</Link><Link href="/contact" className="btn btn-outline">Contact us</Link></div></div>
             <img src={introPic.src} alt={introPic.alt} className="aspect-[16/10] w-full rounded-2xl object-cover" />
          </Reveal>
        )}
        {sections.map((s, i) => {
           const p = photoSlots.get(i);
          const flip = i % 2 === 1;
           const showPic = !!p;
           const columns = !showPic ? '' : flip ? 'md:grid-cols-[20rem_minmax(0,1fr)] md:gap-12' : 'md:grid-cols-[minmax(0,1fr)_20rem] md:gap-12';
          return (
            <Reveal key={s.id} id={s.id} reduce={reduce} className="scroll-mt-28 border-t border-navy/10 py-9 sm:py-12">
               <div className={`grid min-w-0 items-start gap-6 ${columns}`}>
                <div className={`min-w-0 ${flip ? 'md:order-2' : ''}`}>
                  <h2 className="break-words text-2xl font-extrabold text-navy sm:text-3xl">{s.title}</h2>
                  <div className="gold-rule mb-5 mt-3" />
                  <RichText text={s.body} />
                </div>
                {showPic && <img src={p.src} alt={p.alt} loading="lazy" decoding="async" className={`aspect-[4/3] w-full rounded-2xl object-cover ${flip ? 'md:order-1' : ''}`} />}
              </div>
            </Reveal>
          );
        })}
        {hl.length > 0 && <div className="border-t border-navy/10 pt-10"><ListBlock title="Highlights" items={hl} columns /></div>}
        <div className="space-y-2">
          <ListBlock title="Learning pathway" items={lines(page.curriculum)} numbered />
          <ListBlock title="Outcomes" items={lines(page.outcomes)} />
          <ListBlock title="Career pathways" items={lines(page.careerPaths)} columns />
          <ListBlock title="Facilities" items={lines(page.facilities)} columns />
          <FaqList faqs={page.faqs} />
          {lines(page.media).length > 0 && <section className="mt-10"><h2 className="text-2xl text-navy">Media</h2><ul className="mt-3 space-y-1 text-sm">{lines(page.media).map((m, i) => <li key={i}><a className="text-gold-deep underline" href={m} target="_blank" rel="noopener noreferrer">{m}</a></li>)}</ul></section>}
        </div>
      </div>
    </div>
  );
}
