import { AboutSection } from "./AboutSection";
import { CrMesquitaZoomTransition } from "./CrMesquitaZoomTransition";

export function AboutStage() {
  return (
    <div className="relative">
      <CrMesquitaZoomTransition />
      <AboutSection />
    </div>
  );
}
