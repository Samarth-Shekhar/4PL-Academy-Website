import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'wouter';
import { Send, X, ExternalLink, Loader2, Headset } from 'lucide-react';
import { useAskAcadBot } from '@workspace/api-client-react';
import { LeadForm } from './LeadForm';
import { errMsg } from '@/lib/api';
import { asset } from '@/lib/format';

const isFallback = (t) => /please contact (?:our|the 4PL Academy) team/i.test(String(t || ''));
const MASCOT = asset('images/acad-bot-mascot.webp');
const hideOnError = (e) => { e.currentTarget.style.visibility = 'hidden'; };

const PROMPTS = ['Which degree programs does 4PL Academy offer?', 'How does admission support work?', 'What professional courses are available?'];

export function AcadBot({ raised = false }) {
  const [open, setOpen] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [lead, setLead] = useState(false);
  const ask = useAskAcadBot();
  const end = useRef(null);
  const send = (m) => {
    const message = (m ?? text).trim();
    if (!message || ask.isPending) return;
    setMsgs((x) => [...x, { role: 'user', text: message }]);
    setText('');
    ask.mutate({ data: { message } }, {
      onSuccess: (r) => setMsgs((x) => [...x, { role: 'bot', text: r.answer, sources: r.sources || [] }]),
      onError: (e) => setMsgs((x) => [...x, { role: 'bot', error: true, text: errMsg(e), sources: [] }]),
    });
  };
  const sendRef = useRef(send); sendRef.current = send;
  useEffect(() => {
    if (!open) return undefined;
    setWelcomeSeen(true);
    document.getElementById('bot-input')?.focus({ preventScroll: true });
    const escape = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  useEffect(() => {
    const h = (e) => { setOpen(true); if (e.detail?.prompt) setTimeout(() => sendRef.current(e.detail.prompt), 50); };
    window.addEventListener('acad:open', h);
    return () => window.removeEventListener('acad:open', h);
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, ask.isPending, lead]);
  const lastQ = [...msgs].reverse().find((m) => m.role === 'user')?.text || '';
  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} type="button" onClick={() => setOpen(true)} className={`fixed bottom-4 right-4 z-40 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-gold/60 bg-white p-1 shadow-lg transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${!welcomeSeen ? 'acad-bot-attention' : ''} ${raised ? 'max-md:bottom-24' : ''}`} aria-label={welcomeSeen ? 'Open Acad Bot assistant' : 'Open Acad Bot assistant, 1 welcome message'} aria-haspopup="dialog" data-testid="button-bot-launch">
            <img src={MASCOT} alt="" width="640" height="585" onError={hideOnError} className="h-full w-full object-contain" />
            {!welcomeSeen && <span aria-hidden="true" data-testid="badge-bot-welcome" className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-gold text-xs font-extrabold text-navy shadow-md">1</span>}
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.section role="dialog" aria-label="ACAD BOT assistant" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.22 }} className="fixed inset-x-2 bottom-2 z-[55] flex h-[min(38rem,calc(100dvh-1rem))] flex-col overflow-hidden rounded-xl border border-navy/20 bg-card shadow-2xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[24rem]" data-testid="panel-bot">
            <div className="navy-surface on-navy flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3"><img src={MASCOT} alt="" width="40" height="40" onError={hideOnError} className="h-10 w-10 rounded-full bg-white object-contain" />
                <div><p className="font-display text-lg leading-none">Acad Bot</p><p className="mt-1 text-xs text-surface/70">Your 4PL Academy Program Assistant</p></div></div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded hover:bg-surface/10" aria-label="Close assistant"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4" aria-live="polite">
              <div className="flex items-end gap-3 rounded-2xl bg-mist p-3"><img src={MASCOT} alt="Acad Bot mascot" width="64" height="64" onError={hideOnError} className="h-16 w-16 shrink-0 object-contain" /><p className="text-sm leading-relaxed text-navy">Hi, my name is Acad Bot. I'm here to help with your requirements. You can ask me about 4PL Academy programs, courses, universities, eligibility or admissions. How can I help you?</p></div>
              {!msgs.length && <div className="flex flex-wrap gap-2">{PROMPTS.map((p) => <button key={p} type="button" onClick={() => send(p)} className="rounded-full border border-navy/25 bg-card px-3 py-2 text-left text-xs font-semibold text-navy hover:border-gold">{p}</button>)}</div>}
              {msgs.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[88%] rounded-lg rounded-tr-none bg-navy p-3 text-sm text-surface' : 'max-w-[92%] rounded-lg rounded-tl-none border border-line bg-card p-3 text-sm leading-relaxed'}>
                  <p className={`whitespace-pre-line ${m.error ? 'text-destructive' : ''}`}>{m.text}</p>
                   {m.role === 'bot' && (isFallback(m.text) || m.error) && <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-gold btn-sm mt-3" data-testid="button-bot-contact">Contact our team</Link>}
                  {m.sources?.length > 0 && <div className="mt-3 border-t border-line pt-2"><p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Sources</p><ul className="mt-1 space-y-1">{m.sources.map((s, k) => <li key={k}><a href={s.url} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep underline-offset-2 hover:underline">{s.name}<ExternalLink className="h-3 w-3" aria-hidden="true" /></a></li>)}</ul></div>}
                </div>
              ))}
              {ask.isPending && <div className="flex w-16 gap-1 rounded-lg bg-mist p-3" role="status" aria-label="ACAD BOT is typing">{[0, 1, 2].map((d) => <span key={d} className="skel h-2 w-2 rounded-full" style={{ animationDelay: `${d * 0.15}s` }} />)}</div>}
              {lead && (
                <div className="rounded-lg border border-gold bg-card p-4">
                  <p className="mb-3 font-display text-lg text-navy">Talk to the admissions team</p>
                  <LeadForm category="chatbot" idPrefix="bot" showMessage={false} defaultMessage={lastQ} submitLabel="Request a call back" onDone={() => {}} />
                </div>
              )}
              <div ref={end} />
            </div>
            <div className="border-t border-line bg-card p-3">
              {!lead && <button type="button" onClick={() => setLead(true)} className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gold-deep"><Headset className="h-4 w-4" aria-hidden="true" /> Connect with admissions</button>}
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <label htmlFor="bot-input" className="sr-only">Ask ACAD BOT</label>
                <input id="bot-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Ask about programs, universities, admissions" className="input" data-testid="input-bot" />
                <button type="submit" disabled={!text.trim() || ask.isPending} className="btn btn-navy px-3" aria-label="Send message" data-testid="button-bot-send">{ask.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
