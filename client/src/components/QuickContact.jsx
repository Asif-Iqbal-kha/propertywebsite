import { Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { telHref, waHref } from '../lib/contact.js';
import { WhatsAppIcon } from './BrandIcons.jsx';

/** Mobile: sticky bottom bar with Call + WhatsApp. Desktop: floating WhatsApp button. */
export default function QuickContact() {
  const { business } = useSettings();
  const text = `Assalam o Alaikum, I found ${business.name} online and would like more information.`;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/92 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <a href={telHref(business.phone)} className="btn btn-gold py-3.5">
            <Phone className="h-4 w-4" /> Call Office
          </a>
          <a href={waHref(business.whatsapp, text)} target="_blank" rel="noreferrer" className="btn btn-whatsapp py-3.5">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>

      <a
        href={waHref(business.whatsapp, text)}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="group fixed right-6 bottom-6 z-40 hidden items-center gap-3 md:flex"
      >
        <span className="pointer-events-none translate-x-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          Chat with the site office
        </span>
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#1fa855] text-white shadow-[0_14px_34px_-10px_rgba(31,168,85,.9)] transition-transform duration-300 group-hover:scale-105">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#1fa855] opacity-25 [animation-duration:2.6s]" />
          <WhatsAppIcon className="relative h-7 w-7" />
        </span>
      </a>
    </>
  );
}
