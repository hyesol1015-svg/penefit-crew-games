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
  '반죽 재료 고르기',
  '버튼 연타·드래그로 반죽 섞기',
  '밀대로 반죽 밀기',
  '쿠키틀 고르기 (강아지·고양이·하트·별)',
  '오븐 굽기 타이밍 미니게임',
  '아이싱과 장식 올리기',
  '완성 화면',
]

function CookieBakery({ onHome }) {
  return (
    <GameShell
      title="쿠키 베이커리"
      eyebrow="PENEFIT CREW BAKERY"
      characterId="cookie"
      onHome={onHome}
      right={<StepList steps={PLANNED_STEPS} />}
      rightTitle="만들기 순서"
    >
      <BuildingStage
        emoji="🍪"
        title="반죽부터 아이싱까지, 직접 만드는 펫 쿠키"
        note="플레이 기능은 다음 작업 단계에서 만들어요. 지금은 화면 배치만 확인할 수 있어요."
      />
    </GameShell>
  )
}

export default CookieBakery
