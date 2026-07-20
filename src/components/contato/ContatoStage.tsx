import { ContatoSection } from "./ContatoSection";
import { CrMesquitaZoomTransition } from "./CrMesquitaZoomTransition";

// Wraps the "CR MESQUITA" zoom transition and ContatoSection. Used to also
// wrap a shared sticky Aurora canvas here (see git history / CLAUDE
// memory), but the aurora background was dropped per explicit request:
// "ao invés de na seção de quem somos ter o efeito aurora, deixe a tela
// toda preta mesmo" — both children now just use plain solid black
// backgrounds directly, no shared canvas needed.
export function ContatoStage() {
  return (
    <div className="relative">
      <CrMesquitaZoomTransition />
      <ContatoSection />
    </div>
  );
}
