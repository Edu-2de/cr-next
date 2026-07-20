import {
  ADDRESS_CITY,
  FOUNDED_YEAR,
  MAPS_PLACE_URL,
  PHONE_HREF,
  PHONE_NUMBER,
  WEBSITE_LABEL,
  WEBSITE_URL,
  WHATSAPP_HREF,
  WHATSAPP_NUMBER,
} from "@/lib/business-info";

const FOOTER_LINKS = [
  { label: "Início", href: "#top" },
  { label: "Engenharia", href: "#engenharia" },
  { label: "Produtos", href: "#produtos" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
];

// Explicit request: "deixe o footer da página mais completo, com infos
// reais e mais completo no geral" — went from a single row (wordmark +
// tagline, then just the nav links) to three columns (brand, real contact
// info, navigation) over a shared divider. All contact facts come from
// `lib/business-info.ts` — the same verified real numbers/address already
// used in the Hero (WhatsApp) and Sobre section (Google Maps embed), not
// re-typed or re-guessed here. Still no social icon grid (per the original
// note below, unchanged: those accounts don't exist), and still no
// pill/badge decoration — plain text links with a flat hover color change,
// matching this project's established restraint.
export function Footer() {
  return (
    <footer data-theme="dark" className="relative z-10 bg-ink-950 px-6 py-16 text-white sm:py-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 text-center sm:grid-cols-3 sm:text-left">
        <div>
          <p className="font-display text-xl font-bold tracking-tight">CR Mesquita</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/50 sm:mx-0">
            Motores elétricos industriais de alta performance, de Porto Alegre para todo o Brasil.
          </p>
          <p className="mt-4 text-xs text-white/40">
            Desde {FOUNDED_YEAR} · {ADDRESS_CITY}
          </p>
        </div>

        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-white/40 uppercase">Contato</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            <li>
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
            </li>
            <li>
              <a href={PHONE_HREF} className="transition-colors hover:text-white">
                Telefone: {PHONE_NUMBER}
              </a>
            </li>
            <li>
              <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                {WEBSITE_LABEL}
              </a>
            </li>
            <li>
              <a href={MAPS_PLACE_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                Ver endereço no mapa
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-white/40 uppercase">Navegação</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            {FOOTER_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/40 sm:text-left">
        © {new Date().getFullYear()} CR Mesquita. Todos os direitos reservados.
      </div>
    </footer>
  );
}
