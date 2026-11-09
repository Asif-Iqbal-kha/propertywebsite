import { Link } from 'react-router';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import Logo from '../components/Logo.jsx';
import { PageHeader, Paragraphs, SectionHeading } from '../components/ui.jsx';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { telHref, waHref } from '../lib/contact.js';

export default function About() {
  const { business, about } = useSettings();
  const brand = [business.name, business.officeName].filter(Boolean).join(' ');

  return (
    <>
      <Seo title="About the Site Office" description={`About the ${brand}, Mardan.`} />
      <PageHeader eyebrow="About us" title={about.heading || brand} crumbs={[{ label: 'About' }]} />

      <section className="bg-ivory py-16 sm:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">{brand}</p>
            <Paragraphs text={about.body} className="mt-6 text-lg leading-relaxed text-ink-600" />
            <Link to="/properties" className="btn btn-dark mt-8">
              Browse properties <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-5">
            <div className="gold-frame p-7 text-white sm:p-9">
              <Logo size="lg" />
              <ul className="mt-8 space-y-4 text-sm">
                <li>
                  <a href={telHref(business.phone)} className="flex items-center gap-3 hover:text-gold-200">
                    <Phone className="h-4 w-4 text-gold-400" />
                    <span className="text-base font-semibold">{business.phoneDisplay}</span>
                  </a>
                </li>
                <li>
                  <a href={waHref(business.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-gold-200">
                    <WhatsAppIcon className="h-4 w-4 text-[#3ad07a]" /> WhatsApp the office
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/75">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> {[business.address, business.city].filter(Boolean).join(', ')}
                </li>
                {business.email && (
                  <li>
                    <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-white/75 hover:text-gold-200">
                      <Mail className="h-4 w-4 text-gold-400" /> {business.email}
                    </a>
                  </li>
                )}
                {business.officeHours && (
                  <li className="flex items-center gap-3 text-white/75">
                    <Clock className="h-4 w-4 text-gold-400" /> {business.officeHours}
                  </li>
                )}
              </ul>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <a href={telHref(business.phone)} className="btn btn-gold btn-sm">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <Link to="/contact?visit=1" className="btn btn-glass btn-sm">
                  Book a visit
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {about.services?.length > 0 && (
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <div className="container-x relative">
            <SectionHeading dark eyebrow="How we help" title="What the site office can do for you" />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {about.services.map((s, i) => (
                <Reveal key={s.title} delay={i * 90} className="glass rounded-3xl p-8">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
                    <Icon name={s.icon} />
                  </span>
                  <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-white/60">{s.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
