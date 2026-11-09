export function telHref(phone = '') {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

export function smsHref(phone = '') {
  return `sms:${String(phone).replace(/[^\d+]/g, '')}`;
}

export function waHref(number = '', text = '') {
  const digits = String(number).replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function mapsLink(query = '') {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbed(query = '') {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
}
