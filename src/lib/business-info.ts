// Real, verified CR Mesquita business facts, single source of truth — used
// by the Hero WhatsApp link, the Sobre section's Google Maps embed, and the
// Footer. Do not re-derive these from CR.jpg (the factory-facade photo) or
// guess new ones; they were confirmed either directly by the user or by
// reading the physical signage in that photo at full resolution:
// - WHATSAPP_NUMBER: confirmed directly by the user.
// - PHONE_NUMBER, WEBSITE_URL: read off the signage in CR.jpg (six-times
//   upscaled with nearest-neighbor interpolation for a clean read — the
//   raw photo is only 284x160, too low-res to read reliably at native size).
// - MAPS_PLACE_URL: the Google Maps place link the user supplied directly.
// - FOUNDED_YEAR: from the "50 ANOS · 1975" laurel seal baked into the real
//   company logo (app/assets/images/logo.png).
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
