/**
 * Initial website content.
 *
 * Only VERIFIED information is included here:
 *  - Business name & phone number: taken from the client's own contact card
 *    ("Prem Housing Site Office - Property", +92 342 9423521).
 *  - City facts: Wikipedia "Mardan" article (population figure from the 2023 Census).
 *  - Buyer checklist item #1: ProPakistani, 29 Dec 2025 — KP authorities advise the public
 *    to independently verify the legal status and NOCs of housing societies.
 *
 * Society details (overview, approvals, amenities, prices, payment plans, master plan, photos)
 * are intentionally EMPTY. They must be entered by the site office from the Admin panel,
 * so that nothing unverified is published.
 */
export const SITE_DEFAULTS = {
  business: {
    name: 'Prem Housing',
    officeName: 'Site Office',
    tagline: 'Property Site Office · Mardan',
    phone: '+923429423521',
    phoneDisplay: '+92 342 9423521',
    whatsapp: '923429423521',
    email: '',
    address: '',
    city: 'Mardan, Khyber Pakhtunkhwa',
    officeHours: '',
    mapQuery: 'Mardan, Khyber Pakhtunkhwa, Pakistan',
    socials: { facebook: '', instagram: '', youtube: '', tiktok: '' },
  },
  hero: {
    eyebrow: 'Prem Housing · Site Office · Mardan',
    title: 'Own a Piece of',
    highlight: 'Prem Housing',
    subtitle:
      'Plots, homes and property at Prem Housing, handled directly by the site office in Mardan. Call, WhatsApp or visit us for current availability, prices and payment options.',
    image: null,
  },
  about: {
    heading: 'Your direct line to Prem Housing',
    body:
      'The Prem Housing Site Office in Mardan is your direct point of contact for property at Prem Housing.\n\nSpeak to the office for current availability, prices, payment options and documentation before you commit to any purchase. Call or WhatsApp +92 342 9423521, or visit the site office in person.',
    services: [
      {
        icon: 'house',
        title: 'Buying property',
        description: 'Share your budget and preferred size, and the office will tell you what is currently available.',
      },
      {
        icon: 'handshake',
        title: 'Selling property',
        description: 'Planning to sell? Talk to the site office about listing your plot or home.',
      },
      {
        icon: 'map',
        title: 'Site visits',
        description: 'See the location in person. Book a visit and the office will guide you on site.',
      },
    ],
  },
  society: {
    overview: '',
    facts: [],
    amenities: [],
    masterPlan: null,
  },
  payment: {
    intro: 'Payment plans are issued by the site office and can change. Please confirm the current schedule with the office before booking.',
    plans: [],
    terms: '',
  },
  city: {
    heading: 'Why Mardan',
    intro: 'Mardan is the second-largest city of Khyber Pakhtunkhwa after Peshawar, and the headquarters of Mardan District.',
    facts: [
      { value: '2nd', label: 'Largest city in Khyber Pakhtunkhwa', detail: 'Second only to Peshawar' },
      { value: '368,302', label: 'Residents in Mardan city', detail: 'Census 2023' },
      {
        value: '3',
        label: 'Public universities',
        detail: 'Abdul Wali Khan University (2009), Women University Mardan (2016) and UET Mardan (2017)',
      },
      { value: '1', label: 'Medical college', detail: 'Bacha Khan Medical College, established 2010' },
    ],
    sourceNote: 'Source: Wikipedia — Mardan (population from the 2023 Census of Pakistan)',
    sourceUrl: 'https://en.wikipedia.org/wiki/Mardan',
  },
  guide: {
    heading: 'Before you buy: a quick checklist',
    items: [
      {
        title: 'Verify the society’s legal status',
        body: 'Khyber Pakhtunkhwa authorities advise buyers to independently verify a housing society’s legal status and NOC before investing.',
      },
      {
        title: 'Match the documents',
        body: 'Make sure the name on the file or allotment letter matches the seller’s CNIC, and confirm the plot number with the site office.',
      },
      {
        title: 'Visit the plot in person',
        body: 'See the exact location, access road and surroundings with your own eyes before making a payment.',
      },
      {
        title: 'Pay with proof',
        body: 'Get an official receipt for every payment and keep copies of all transfer documents.',
      },
    ],
    sourceNote: 'KP crackdown on illegal housing societies — ProPakistani, 29 Dec 2025',
    sourceUrl: 'https://propakistani.pk/2025/12/29/kp-launches-crackdown-on-illegal-housing-societies/',
  },
  seo: {
    title: 'Prem Housing Site Office — Property in Mardan',
    description:
      'Plots, homes and property at Prem Housing, Mardan. Contact the Prem Housing Site Office at +92 342 9423521 for current availability and prices.',
  },
};
