import { AboutStage } from "@/components/sections/about/AboutStage";
import { PixelDissolve } from "@/components/sections/engineering/PixelDissolve";
import { ScrollShowcase } from "@/components/sections/engineering/ScrollShowcase";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/hero/Hero";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { MIST, PAPER } from "@/lib/palette";
import { ProductsSection } from "@/components/sections/products/ProductsSection";
import { ServicesSection } from "@/components/sections/services/ServicesSection";

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
        <PixelDissolve fromColor={MIST} toColor={PAPER} />
        <ServicesSection />
        <AboutStage />
      </main>
      <Footer />
    </div>
  );
}
