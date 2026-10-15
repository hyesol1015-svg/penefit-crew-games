import GameShell from '../../components/GameShell.jsx'
import BuildingStage, { StepList } from '../../components/BuildingStage.jsx'

/**
 * JellyLab — 말랑젤리 연구소
 *
 * [현재 상태] 게임 진입 구조와 반응형 화면 틀만 연결된 단계입니다.
 * 실제 플레이 기능은 다음 작업 단계에서 아래 순서대로 구현합니다.
 * GameShell(공통 화면 틀)을 그대로 쓰기 때문에, 구현할 때는
 * 무대(children)와 패널(left/right), 버튼(actions)만 채우면 됩니다.
 */
const PLANNED_STEPS = [
  '두 가지 색 섞기',
  '몰드 고르기 (강아지·고양이·곰·별·하트)',
  '몰드에 액체 붓기',
  '굳히기 미니게임',
  '젤리 꺼내기 (클릭·드래그)',
  '말랑말랑 흔들리는 젤리 완성',
]

function JellyLab({ onHome }) {
  return (
    <GameShell
      title="말랑젤리 연구소"
      eyebrow="PENEFIT CREW JELLY LAB"
      characterId="jelly"
      onHome={onHome}
      right={<StepList steps={PLANNED_STEPS} />}
      rightTitle="만들기 순서"
    >
      <BuildingStage
        emoji="🍮"
        title="사람용 디저트 놀이 — 색을 섞어 만드는 말랑 젤리"
        note="플레이 기능은 다음 작업 단계에서 만들어요. 지금은 화면 배치만 확인할 수 있어요."
      />
    </GameShell>
  )
}

export default JellyLab
