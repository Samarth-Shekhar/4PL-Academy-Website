import { Head, Body, CtaRow } from './shared';
export function GenericSection({ s }) {
  return <section className="container-x py-16 sm:py-24"><Head s={s} /><Body s={s} /><CtaRow s={s} className="mt-6" /></section>;
}
