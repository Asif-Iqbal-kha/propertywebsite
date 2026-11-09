import { useState } from 'react';
import { ExternalLink, FileSearch, Maximize2, Phone } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import MapEmbed from '../components/MapEmbed.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { PageHeader, Paragraphs, SectionHeading } from '../components/ui.jsx';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { mediaUrl } from '../lib/api.js';
import { telHref, waHref } from '../lib/contact.js';

export default function Society() {
  const { business, society, city } = useSettings();
  const [planOpen, setPlanOpen] = useState(false);
  const hasProfile = Boolean(society.overview || society.facts?.length);

  return (
    <>
      <Seo title="About the Society" description={`Overview, amenities and location of ${business.name}, Mardan.`} />
      <PageHeader
        eyebrow="The society"
        title={business.name}
        subtitle={hasProfile ? `Overview, key facts and amenities of ${business.name} in Mardan.` : `Verified information about ${business.name} is published here by the site office.`}
        crumbs={[{ label: 'Society' }]}
      />

      {hasProfile ? (
        <section className="bg-ivory py-16 sm:py-24">
          <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow">Overview</p>
              <h2 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">About {business.name}</h2>
              <Paragraphs text={society.overview} className="mt-6 text-lg leading-relaxed text-ink-600" />
            </Reveal>
            {society.facts?.length > 0 && (
              <Reveal delay={120} className="lg:col-span-5">
                <div className="gold-frame p-7 text-white sm:p-8">
                  <h3 className="font-display text-2xl">Key facts</h3>
                  <dl className="mt-6 divide-y divide-white/10">
                    {society.facts.map((f) => (
                      <div key={f.label} className="flex justify-between gap-6 py-3.5 text-sm">
                        <dt className="text-white/55">{f.label}</dt>
                        <dd className="text-right font-semibold text-gold-200">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-ivory py-16 sm:py-24">
          <div className="container-x">
            <Reveal className="card mx-auto max-w-3xl p-8 text-center sm:p-12">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-950 text-gold-300">
                <FileSearch className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <h2 className="mt-6 font-display text-3xl text-ink-950">Society profile coming soon</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-500">
                The site office is preparing verified information about {business.name}, including its amenities and master plan. Until it is published, please contact the office directly for accurate details.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a href={telHref(business.phone)} className="btn btn-dark">
                  <Phone className="h-4 w-4" /> {business.phoneDisplay}
                </a>
                <a href={waHref(business.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {society.amenities?.length > 0 && (
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <div className="container-x relative">
            <SectionHeading dark eyebrow="Amenities" title="Life at the society" />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {society.amenities.map((a, i) => (
                <Reveal key={a.title} delay={(i % 3) * 80} className="glass rounded-3xl p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
                    <Icon name={a.icon} />
                  </span>
                  <h3 className="mt-5 font-display text-xl">{a.title}</h3>
                  {a.description && <p className="mt-2 text-sm leading-relaxed text-white/60">{a.description}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {society.masterPlan?.url && (
        <section className="bg-sand py-20 sm:py-28">
          <div className="container-x">
            <SectionHeading eyebrow="Master plan" title="Society layout" subtitle="Tap the plan to view it full screen." />
            <Reveal className="mt-10">
              <button type="button" onClick={() => setPlanOpen(true)} className="group gold-frame relative block w-full overflow-hidden p-2">
                <img src={mediaUrl(society.masterPlan.url)} alt={`${business.name} master plan`} loading="lazy" className="w-full rounded-[1.3rem]" />
                <span className="absolute right-6 bottom-6 flex items-center gap-2 rounded-full bg-ink-950/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition group-hover:bg-gold-500 group-hover:text-ink-950">
                  <Maximize2 className="h-4 w-4" /> View full screen
                </span>
              </button>
            </Reveal>
            {planOpen && <Lightbox images={[{ ...society.masterPlan, caption: 'Master plan' }]} index={0} onIndex={() => {}} onClose={() => setPlanOpen(false)} />}
          </div>
        </section>
      )}

      <section className="bg-ivory py-20 sm:py-28">
        <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Location</p>
            <h2 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">{business.name}, Mardan</h2>
            {business.address && <p className="mt-4 text-lg text-ink-600">{business.address}</p>}
            {city.intro && <p className="mt-4 leading-relaxed text-ink-500">{city.intro}</p>}
            {city.sourceUrl && (
              <a href={city.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-gold-700">
                {city.sourceNote || 'Source'} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <MapEmbed query={business.mapQuery || 'Mardan, Khyber Pakhtunkhwa'} label={business.address || business.city} className="h-[340px] sm:h-[420px]" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
