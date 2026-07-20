import threePhaseImg from "@/assets/images/product-three-phase.jpg";
import singlePhaseImg from "@/assets/images/product-single-phase.jpg";
import highEfficiencyImg from "@/assets/images/product-high-efficiency.jpg";
import novaImg from "@/assets/images/product-nova.jpg";
import marathonImg from "@/assets/images/product-marathon.jpg";
import metrosulImg from "@/assets/images/product-metrosul.jpg";

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
    id: "nova",
    title: "Motores de indução trifásicos",
    description: "Robustez e confiabilidade para cargas pesadas em linhas de produção.",
    src: novaImg,
  },
  {
    id: "marathon",
    title: "Motores blindados de alta resistência",
    description: "Proteção reforçada contra poeira, umidade e ambientes agressivos.",
    src: marathonImg,
  },
  {
    id: "metrosul",
    title: "Motores para uso geral",
    description: "Versatilidade para as mais diversas aplicações industriais do dia a dia.",
    src: metrosulImg,
  },
];

export type CatalogProduct = { id: string; title: string; description: string };

// Shorter curated list with longer descriptions for the catalog accordion below the carousel.
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "three-phase",
    title: "Motores trifásicos industriais",
    description:
      "Desenvolvidos para operação contínua em ambientes industriais exigentes, nossos motores trifásicos entregam torque constante e alta performance mesmo sob cargas pesadas. Contam com carcaças reforçadas e componentes internos rigorosamente testados, garantindo confiabilidade em linhas de produção que não podem parar. Cada unidade passa por diagnóstico técnico completo antes da entrega, assegurando o desempenho esperado desde o primeiro dia de operação.",
  },
  {
    id: "high-efficiency",
    title: "Motores de alta eficiência",
    description:
      "Pensados para reduzir o consumo de energia sem abrir mão de potência, nossos motores de alta eficiência utilizam materiais e processos que minimizam perdas térmicas e mecânicas. Essa combinação resulta em economia real na conta de energia ao longo de toda a vida útil do equipamento, sem comprometer a durabilidade. Uma escolha certeira para indústrias que buscam reduzir custos operacionais mantendo a mesma capacidade produtiva.",
  },
  {
    id: "marathon",
    title: "Motores blindados de alta resistência",
    description:
      "Construídos para enfrentar poeira, umidade e ambientes agressivos, os motores blindados da nossa linha oferecem proteção reforçada contra os principais fatores que comprometem a vida útil de um motor elétrico. Vedações especiais e carcaças de alta resistência garantem operação segura mesmo nas condições mais adversas. Uma escolha certeira para plantas industriais expostas a intempéries ou processos corrosivos.",
  },
];
