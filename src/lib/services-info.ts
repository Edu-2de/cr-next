import maintenanceImg from "@/assets/images/service-maintenance.jpg";
import diagnosticsImg from "@/assets/images/service-diagnostics.jpg";
import detailImg from "@/assets/images/service-detail.jpg";
import installationImg from "@/assets/images/service-installation.jpg";

export type Service = { id: string; src: typeof maintenanceImg; title: string; description: string };

export const SERVICES: Service[] = [
  {
    id: "maintenance",
    src: maintenanceImg,
    title: "Manutenção e reforma",
    description:
      "Desmontagem completa para inspeção, reparo e reforma de motores de grande porte, com laudo técnico detalhado de cada etapa. Substituição de rolamentos, bobinas e componentes desgastados por peças originais ou equivalentes homologadas, sempre respeitando as especificações do fabricante. Testes finais de vibração, temperatura e isolamento garantem que o motor volte a operar com a mesma confiabilidade de um equipamento novo.",
  },
  {
    id: "diagnostics",
    src: diagnosticsImg,
    title: "Testes e diagnóstico",
    description:
      "Equipamentos de teste elétrico de última geração para identificar falhas com precisão, antes que se tornem uma parada não programada. Análise de resistência de isolamento, corrente de fuga e resposta em frequência revelam problemas internos invisíveis a uma inspeção visual. Cada diagnóstico gera um relatório claro, com recomendação objetiva de reparo, reforma ou substituição.",
  },
  {
    id: "detail-engineering",
    src: detailImg,
    title: "Engenharia de detalhe",
    description:
      "Conhecimento técnico aprofundado de cada componente interno do motor, do enrolamento ao sistema de refrigeração, aplicado em projetos de retrofit e otimização de eficiência energética. Nossa equipe avalia o histórico operacional do equipamento e propõe ajustes de engenharia sob medida, sem depender de soluções genéricas de catálogo. O resultado é um motor mais eficiente, mais silencioso e com vida útil estendida.",
  },
  {
    id: "installation",
    src: installationImg,
    title: "Instalação e comissionamento",
    description:
      "Montagem, alinhamento a laser e comissionamento completo de motores e bombas em plantas industriais, seguindo rigorosamente as normas técnicas vigentes. Acompanhamento presencial da partida inicial, com registro de todos os parâmetros elétricos e mecânicos relevantes para a operação segura do equipamento. Suporte contínuo nas primeiras horas de funcionamento, garantindo uma transição tranquila até a operação plena.",
  },
];
