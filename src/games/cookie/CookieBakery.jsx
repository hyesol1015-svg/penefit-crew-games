import GameShell from '../../components/GameShell.jsx'
import BuildingStage, { StepList } from '../../components/BuildingStage.jsx'

/**
 * CookieBakery — 쿠키 베이커리
 *
 * [현재 상태] 게임 진입 구조와 반응형 화면 틀만 연결된 단계입니다.
 * 실제 플레이 기능은 다음 작업 단계에서 아래 순서대로 구현합니다.
 * GameShell(공통 화면 틀)을 그대로 쓰기 때문에, 구현할 때는
 * 무대(children)와 패널(left/right), 버튼(actions)만 채우면 됩니다.
 */
const PLANNED_STEPS = [
  'Pick your dough ingredients',
  'Mix the dough (tap fast or drag)',
  'Roll out the dough',
  'Pick a cutter (puppy, kitty, heart, star)',
  'Bake it! Oven timing mini game',
  'Add icing and decorations',
  'Ta-da! Your cookies are ready',
]

function CookieBakery({ onHome }) {
  return (
    <GameShell
      title="Cookie Bakery"
      eyebrow="PENEFIT CREW BAKERY"
      characterId="cookie"
      onHome={onHome}
      right={<StepList steps={PLANNED_STEPS} />}
      rightTitle="How to Make"
    >
      <BuildingStage
        emoji="🍪"
        title="Bake pet cookies, from dough to icing"
        note="Play mode is coming in the next update. For now you can preview the layout."
      />
    </GameShell>
  )
}

export default CookieBakery
