export function bookHref({ program, university, course, interestedIn } = {}) {
  const p = new URLSearchParams();
  if (program) p.set('program', program);
  if (university) p.set('university', university);
  if (course) p.set('course', course);
  if (interestedIn) p.set('interestedIn', interestedIn);
  const s = p.toString();
  return `/book-counselling${s ? `?${s}` : ''}`;
}
export const INTERESTS = ['Undergraduate program', 'Postgraduate program', 'Professional course', 'Certification', 'Career pathway', 'Not sure yet'];
export const QUALIFICATIONS = ['10th pass', '12th pass', 'Diploma', 'Bachelor degree (pursuing)', 'Bachelor degree', 'Master degree', 'Working professional', 'Other'];

const UTM_KEYS = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
let attribution = '';
// Capture tagged entry pages, not just the final form page. Keep the last tagged
// entry for this session; untagged internal navigation must not clear it.
export function captureAttribution(search = typeof window === 'undefined' ? '' : window.location.search) {
  const entry = new URLSearchParams(search);
  const campaign = new URLSearchParams();
  UTM_KEYS.forEach(key => { if (entry.get(key)) campaign.set(key,entry.get(key).slice(0,500)); });
  if (campaign.size) {
    attribution = campaign.toString();
    try { sessionStorage.setItem('4pl-utm',attribution); } catch { /* In-memory attribution remains available when storage is blocked. */ }
  } else if (!attribution) {
    try { attribution = sessionStorage.getItem('4pl-utm') || ''; } catch { /* Storage is optional. */ }
  }
  return attribution || undefined;
}
