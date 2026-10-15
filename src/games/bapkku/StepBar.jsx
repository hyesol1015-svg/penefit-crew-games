/**
 * StepBar — 밥꾸 만들기 진행 표시
 *
 *   ① 그릇 ─ ② 사료 ─ ③ 파우더 ─ ④ 토핑 ─ ⑤ 완성
 *
 * - 지금 단계는 크게 강조, 끝낸 단계에는 ✓ 표시
 * - 이미 지나온 단계(또는 갈 수 있는 단계)를 누르면 그 단계로 이동 → '뒤로 가기'
 * - 아직 조건을 채우지 못한 단계는 잠겨 있어요
 *
 * props
 *   steps     : STEPS 배열 (bapkkuData.js)
 *   current   : 지금 단계 번호 (0부터)
 *   reachable : 갈 수 있는 가장 먼 단계 번호
 *   onSelect  : (번호) => void
 */
function StepBar({ steps, current, reachable, onSelect }) {
  return (
    <nav className="stepbar" aria-label="만들기 단계">
      <ol className="stepbar__list">
        {steps.map((step, i) => {
          const state = i === current ? 'is-current' : i < current ? 'is-done' : i <= reachable ? 'is-open' : 'is-locked'
          const canGo = i !== current && i <= reachable
          return (
            <li key={step.id} className={`stepbar__item ${state}`}>
              <button
                type="button"
                className="stepbar__btn"
                onClick={() => canGo && onSelect(i)}
                disabled={!canGo && i !== current}
                aria-current={i === current ? 'step' : undefined}
                aria-label={`${i + 1}단계 ${step.label}${i < current ? ' (완료)' : ''}`}
              >
                <span className="stepbar__dot">{i < current ? '✓' : i + 1}</span>
                <span className="stepbar__label">{step.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StepBar
