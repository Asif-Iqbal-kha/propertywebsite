import { useSearchParams } from 'react-router';
import { Clock, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Reveal from '../components/Reveal.jsx';
import MapEmbed from '../components/MapEmbed.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import { PageHeader } from '../components/ui.jsx';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { mapsLink, smsHref, telHref, waHref } from '../lib/contact.js';

export default function Contact() {
  const { business } = useSettings();
  const [params] = useSearchParams();
  const visit = params.get('visit') === '1';

  const methods = [
    { icon: Phone, label: 'Call the site office', value: business.phoneDisplay, href: telHref(business.phone), accent: 'from-gold-300 to-gold-600 text-ink-950' },
    { icon: WhatsAppIcon, label: 'WhatsApp', value: 'Chat with the office', href: waHref(business.whatsapp), external: true, accent: 'from-[#3ad07a] to-[#1fa855] text-white' },
    { icon: MessageSquare, label: 'Text message (SMS)', value: business.phoneDisplay, href: smsHref(business.phone), accent: 'from-ink-600 to-ink-800 text-gold-200' },
    { icon: MapPin, label: 'Location', value: [business.address, business.city].filter(Boolean).join(', '), href: mapsLink(business.address || business.mapQuery), external: true, accent: 'from-ink-600 to-ink-800 text-gold-200' },
    business.email && { icon: Mail, label: 'Email', value: business.email, href: `mailto:${business.email}`, accent: 'from-ink-600 to-ink-800 text-gold-200' },
    business.officeHours && { icon: Clock, label: 'Office hours', value: business.officeHours, accent: 'from-ink-600 to-ink-800 text-gold-200' },
  ].filter(Boolean);

  return (
    <>
      <Seo title="Contact & Site Visits" description={`Call ${business.phoneDisplay}, WhatsApp or book a site visit with the ${business.name} site office.`} />
      <PageHeader
        eyebrow="Contact"
        title={visit ? 'Book a site visit' : 'Talk to the site office'}
        subtitle="Call, WhatsApp or send a message, or book a visit to see the location in person."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="bg-ivory py-14 sm:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="space-y-3 lg:col-span-2">
            {methods.map((m, i) => {
              const Ico = m.icon;
              const body = (
                <>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${m.accent}`}>
                    <Ico className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold tracking-wider text-ink-400 uppercase">{m.label}</span>
                    <span className="block font-semibold break-words text-ink-950">{m.value}</span>
                  </span>
                </>
              );
              return (
                <Reveal key={m.label} delay={i * 60}>
                  {m.href ? (
                    <a href={m.href} target={m.external ? '_blank' : undefined} rel={m.external ? 'noreferrer' : undefined} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-gold-500/40">
                      {body}
                    </a>
                  ) : (
                    <div className="card flex items-center gap-4 p-5">{body}</div>
                  )}
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={120} className="lg:col-span-3">
            <div className="card p-6 sm:p-9">
              <h2 className="font-display text-3xl text-ink-950">{visit ? 'Choose your visit day' : 'Send us a message'}</h2>
              <p className="mt-2 text-sm text-ink-500">Messages go straight to the site office.</p>
              <div className="mt-7">
                <InquiryForm key={visit ? 'visit' : 'general'} defaultKind={visit ? 'visit' : 'general'} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory pb-20">
        <div className="container-x">
          <MapEmbed query={business.mapQuery || 'Mardan, Khyber Pakhtunkhwa'} label={business.address || business.city} className="h-[340px] sm:h-[440px]" />
        </div>
      </section>
    </>
  );
}
