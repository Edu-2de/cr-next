import { tv } from "tailwind-variants";
import { AboutStage } from "@/components/sections/about/AboutStage";
import { ScrollShowcase } from "@/components/sections/engineering/ScrollShowcase";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/hero/Hero";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { MIST, PAPER } from "@/lib/palette";
import { PixelDissolve } from "@/components/ui/PixelDissolve";
import { ProductsSection } from "@/components/sections/products/ProductsSection";
import { ServicesSection } from "@/components/sections/services/ServicesSection";

const homeStyles = tv({
  slots: {
    page: "flex flex-1 flex-col",
    main: "flex flex-1 flex-col",
  },
});

export default function Home() {
  const { page, main } = homeStyles();

  return (
    <div className={page()}>
      <LoadingScreen />
      <Header />
      <main className={main()}>
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
