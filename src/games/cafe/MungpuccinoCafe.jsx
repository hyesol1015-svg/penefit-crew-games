import GameShell from '../../components/GameShell.jsx'
import BuildingStage, { StepList } from '../../components/BuildingStage.jsx'

/**
 * MungpuccinoCafe — 멍푸치노 카페
 *
 * [현재 상태] 게임 진입 구조와 반응형 화면 틀만 연결된 단계입니다.
 * 실제 플레이 기능은 다음 작업 단계에서 아래 순서대로 구현합니다.
 * GameShell(공통 화면 틀)을 그대로 쓰기 때문에, 구현할 때는
 * 무대(children)와 패널(left/right), 버튼(actions)만 채우면 됩니다.
 */
const PLANNED_STEPS = [
  '컵 디자인 고르기',
  '펫용 베이스 재료 고르기',
  '컵에 재료 붓기',
  '거품·펫용 토핑 올리기',
  '발바닥·하트 장식 만들기',
  '완성된 멍푸치노 서빙하기',
]

function MungpuccinoCafe({ onHome }) {
  return (
    <GameShell
      title="멍푸치노 카페"
      eyebrow="PENEFIT CREW CAFE"
      characterId="cafe"
      onHome={onHome}
      right={<StepList steps={PLANNED_STEPS} />}
      rightTitle="만들기 순서"
    >
      <BuildingStage
        emoji="☕"
        title="폭신한 거품 위에 발바닥 장식을 올린 펫 음료"
        note="플레이 기능은 다음 작업 단계에서 만들어요. 지금은 화면 배치만 확인할 수 있어요."
      />
    </GameShell>
  )
}

export default MungpuccinoCafe
