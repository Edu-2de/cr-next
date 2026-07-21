import highEfficiencyImg from "@/assets/images/product-high-efficiency.jpg";
import marathonImg from "@/assets/images/product-marathon.jpg";
import metrosulImg from "@/assets/images/product-metrosul.jpg";
import singlePhaseImg from "@/assets/images/product-single-phase.jpg";
import threePhaseImg from "@/assets/images/product-three-phase.jpg";
import wegKeyImg from "@/assets/images/product-weg-second.jpg";

export type Product = { id: string; title: string; description: string; src: typeof threePhaseImg };

export const PRODUCTS: Product[] = [
  {
    id: "three-phase",
    title: "Motores trifásicos industriais",
    description: "Alta performance e torque constante para operações contínuas em ambientes exigentes.",
    src: threePhaseImg,
  },
  {
    id: "single-phase",
    title: "Motores monofásicos",
    description: "Solução compacta e eficiente para aplicações residenciais e comerciais de menor porte.",
    src: singlePhaseImg,
  },
  {
    id: "high-efficiency",
    title: "Motores de alta eficiência",
    description: "Redução no consumo de energia sem abrir mão de desempenho e durabilidade.",
    src: highEfficiencyImg,
  },
  {
    id: "marathon",
    title: "Motores elétricos industriais",
    description: "Proteção reforçada contra poeira, umidade e ambientes agressivos.",
    src: marathonImg,
  },
  {
    id: "metrosul",
    title: "Motores para uso geral",
    description: "Versatilidade para as mais diversas aplicações industriais do dia a dia.",
    src: metrosulImg,
  },
  {
    id: "weg2",
    title: "Chaves de partida",
    description: "Versatilidade para as mais diversas aplicações industriais do dia a dia.",
    src: wegKeyImg,
  },
];

export type CatalogProduct = { id: string; title: string; description: string; specs: string[] };

// Shorter curated list with longer descriptions for the catalog accordion below the carousel.
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "three-phase",
    title: "Motores trifásicos",
    description:
      "Projetados para operação contínua em ambientes industriais exigentes, os motores trifásicos do nosso catálogo entregam torque constante e alta performance mesmo sob cargas pesadas. Contam com carcaças reforçadas e componentes de máxima procedência, garantindo total confiabilidade para linhas de produção que não podem parar.",
    specs: ["Potências de 0,16 CV a 200 CV", "Opções de 2, 4, 6 e 8 polos."]
  },
  {
    id: "high-efficiency",
    title: "Motores monofásicos",
    description:
      "Selecionados para oferecer alto rendimento e confiabilidade em redes elétricas monofásicas, os motores do nosso catálogo são a solução ideal para equipamentos comerciais, agrícolas e industriais de menor porte. Com estrutura robusta e excelente torque de partida, garantem operação estável e contínua mesmo sob variações de carga. Uma escolha prática e eficiente para quem busca máxima produtividade e facilidade de instalação.",
    specs: ["Potências de 0,5 CV a 3 CV", "Opções de 2 e 4 polos"]
  },
  {
    id: "starter-switches",
    title: "Chaves de partida",
    description:
      "Projetadas para garantir a proteção e o acionamento seguro de motores elétricos, as chaves de partida do nosso catálogo evitam sobrecargas e picos de corrente que comprometem a vida útil do equipamento. Disponibilizamos modelos em estoque equipados com contatores e relés de sobrecarga de alta precisão, oferecendo instalação simplificada e máxima confiabilidade. Uma escolha indispensável para manter a segurança operacional na sua indústria.",
    specs: ["Potências de 0,16 CV a 10 CV", "Tensões: 220 V e 380 V"]
  }
];
