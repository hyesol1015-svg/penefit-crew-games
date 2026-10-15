import GameShell from '../../components/GameShell.jsx'
import BuildingStage, { StepList } from '../../components/BuildingStage.jsx'

/**
 * JellyLab — 말랑젤리 연구소
 *
 * [현재 상태] 게임 진입 구조와 반응형 화면 틀만 연결된 단계입니다.
 * 실제 플레이 기능은 다음 작업 단계에서 아래 순서대로 구현합니다.
 * GameShell(공통 화면 틀)을 그대로 쓰기 때문에, 구현할 때는
 * 무대(children)와 패널(left/right), 버튼(actions)만 채우면 됩니다.
 *
 * [게임 콘셉트] 반려동물용 젤리 간식 만들기
 *   - 하리보처럼 귀여운 곰·하트·별·강아지·고양이 모양 젤리틀 사용
 *   - 재료는 '무가당 펫 재료'를 전제로 한 게임 속 설정입니다.
 *     (예: 단호박·고구마·블루베리 같은 재료 이름, 설탕을 넣지 않은 베이스)
 *   - 자일리톨, 초콜릿, 포도·건포도, 양파·마늘처럼 반려동물에게
 *     해로운 것으로 알려진 재료는 재료 목록에 넣지 않습니다.
 *   - 게임 속 레시피는 놀이용 설정이며, 실제로 먹여도 안전한지
 *     검증된 레시피처럼 표현하지 않습니다.
 */
const PLANNED_STEPS = [
  '무가당 젤리 베이스 재료 고르기',
  '두 가지 색 베이스 섞기',
  '젤리틀 고르기 (곰·하트·별·강아지·고양이)',
  '젤리틀에 붓기',
  '굳히기 미니게임',
  '젤리 꺼내기 (클릭·드래그)',
  '말랑말랑 흔들리는 펫 젤리 완성',
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
        title="곰·하트·별 젤리틀로 만드는 말랑 펫 젤리 간식"
        note="플레이 기능은 다음 작업 단계에서 만들어요. 게임 속 레시피는 놀이용 설정이에요."
      />
    </GameShell>
  )
}

export default JellyLab
