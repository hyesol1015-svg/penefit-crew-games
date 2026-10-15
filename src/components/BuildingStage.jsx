/**
 * BuildingStage — 아직 플레이 화면을 만들기 전인 게임의 임시 무대
 *
 * 게임 진입 구조와 반응형 레이아웃을 먼저 확인할 수 있도록,
 * 이 게임에서 앞으로 만들 단계들을 보여 줍니다.
 * 각 게임을 실제로 구현하면 이 컴포넌트 대신 진짜 게임 장면이 들어갑니다.
 */
function BuildingStage({ emoji, title, note }) {
  return (
    <div className="building">
      <div className="building__plate" aria-hidden="true">
        <span className="building__emoji">{emoji}</span>
      </div>
      <p className="building__title">{title}</p>
      <p className="building__note">{note}</p>
    </div>
  )
}

/** 앞으로 만들 단계 목록 (오른쪽/아래 패널에 표시) */
export function StepList({ steps }) {
  return (
    <ol className="step-list">
      {steps.map((step, i) => (
        <li key={step} className="step-list__item">
          <span className="step-list__num">{i + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

export default BuildingStage
