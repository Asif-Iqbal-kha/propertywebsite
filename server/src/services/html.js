import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { Property } from '../models/Property.js';
import { getSettings } from './settings.js';
import { TYPE_LABELS, areaLabel, escapeHtml, formatPKR, safeJson } from '../utils/helpers.js';

const indexPath = path.join(config.clientDist, 'index.html');
let template = null;

export function hasClientBuild() {
  return fs.existsSync(indexPath);
}

function getTemplate() {
  if (!template || !config.isProd) template = fs.readFileSync(indexPath, 'utf8');
  return template;
}

const PAGE_META = {
  '/properties': ['Properties for Sale & Rent', 'Browse plots, homes and commercial property listed by the site office.'],
  '/society': ['About the Society', 'Location, overview and amenities of Prem Housing, Mardan.'],
  '/payment-plans': ['Payment Plans & Calculator', 'Payment plans, installment calculator and Marla/Kanal area converter.'],
  '/gallery': ['Gallery', 'Photos from the site.'],
  '/about': ['About the Site Office', 'Who we are and how the site office can help you.'],
  '/contact': ['Contact & Site Visits', 'Call, WhatsApp or book a site visit with the site office.'],
};

function locationLine(p, settings) {
  return [p.location?.plotNo && `Plot ${p.location.plotNo}`, p.location?.block, p.location?.phase, settings.business.city]
    .filter(Boolean)
    .join(', ');
}

/** Returns { html, status } for a client route, with SEO/OG tags and settings embedded. */
export async function renderIndex(req) {
  const settings = await getSettings();
  const b = settings.business;
  const brand = [b.name, b.officeName].filter(Boolean).join(' ');
  let title = settings.seo?.title || `${brand} — ${b.city}`;
  let description = settings.seo?.description || b.tagline;
  let image = `${config.siteUrl}/og-image.png`;
  let status = 200;
  const url = `${config.siteUrl}${req.path === '/' ? '' : req.path}`;

  const detail = /^\/properties\/([a-z0-9-]{1,120})\/?$/.exec(req.path);
  if (detail) {
    const p = await Property.findOne({ slug: detail[1] }).select('title price purpose type area location images').lean();
    if (p) {
      title = `${p.title} | ${brand}`;
      const price = formatPKR(p.price) + (p.purpose === 'rent' && p.price != null ? ' / month' : '');
      description = `${areaLabel(p.area)} ${TYPE_LABELS[p.type] || 'property'} for ${p.purpose === 'rent' ? 'rent' : 'sale'} — ${price}. ${locationLine(p, settings)}. Call ${b.phoneDisplay}.`;
      if (p.images?.[0]?.url) image = `${config.siteUrl}${p.images[0].url}`;
    } else {
      status = 404;
      title = `Property not found | ${brand}`;
    }
  } else if (PAGE_META[req.path.replace(/\/+$/, '')]) {
    const [t, d] = PAGE_META[req.path.replace(/\/+$/, '')];
    title = `${t} | ${brand}`;
    description = d;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: brand,
    telephone: b.phone,
    url: config.siteUrl,
    image: `${config.siteUrl}/og-image.png`,
    address: {
      '@type': 'PostalAddress',
      ...(b.address ? { streetAddress: b.address } : {}),
      addressLocality: 'Mardan',
      addressRegion: 'Khyber Pakhtunkhwa',
      addressCountry: 'PK',
    },
    ...(b.email ? { email: b.email } : {}),
  };

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(brand)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${safeJson(jsonLd)}</script>`,
    `<script id="__SETTINGS__" type="application/json">${safeJson(settings)}</script>`,
  ].join('\n    ');

  const html = getTemplate().replace(/<!--app-head-->[\s\S]*?<!--\/app-head-->/, head);
  return { html, status };
}

export async function renderSitemap() {
  const properties = await Property.find({ status: { $ne: 'sold' } }).select('slug updatedAt').sort({ updatedAt: -1 }).limit(5000).lean();
  const pages = ['', '/properties', '/society', '/payment-plans', '/gallery', '/about', '/contact'];
  const urls = [
    ...pages.map((p) => `<url><loc>${config.siteUrl}${p}</loc></url>`),
    ...properties.map(
      (p) => `<url><loc>${config.siteUrl}/properties/${escapeHtml(p.slug)}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod></url>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function renderRobots() {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
}
