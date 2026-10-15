import CharacterSlot from './CharacterSlot.jsx'
import CrewSprite from './CrewSprite.jsx'
import { ASSETS, assetUrl } from '../gameAssets.js'
import '../styles/shell.css'

/**
 * GameShell — 모든 게임이 함께 쓰는 '게임 화면 틀'
 * ─────────────────────────────────────────────
 * 게임마다 레이아웃을 따로 만들지 않도록, 화면 배치는 여기서 한 번에 처리합니다.
 * 각 게임은 내용물(무대, 왼쪽 패널, 오른쪽 패널, 버튼)만 넘겨 주면 됩니다.
 *
 *   ┌──────────── HUD: 홈 · 게임 이름 · 다시하기 · 캐릭터 ────────────┐
 *   │ [왼쪽 패널]        [ 무대(stage) ]         [오른쪽 패널] │  ← 노트북
 *   │                    [ 하단 버튼(actions) ]               │
 *   └──────────────────────────────────────────────────────────┘
 *
 * 화면 크기에 따라 자동으로 바뀌는 배치 (styles/shell.css)
 *   - 노트북(1280px 이상)  : 무대 가운데, 재료 패널은 양옆
 *   - 아이패드(768~1279px) : 큰 무대 + 아래쪽에 터치하기 좋은 큰 패널 2칸
 *   - 휴대폰(767px 이하)   : 무대 위, 재료 패널은 아래 시트(패널만 스크롤)
 *   - 가로 화면(1279px 이하): 무대 왼쪽, 패널은 오른쪽 세로 기둥
 *
 * props
 *   title, eyebrow : 상단에 보이는 게임 이름 / 작은 영문 제목
 *   characterId    : characters.js 의 캐릭터 키 (임시 이모지 자리)
 *   crew           : 실제 크루 캐릭터 (있으면 characterId 대신 이 캐릭터를 보여 줘요)
 *   showCharacter  : false면 상단 캐릭터 자리를 숨겨요 (게임 안에서 캐릭터를 따로 보여 줄 때)
 *   onHome         : 홈으로 돌아가기
 *   onRestart      : 다시하기 (없으면 버튼이 숨겨짐)
 *   status         : 무대 위쪽에 보일 정보 (게이지, 점수 등)
 *   left, right    : 왼쪽/오른쪽 패널 내용,  leftTitle, rightTitle : 패널 제목
 *   leftClassName, rightClassName : 패널에 추가할 CSS 클래스 (선택)
 *   actions        : 하단 버튼 영역 (완성, 초기화 등)
 *   overlay        : 완성 화면처럼 위에 덮이는 화면
 *   children       : 무대(stage) 안에 들어갈 게임 장면
 */
function GameShell({
  title,
  eyebrow = 'PENEFIT CREW KITCHEN',
  characterId,
  crew,
  showCharacter = true,
  onHome,
  onRestart,
  status,
  left,
  leftTitle,
  leftClassName = '',
  right,
  rightTitle,
  rightClassName = '',
  actions,
  overlay,
  className = '',
  children,
}) {
  const kitchenBg = assetUrl(ASSETS.kitchenBackground)
  const hasPanels = Boolean(left || right)

  return (
    <div
      className={`screen shell ${hasPanels ? '' : 'shell--no-panels'} ${kitchenBg ? 'has-bg-image' : ''} ${className}`}
      style={kitchenBg ? { backgroundImage: `url(${kitchenBg})` } : undefined}
    >
      {/* 배경 이미지가 없을 때만 보이는 임시 주방 (벽지 + 창문) */}
      <div className="kitchen" aria-hidden="true">
        <div className="kitchen__window" />
      </div>

      {/* ── HUD (상단 바) ── */}
      <header className="shell__hud">
        <button type="button" className="round-btn" onClick={onHome} aria-label="Home">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z" />
          </svg>
        </button>
        <div className="shell__plate">
          <span className="shell__eyebrow">{eyebrow}</span>
          <h1 className="shell__title">{title}</h1>
        </div>
        {onRestart && (
          <button type="button" className="round-btn" onClick={onRestart} aria-label="Start over">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12a7 7 0 1 0 2.05-4.95" fill="none" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M4 4v4.6h4.6" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {showCharacter &&
          (crew ? (
            <span className="shell__crew" title={crew.name}>
              <CrewSprite crew={crew} />
            </span>
          ) : (
            <CharacterSlot characterId={characterId} size="sm" />
          ))}
      </header>

      {/* ── 무대 ── */}
      <main className="shell__stage">
        {/* 나무 조리대 (배경 이미지를 쓰면 숨겨짐) */}
        <div className="shell__counter" aria-hidden="true" />
        {status && <div className="shell__status">{status}</div>}
        <div className="shell__scene">{children}</div>
      </main>

      {/* ── 재료 패널 + 버튼 (화면 크기에 따라 배치가 바뀜) ── */}
      {(hasPanels || actions) && (
        <div className="shell__dock">
          {hasPanels && (
            <div className="shell__panels">
              {left && (
                <section className={`panel panel--left ${leftClassName}`} aria-label={leftTitle}>
                  {leftTitle && <h2 className="panel__title">{leftTitle}</h2>}
                  <div className="panel__body">{left}</div>
                </section>
              )}
              {right && (
                <section className={`panel panel--right ${rightClassName}`} aria-label={rightTitle}>
                  {rightTitle && <h2 className="panel__title">{rightTitle}</h2>}
                  <div className="panel__body">{right}</div>
                </section>
              )}
            </div>
          )}
          {actions && <div className="shell__actions">{actions}</div>}
        </div>
      )}

      {overlay}
    </div>
  )
}

export default GameShell
