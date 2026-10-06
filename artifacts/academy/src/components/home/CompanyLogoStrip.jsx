const LOGOS = [
  ['KPMG', 'kpmg.svg'], ['DHL', 'dhl.svg'], ['FedEx', 'fedex.svg'], ['TCS', 'tcs.png'],
  ['Amazon', 'amazon.svg'], ['Google', 'google.svg'], ['Meta', 'meta.png'], ['Flipkart', 'flipkart.svg'],
];
const base = `${import.meta.env.BASE_URL}images/company-logos/`;

function Item({ n, f, hidden }) {
  return (
    <li className="logo-flow-item" aria-hidden={hidden ? 'true' : undefined}>
      <img src={`${base}${f}`} alt={hidden ? '' : `${n} logo`} className="max-h-12 w-auto max-w-[9rem] object-contain sm:max-h-14" loading="lazy" draggable="false" />
    </li>
  );
}

export function CompanyLogoStrip({ label }) {
  return (
    <div data-testid="company-logo-strip">
      {label && <p className="eyebrow mb-2">{label}</p>}
      <h3 className="text-xl text-navy sm:text-2xl">Examples of business, logistics, technology and retail companies</h3>
      <div className="logo-flow mt-6 rounded-lg border border-line bg-card py-7" role="group" aria-label="Company logos">
        <ul className="logo-flow-track">
          {LOGOS.map(([n, f]) => <Item key={n} n={n} f={f} />)}
          {LOGOS.map(([n, f]) => <Item key={`d${n}`} n={n} f={f} hidden />)}
        </ul>
      </div>
    </div>
  );
}
