import { ContatoStage } from "@/components/contato/ContatoStage";
import { PixelDissolve } from "@/components/engenharia/PixelDissolve";
import { ScrollShowcase } from "@/components/engenharia/ScrollShowcase";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/hero/Hero";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProductsSection } from "@/components/produtos/ProductsSection";
import { ServicesSection } from "@/components/servicos/ServicesSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <LoadingScreen />
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ScrollShowcase />
        <PixelDissolve />
        <ProductsSection />
        <PixelDissolve fromColor="#eaeaea" toColor="#ffffff" />
        <ServicesSection />
        {/* Transition into Contato by zooming into "CR MESQUITA" centered on
            the Q's own stroke until the screen is fully black — explicit
            request, replacing an earlier "small rectangle expands to fill
            the screen" idea. See ContatoStage.tsx and
            CrMesquitaZoomTransition.tsx's own header comments for the full
            chain of earlier attempts here. */}
        <ContatoStage />
      </main>
      <Footer />
    </div>
  );
}
