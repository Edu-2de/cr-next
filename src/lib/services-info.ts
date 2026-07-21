import diagnosticsImg from "@/assets/images/service-diagnostics.jpg";
import maintenanceImg from "@/assets/images/service-maintenance.jpg";
import saleImg from "@/assets/images/service-sale.jpg";

export type Service = { id: string; src: typeof maintenanceImg; title: string; description: string };

export const SERVICES: Service[] = [
  {
    id: "maintenance",
    src: maintenanceImg,
    title: "Assistência Técnica"
,
    description:
      "Como assistência técnica especializada, disponibilizamos a linha completa de peças de reposição originais para toda a linha de motores da marca Mercosul (antiga Eberle). Conhecidos por carregar um dos nomes mais tradicionais do setor elétrico, os motores Mercosul oferecem a maior garantia de qualidade do mercado, sendo 100% testados e validados em laboratório. Garantimos que cada componente fornecido cumpra rigorosamente as normas técnicas de performance, entregando a durabilidade e a segurança que a sua indústria necessita",
  },
  {
    id: "diagnostics",
    src: diagnosticsImg,
    title: "Recuperação e Rebobinagem",
    description:
      "Oferecemos serviços especializados de rebobinagem, reforma e recuperação técnica para motores elétricos e geradores de todas as potências e portes. Em nossa oficina própria, unimos equipamentos de alta precisão a uma equipe de técnicos altamente qualificados para realizar diagnósticos detalhados, testes rigorosos e processos que restauram o desempenho original do equipamento. Cada serviço é entregue com a reconhecida garantia CR Mesquita & Cia Ltda., assegurando confiabilidade, eficiência energética e máxima vida útil operacional para o seu patrimônio.",
  },
  {
    id: "detail-engineering",
    src: saleImg,
    title: "Pós-Venda",
    description:
      "O nosso compromisso com a sua indústria vai muito além da entrega do equipamento ou da conclusão do serviço. Oferecemos um suporte técnico contínuo e um atendimento pós-venda verdadeiramente dedicado, pronto para solucionar dúvidas, orientar sobre o plano de manutenção preventiva e acompanhar o desempenho dos seus motores e geradores no dia a dia. Com a CR Mesquita, você conta com um parceiro presente, focado em assegurar o perfeito funcionamento do seu maquinário e em evitar paradas imprevistas na sua produção",
  },
];
