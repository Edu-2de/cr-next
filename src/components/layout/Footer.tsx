import { Text } from "@/components/ui/Text";
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
  { label: "Engenharia", href: "#engineering" },
  { label: "Produtos", href: "#products" },
  { label: "Serviços", href: "#services" },
  { label: "Sobre", href: "#about" },
];

export function Footer() {
  return (
    <footer data-theme="dark" className="relative z-10 bg-ink-950 px-6 py-16 text-white sm:py-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 text-center sm:grid-cols-3 sm:text-left">
        <div>
          <Text as="p" variant="wordmark" className="text-xl">
            CR Mesquita
          </Text>
          <Text as="p" variant="body" className="mx-auto mt-2 max-w-xs text-sm text-white/50 sm:mx-0">
            Motores elétricos industriais de alta performance, de Porto Alegre para todo o Brasil.
          </Text>
          <Text as="p" size="xs" color="whiteFaint" className="mt-4">
            Desde {FOUNDED_YEAR} · {ADDRESS_CITY}
          </Text>
        </div>

        <div>
          <Text as="p" variant="kicker" color="whiteFaint">
            Contato
          </Text>
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
          <Text as="p" variant="kicker" color="whiteFaint">
            Navegação
          </Text>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            {FOOTER_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <Text
        as="p"
        size="xs"
        color="whiteFaint"
        className="mx-auto mt-12 w-full max-w-7xl border-t border-white/10 pt-6 text-center sm:text-left"
      >
        © {new Date().getFullYear()} CR Mesquita. Todos os direitos reservados.
      </Text>
    </footer>
  );
}
