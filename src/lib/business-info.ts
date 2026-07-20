// Single source of truth for real CR Mesquita business facts — shared by the
// Hero WhatsApp link, the About section's map embed, and the Footer.
export const WHATSAPP_NUMBER = "(51) 98342-2322";
export const WHATSAPP_HREF = "https://wa.me/5551983422322";

export const PHONE_NUMBER = "(51) 3342-2152";
export const PHONE_HREF = "tel:+555133422152";

export const WEBSITE_LABEL = "crmesquita.com.br";
export const WEBSITE_URL = "https://www.crmesquita.com.br";

export const ADDRESS_CITY = "Porto Alegre, RS";
export const MAPS_PLACE_URL =
  "https://www.google.com/maps/place/CR+Mesquita+motores+eletricos/@-30.0063144,-51.2043308,19.33z/data=!4m6!3m5!1s0x95197993b7b632cf:0x9b35719f1fe4d694!8m2!3d-30.0060128!4d-51.2041833!16s%2Fg%2F1ptz879jn";

export const FOUNDED_YEAR = 1975;

// Precise pin coordinates (the `!3d!4d` values in MAPS_PLACE_URL, more
// accurate than the `@lat,lng` viewport center) — also what FactoryLocation's
// map embed centers on.
export const LATITUDE = -30.0060128;
export const LONGITUDE = -51.2041833;

function whatsappGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// wa.me link pre-filled with a greeting + a short ask about the specific
// service, so tapping a service's "Ver serviço" badge opens a conversation
// that's already framed instead of a blank chat.
export function getServiceWhatsAppHref(serviceTitle: string) {
  const message = `${whatsappGreeting()}! Gostaria de saber mais informações sobre o serviço de ${serviceTitle}.`;
  return `${WHATSAPP_HREF}?text=${encodeURIComponent(message)}`;
}
