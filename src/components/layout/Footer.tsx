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
import { tv } from "tailwind-variants";

const FOOTER_LINKS = [
  { label: "Início", href: "#top" },
  { label: "Produtos", href: "#products" },
  { label: "Serviços", href: "#services" },
  { label: "Sobre", href: "#about" },
];

const footerStyles = tv({
  slots: {
    footer: "relative z-10 bg-ink-950 px-6 py-16 text-white sm:py-20",
    grid: "mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 text-center sm:grid-cols-3 sm:text-left",
    contactList: "mt-4 flex flex-col gap-2 text-sm text-white/70",
    navList: "mt-4 flex flex-col gap-2 text-sm text-white/70",
    link: "transition-colors hover:text-white",
    copyright: "mx-auto mt-12 w-full max-w-7xl border-t border-white/10 pt-6 text-center sm:text-left",
  },
});

export function Footer() {
  const { footer, grid, contactList, navList, link, copyright } = footerStyles();

  return (
    <footer data-theme="dark" className={footer()}>
      <div className={grid()}>
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
          <ul className={contactList()}>
            <li>
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className={link()}>
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
            </li>
            <li>
              <a href={PHONE_HREF} className={link()}>
                Telefone: {PHONE_NUMBER}
              </a>
            </li>
            <li>
              <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className={link()}>
                {WEBSITE_LABEL}
              </a>
            </li>
            <li>
              <a href={MAPS_PLACE_URL} target="_blank" rel="noopener noreferrer" className={link()}>
                Ver endereço no mapa
              </a>
            </li>
          </ul>
        </div>

        <div>
          <Text as="p" variant="kicker" color="whiteFaint">
            Navegação
          </Text>
          <nav className={navList()}>
            {FOOTER_LINKS.map((navItem) => (
              <a key={navItem.href} href={navItem.href} className={link()}>
                {navItem.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <Text as="p" size="xs" color="whiteFaint" className={copyright()}>
        © {new Date().getFullYear()} CR Mesquita. Todos os direitos reservados.
      </Text>
    </footer>
  );
}
