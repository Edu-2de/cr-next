# Motion Signature — CR Mesquita

Contrato curto. Toda animação no site obedece isto; uma seção só pode desviar com pedido explícito e registrado.

## 1. Metáfora física — "Massa que chega exato"

O site se move como uma peça pesada indexada num torno CNC: a travessia entre posições carrega inércia real (é maciça, resiste a começar, ganha velocidade, não para de repente) — mas a **chegada** em cada posição é um encaixe exato, não um pouso suave. Peso na viagem, precisão na parada. Isso proíbe duas coisas ao mesmo tempo: nada pode se mover como se fosse leve (sem `power2`/`ease-out` fraco, sem início instantâneo), e nada pode "assentar" gradualmente ao chegar (sem deceleração longa e suave no fim — o fim é abrupto e definitivo, como um came travando).

## 2. Ease vocabulary

Duas curvas nomeadas, fisicamente opostas na largada, nenhuma outra é usada no projeto.

```js
// massTravel — a massa se movendo sozinha (motor indexando, scrub de câmera,
// qualquer movimento GRANDE). Resiste a começar, ganha velocidade, chega a
// toda velocidade contra um batente — nunca desacelera suavemente no fim.
// tanIN=0.07 (arranque quase morto) · tanOUT=3.0 (ainda subindo na chegada)
CustomEase.create("massTravel", "M0,0 C0.6,0.04 0.9,0.7 1,1")

// massSnap — a massa sendo ATINGIDA (cards, divisores, leituras numéricas
// reagindo no instante em que uma estação já travou). Toda a energia está
// em t=0: não resiste a nada, não antecipa. Perfil de seguidor de came
// entre dois batentes — íngreme nas duas pontas, quase linear no meio.
// tanIN=2.0 · tanOUT=2.0 (simétrica; y(0.5)=0.5 exato por construção)
CustomEase.create("massSnap", "M0,0 C0.1,0.2 0.9,0.8 1,1")
```

Desvio máximo entre as duas curvas ≈0.29 (perto de x≈0.55) — se um redesign futuro delas convergir a menos de 0.15 de diferença ao longo do domínio, é sinal de que colapsaram numa curva só com dois nomes, refazer.

**Proibido sem exceção:** `back.out`, `elastic`, qualquer bezier com overshoot (y > 1 ou y < 0 em algum ponto), `bounce`, easing simétrico tipo `sine.inOut` para movimento primário, e qualquer bezier cujo control point final tenha `y = 1` (força tangente final horizontal — é sempre um ease-out de cauda longa, não uma parada dura, não importa onde o outro control point esteja).

## 3. Escala de tempo

Três durações, razão ~1:3:10 — a razão é o que importa, não os números exatos:

- **0.18s** — micro: reação de um elemento dependente a uma estação já travada (um número mudando, um traço de divisor).
- **0.6s** — elemento: um card ou grupo de texto travando na nova estação.
- **1.8s** — cena: travessia completa entre duas estações quando não está sendo escrubada por scroll ativo (ex.: correção de posição após o usuário parar de rolar no meio do caminho).

## 4. Propriedades permitidas e proibidas

**Permitido:** `transform` (translate/scale/rotate — rotação sempre em torno do eixo mecânico fixo do próprio motor, nunca de um pivô arbitrário), `clip-path` (revelações de aresta reta, nunca máscara suave), largura de borda / `stroke-dashoffset` (traços mecânicos, tipo régua ou marca de corte), `filter: contrast()`/`brightness()` em degraus (para simular foco/fora-de-foco entre estações), `box-shadow` estático de offset fixo (espessura física, nunca glow).

**Proibido, explícito:**
- `opacity` isolado como único sinal de entrada — sempre acompanhado de um corte posicional/clip duro, nunca "fade" sozinho carregando a cena.
- `filter: blur()` como recurso de foco suave ou "sonho" — leitura de vidro/orgânico, contradiz "máquina". Se precisar de pull-focus, usa contraste em degrau, não blur.
- `skew` — lê como borracha/flexível, não peça rígida.
- Gradiente animado de fundo, blob, aurora, partículas genéricas, bloom.
- Stagger `index * 0.1` uniforme ou `Math.random()` — todo stagger é determinístico e vinculado a distância física até a origem (o eixo do motor) ou ao índice da estação.
- `ScrollTrigger` com `snap: true` ou qualquer `scrollTo()` forçado — ver mecanismo da seção abaixo, o motivo é estrutural, não estético.

