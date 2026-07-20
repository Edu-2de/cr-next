import { tv } from "tailwind-variants";
import { AboutSection } from "./AboutSection";
import { CrMesquitaZoomTransition } from "./CrMesquitaZoomTransition";

const aboutStageStyles = tv({
  slots: {
    stage: "relative",
  },
});

export function AboutStage() {
  const { stage } = aboutStageStyles();

  return (
    <div className={stage()}>
      <CrMesquitaZoomTransition />
      <AboutSection />
    </div>
  );
}
