import { CalendarClock, Phone } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Reveal from '../components/Reveal.jsx';
import { AreaConverter, InstallmentCalculator } from '../components/Tools.jsx';
import { PageHeader, Paragraphs, SectionHeading } from '../components/ui.jsx';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { telHref, waHref } from '../lib/contact.js';
import { FREQUENCY_LABELS, formatPKR, formatRupees } from '../lib/format.js';

function installmentText(plan) {
  if (!plan.installmentCount && !plan.installmentAmount) return '—';
  const freq = (FREQUENCY_LABELS[plan.frequency] || 'Monthly').toLowerCase();
  return `${plan.installmentCount ?? '—'} × ${formatRupees(plan.installmentAmount)} (${freq})`;
}

export default function PaymentPlans() {
  const { business, payment } = useSettings();
  const plans = payment.plans || [];

  return (
    <>
      <Seo title="Payment Plans & Calculator" description="Payment plans, installment calculator and Marla / Kanal area converter." />
      <PageHeader eyebrow="Payment plans" title="Payment plans & buyer tools" subtitle={payment.intro} crumbs={[{ label: 'Payment Plans' }]} />

      <section className="bg-ivory py-16 sm:py-24">
        <div className="container-x">
          {plans.length > 0 ? (
            <>
              <SectionHeading eyebrow="Current schedule" title="Payment plans" subtitle="Published by the site office. Please confirm before booking." />
              {/* desktop table */}
              <Reveal className="card mt-10 hidden overflow-hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink-950 text-xs tracking-wider text-gold-200 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-bold">Plan</th>
                      <th className="px-6 py-4 font-bold">Total price</th>
                      <th className="px-6 py-4 font-bold">Down payment</th>
                      <th className="px-6 py-4 font-bold">Installments</th>
                      <th className="px-6 py-4 font-bold">On possession</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-900/5">
                    {plans.map((plan, i) => (
                      <tr key={`${plan.title}-${i}`} className="transition hover:bg-gold-50/60">
                        <td className="px-6 py-5">
                          <p className="font-display text-lg text-ink-950">{plan.title}</p>
                          {plan.notes && <p className="mt-0.5 text-xs text-ink-500">{plan.notes}</p>}
                        </td>
                        <td className="px-6 py-5 font-semibold text-ink-950">{plan.totalPrice != null ? formatPKR(plan.totalPrice) : '—'}</td>
                        <td className="px-6 py-5">{formatRupees(plan.downPayment)}</td>
                        <td className="px-6 py-5">{installmentText(plan)}</td>
                        <td className="px-6 py-5">{formatRupees(plan.possessionAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
              {/* mobile cards */}
              <div className="mt-8 grid gap-4 md:hidden">
                {plans.map((plan, i) => (
                  <Reveal key={`${plan.title}-m${i}`} className="card p-6">
                    <p className="font-display text-xl text-ink-950">{plan.title}</p>
                    {plan.notes && <p className="mt-1 text-xs text-ink-500">{plan.notes}</p>}
                    <dl className="mt-4 space-y-2 text-sm">
                      {[
                        ['Total price', plan.totalPrice != null ? formatPKR(plan.totalPrice) : '—'],
                        ['Down payment', formatRupees(plan.downPayment)],
                        ['Installments', installmentText(plan)],
                        ['On possession', formatRupees(plan.possessionAmount)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 border-b border-ink-900/5 pb-2">
                          <dt className="text-ink-500">{k}</dt>
                          <dd className="text-right font-semibold text-ink-950">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                ))}
              </div>
              {payment.terms && <Paragraphs text={payment.terms} className="mt-6 text-xs leading-relaxed text-ink-500" />}
            </>
          ) : (
            <Reveal className="card mx-auto max-w-3xl p-8 text-center sm:p-12">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-950 text-gold-300">
                <CalendarClock className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <h2 className="mt-6 font-display text-3xl text-ink-950">Ask for the latest payment plan</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-500">
                Payment plans are shared directly by the {business.name} site office. Call or WhatsApp for the current schedule, or use the calculator below for a quick estimate.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a href={telHref(business.phone)} className="btn btn-dark">
                  <Phone className="h-4 w-4" /> {business.phoneDisplay}
                </a>
                <a href={waHref(business.whatsapp, 'Assalam o Alaikum, please share the latest payment plan.')} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-900 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="container-x relative">
          <SectionHeading dark center eyebrow="Plan ahead" title="Calculate before you commit" subtitle="Quick, interest-free estimates and accurate unit conversions." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <InstallmentCalculator />
            </Reveal>
            <Reveal delay={120} className="h-full">
              <AreaConverter />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