## 5. Ritmo global — onde o site não anima

- **Header**: nunca anima em resposta a conteúdo/scroll — só troca de tema claro/escuro por leitura de estado (`data-theme`), instantâneo, sem transição visível. É o único elemento permanentemente estável na tela.
- **Dentro de qualquer seção "estação"**: o intervalo entre a chegada numa estação e o início da travessia seguinte é silêncio total — zero micro-idle, zero loop ambiente, zero respiração. A quietude entre estações é o que torna a chegada seguinte legível como decisiva; se algo sempre está se mexendo um pouco, nenhuma chegada lê como "exata".

## 6. Mecanismo por seção

### Motor Showcase (`components/motor/*`)

**3 estações**, mapeadas na taxonomia de specs já existente no conteúdo (Torque/Desempenho, Precisão/Tolerância, Robustez/Proteção) — o movimento argumenta o mesmo texto que os cards já diziam, não inventa um tema novo.

- **Estação 1 (Torque) — rotação-reação.** O node `body` do GLB (`public/electric_motor.glb`) faz uma rotação rígida pequena (2-4°) em torno do eixo do próprio eixo-motor, chegando com `massTravel` e parando duro — lê como reação de torque contra o ponto de montagem, não como deformação da carcaça. **Sem flexão de malha**: o GLB não tem skin, morph targets nem animations (confirmado por inspeção direta do JSON chunk do GLB), então qualquer "flex" precisaria de shader de vértice e leria como `skew` — proibido pela Seção 4. Rotação rígida em eixo fixo é o que a Seção 4 já permite, e é fisicamente mais correto: um motor não flexiona a carcaça visivelmente sob carga, o que reage é a montagem.
- **Estação 2 (Precisão) — rotação-indexação.** O grupo inteiro gira um valor exato e grande (ex.: 45°/90°) em torno do eixo de indexação, com `massTravel` — reposicionamento deliberado, não giro orgânico "até parecer bom". **Diferença estrutural de E1, não só de grau**: E1 é reação (pequena, eixo de torque, o motor sofre o movimento), E2 é indexação (grande, eixo de posicionamento, o motor executa o movimento). Confundir as duas como "duas variações do mesmo giro" apaga a tese — são dois verbos diferentes.
- **Estação 3 (Robustez) — desacoplagem real, não corte simulado.** O GLB tem 3 nodes geometricamente separados: `body`, `parts` (montagem interna, 8260 verts) e `closingPart` (tampa/end-cap, 3724 verts, bbox em z encaixando exatamente contra `parts`). `closingPart` translada/rotaciona pra fora ao longo do próprio eixo até um offset exato, com `massTravel`, revelando `parts` por trás. **Nada de `clip-path` na malha** — clip-path não existe em geometria WebGL; um corte real exigiria `THREE.Plane`/`clippingPlanes` e ainda daria casca oca sem capping. Desmontar uma peça que já é modelada separada é mais simples, honesto e correto que simular um corte.
- **Origem do movimento:** eixo de montagem fixo do motor. Cards, divisores e leituras não têm entrada própria — são posicionados/escalados em função da distância até esse eixo, nunca como composição independente.
- **Cards de spec:** não entram por scroll contínuo. Leem um estado discreto ("estação atual travada") e disparam com `massSnap` no instante em que a trava acontece; se o scroll para no meio de uma travessia, o card fica parado com ela — sem loop, sem respiração (Seção 5).
- **Scroll:** nunca escreve a posição de scroll (sem `ScrollTrigger snap:true`, sem `scrollTo()` forçado). Cada estação tem orçamento de travessia (largo) + platô de chegada (largo, nada muda) — a transição visual entre elas ocorre comprimida nos primeiros ~3-5% daquele orçamento, remapeada 1:1 do progresso real de scroll. Scroll lento desenrola a chegada proporcionalmente; scroll normal lê como corte decisivo. A rolagem nativa nunca é interceptada — só a distância visual por unidade de scroll varia. (Técnica já validada nesta seção numa sessão anterior com uma janela de remap de ~2.5% para opacidade; aqui aplicada a `rotation`/posição do `closingPart` em vez de opacidade.)
