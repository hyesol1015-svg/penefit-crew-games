import { useEffect, useRef, useState } from 'react'
import GameShell from '../../components/GameShell.jsx'
import CrewSprite from '../../components/CrewSprite.jsx'
import { findCrew } from '../../characters.js'
// 밥꾸 스튜디오와 같은 진행 표시·파우더 아이콘·공통 게임 UI 스타일을 재사용해요 (밥꾸 파일은 바꾸지 않아요)
import StepBar from '../bapkku/StepBar.jsx'
import PowderIcon from '../bapkku/PowderIcon.jsx'
import MixStage from './MixStage.jsx'
import RollStage from './RollStage.jsx'
import CutStage from './CutStage.jsx'
import { CookieTray, CutterCardArt } from './CookieArt.jsx'
import {
  STEPS,
  COMING_STEPS,
  FLAVORS,
  DEFAULT_FLAVOR_ID,
  MIX_TURNS,
  ROLL_PASSES,
  ROLL_PASS_DISTANCE,
  CUTTERS,
  DEFAULT_CUTTER_ID,
  SHEET,
  MAX_COOKIES,
  MIN_COOKIES,
  findCookieSpot,
} from './cookieData.js'
import '../../styles/bapkku.css'
import '../../styles/cookie.css'

/**
 * CookieBakery — 쿠키 베이커리
 *
 * 지금 플레이할 수 있는 단계
 *   ① Choose Flavor : 페네핏 파우더 6종 중 반죽 맛 고르기 (반죽 색이 바뀌어요)
 *   ② Mix Dough     : 그릇 안에서 원을 그리며 저어 반죽 만들기 (약 3~4초)
 *   ③ Roll Dough    : 밀대를 위아래로 4번 밀어 반죽 펴기
 *   ④ Cut Shapes    : 쿠키틀 5종으로 반죽 찍기 → 베이킹 트레이에 모으기
 *   ⑤ Ready to Bake : 굽기 '준비' 화면 (굽기·꾸미기·완성은 다음 작업에서 만들어요)
 *
 * ★ 게임용 가상 레시피예요. 실제 반려동물 쿠키 레시피가 아니에요.
 *
 * 화면 틀은 공통 GameShell 을 쓰고, 고른 맛·반죽 상태·쿠키는 모든 단계에서 그대로 유지돼요.
 */

const NEXT_LABELS = ['Next: Mix ▶', 'Next: Roll ▶', 'Next: Cut ▶', 'Next: Bake ▶', 'Baking Coming Soon']

function CookieBakery({ onHome, onRestart, crewId }) {
  const crew = findCrew(crewId)

  const [stepIndex, setStepIndex] = useState(0)
  const [flavorId, setFlavorId] = useState(DEFAULT_FLAVOR_ID)
  const [mixed, setMixed] = useState(0) // 저은 양 (라디안)
  const [swirl, setSwirl] = useState(0) // 소용돌이 그림용 각도
  const [rolled, setRolled] = useState(0) // 반죽 위를 민 거리 (SVG 단위)
  const [cutterId, setCutterId] = useState(DEFAULT_CUTTER_ID)
  const [cookies, setCookies] = useState([])
  const [stampId, setStampId] = useState(null)
  const [notice, setNotice] = useState('')

  const idCounter = useRef(0)
  const makeId = () => ++idCounter.current

  const noticeTimer = useRef(null)
  const showNotice = (text) => {
    setNotice(text)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 1700)
  }
  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const step = STEPS[stepIndex].id
  const flavor = FLAVORS.find((f) => f.id === flavorId) ?? FLAVORS[0]
  const mixGoal = Math.PI * 2 * MIX_TURNS
  const mixProgress = Math.min(mixed / mixGoal, 1)
  const rollGoal = ROLL_PASSES * ROLL_PASS_DISTANCE
  const flat = Math.min(rolled / rollGoal, 1)
  // 다 민 횟수 (반올림 오차 때문에 아주 조금 모자라도 한 번으로 쳐요)
  const rollCount = Math.min(ROLL_PASSES, Math.floor(rolled / ROLL_PASS_DISTANCE + 0.02))

  /* ── 단계 조건 ── */
  const complete = {
    flavor: Boolean(flavor),
    mix: mixProgress >= 1,
    roll: flat >= 1,
    cut: cookies.length >= MIN_COOKIES,
    ready: false, // 굽기는 아직 만들지 않았어요
  }
  const firstIncomplete = STEPS.findIndex((s) => !complete[s.id])
  const reachable = firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete
  const canGoNext = stepIndex < STEPS.length - 1 && complete[step]

  const goToStep = (index) => {
    if (index <= reachable) setStepIndex(index)
  }
  const goNext = () => canGoNext && goToStep(stepIndex + 1)
  const goPrev = () => stepIndex > 0 && setStepIndex(stepIndex - 1)

  /* ── ② 섞기 ── */
  const handleStir = (amount, signed) => {
    setMixed((m) => Math.min(m + amount, mixGoal))
    setSwirl((s) => s + signed)
  }

  /* ── ③ 밀기 ── */
  const handleRoll = (amount) => setRolled((r) => Math.min(r + amount, rollGoal))

  /* ── ④ 찍기 ── */
  const handleStamp = (x, y) => {
    if (cookies.length >= MAX_COOKIES) {
      showNotice('The tray is full! Tap Next to bake.')
      return
    }
    let spot = null
    if (x === null) {
      // 키보드로 찍을 때: 반죽 위 빈자리를 차례로 찾아요
      for (let i = 0; i < 60 && !spot; i += 1) {
        const a = i * 2.39996
        const r = Math.sqrt(i / 60)
        spot = findCookieSpot(SHEET.cx + Math.cos(a) * r * SHEET.rx * 0.7, SHEET.cy + Math.sin(a) * r * SHEET.ry * 0.7, cookies)
      }
    } else {
      spot = findCookieSpot(x, y + 2, cookies)
    }
    if (!spot) {
      showNotice('No room there! Try an empty spot on the dough.')
      return
    }
    const id = makeId()
    const rot = Math.round((Math.random() - 0.5) * 24)
    setCookies((list) => [...list, { id, cutterId, x: spot.x, y: spot.y, rot }])
    setStampId(id)
  }
  const undoCookie = () => {
    setCookies((list) => list.slice(0, -1))
    setStampId(null)
  }
  const clearCookies = () => {
    setCookies([])
    setStampId(null)
  }

  /* ── 크루 말풍선 ── */
  const cutter = CUTTERS.find((c) => c.id === cutterId)
  const hints = {
    flavor: `Let's bake! Pick a flavor for the dough. ${flavor.name} it is?`,
    mix:
      mixProgress >= 1
        ? 'Smooth dough! Tap Next to roll it.'
        : mixProgress > 0.55
          ? 'It is coming together. Keep stirring!'
          : mixProgress > 0
            ? 'Nice! Keep going round and round.'
            : 'Stir in circles inside the bowl!',
    roll:
      flat >= 1
        ? 'Nice and flat! Tap Next to cut shapes.'
        : rolled > 0
          ? `Roll it again! ${rollCount} / ${ROLL_PASSES}`
          : 'Drag the rolling pin up and down over the dough!',
    cut:
      notice ||
      (cookies.length === 0
        ? `Tap the dough to cut a ${cutter.name} cookie!`
        : cookies.length >= MAX_COOKIES
          ? 'The tray is full! Tap Next.'
          : 'So cute! Cut more shapes or tap Next.'),
    ready: 'Your cookies are on the tray. Baking is coming soon!',
  }

  /* ── 위쪽: 단계 표시 + 진행 게이지 ── */
  const meter = (label, value, text) => (
    <div className="meter cookie-meter">
      <div className="meter__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label}>
        <div className="meter__fill" style={{ width: `${value * 100}%` }} />
      </div>
      <span className="stage__count">{text}</span>
    </div>
  )
  const status = (
    <>
      <StepBar steps={STEPS} current={stepIndex} reachable={Math.min(reachable, STEPS.length - 1)} onSelect={goToStep} />
      {step === 'mix' && meter('Mixing', mixProgress, <>Mixed <b>{Math.round(mixProgress * 100)}%</b></>)}
      {step === 'roll' && meter('Rolling', flat, <>Rolls <b>{rollCount}</b> / {ROLL_PASSES}</>)}
      {step === 'cut' && (
        <div className="meter cookie-meter">
          <span className="stage__count">
            Cookies <b>{cookies.length}</b> / {MAX_COOKIES}
          </span>
        </div>
      )}
    </>
  )

  /* ── 단계별 패널 ── */
  const flavorPicker = (
    <div className="powder-panel">
      <div className="option-grid" role="radiogroup" aria-label="Dough flavor">
        {FLAVORS.map((f) => {
          const active = flavorId === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`chip chip--topper ${active ? 'is-active' : ''}`}
              style={{ '--powder': f.label }}
              onClick={() => setFlavorId(f.id)}
            >
              <PowderIcon topper={f} />
              <span className="chip__text">
                <span className="chip__name">{f.name}</span>
                <span className="chip__sub">{f.colorName}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="panel-help">A pretend game recipe, just for fun.</p>
    </div>
  )

  const progressPanel = (value, done, lines, dots) => (
    <div className="powder-panel cookie-progress">
      <div className="cookie-progress__dots" aria-hidden="true">
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className={`food-panel__dot ${i < Math.round(value * dots + 0.0001) ? 'is-filled' : ''}`} />
        ))}
      </div>
      <p className="cookie-progress__title">{done ? lines.done : lines.todo}</p>
      <p className="panel-help">{lines.help}</p>
      <ul className="cookie-recipe" aria-label="Game recipe">
        <li>
          <span className="cookie-recipe__swatch" style={{ background: flavor.flour }} aria-hidden="true" />
          Cookie flour
        </li>
        <li>
          <span className="cookie-recipe__swatch" style={{ background: flavor.color }} aria-hidden="true" />
          {flavor.name} powder
        </li>
        <li>
          <span className="cookie-recipe__swatch" style={{ background: '#BFE6F2' }} aria-hidden="true" />
          Water
        </li>
      </ul>
    </div>
  )

  const cutterPicker = (
    <div className="powder-panel">
      <div className="option-grid cutter-grid" role="radiogroup" aria-label="Cookie cutter">
        {CUTTERS.map((c) => {
          const active = cutterId === c.id
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`chip chip--cutter ${active ? 'is-active' : ''}`}
              onClick={() => setCutterId(c.id)}
            >
              <span className="chip__cutter" aria-hidden="true">
                <CutterCardArt cutterId={c.id} flavor={flavor} />
              </span>
              <span className="chip__name">{c.name}</span>
            </button>
          )
        })}
      </div>
      <div className="powder-panel__tools">
        <button type="button" className="tool-btn" onClick={undoCookie} disabled={cookies.length === 0}>
          ↶ Undo
        </button>
        <button type="button" className="tool-btn" onClick={clearCookies} disabled={cookies.length === 0}>
          ↺ Clear All
        </button>
      </div>
      <p className="panel-help">Cut at least {MIN_COOKIES} cookie. Mix shapes as you like!</p>
    </div>
  )

  const comingPanel = (
    <div className="powder-panel coming-next">
      <p className="coming-next__lead">
        <b>{cookies.length}</b> {flavor.name} {cookies.length === 1 ? 'cookie is' : 'cookies are'} ready for the oven.
      </p>
      <ul className="coming-next__list">
        {COMING_STEPS.map((s) => (
          <li key={s}>
            <span>{s}</span>
            <span className="coming-next__tag">Coming soon</span>
          </li>
        ))}
      </ul>
      <p className="panel-help">These steps will be added in the next update.</p>
    </div>
  )

  const panels = {
    flavor: flavorPicker,
    mix: progressPanel(mixProgress, mixProgress >= 1, { todo: 'Stir to mix the dough', done: 'Dough is ready!', help: 'Move your finger or mouse in circles inside the bowl.' }, 4),
    roll: progressPanel(flat, flat >= 1, { todo: `Roll ${ROLL_PASSES} times`, done: 'Dough is flat!', help: 'Drag the rolling pin up and down over the dough.' }, ROLL_PASSES),
    cut: cutterPicker,
    ready: comingPanel,
  }
  const panelTitles = { flavor: 'Dough Flavor', mix: 'Mix Dough', roll: 'Roll Dough', cut: 'Cookie Cutters', ready: 'Next Up' }

  /* ── 노트북 왼쪽 레시피 카드 ── */
  const recipeCard = (
    <div className="recipe">
      <p className="recipe__step">
        STEP {stepIndex + 1} · {STEPS[stepIndex].title}
      </p>
      <p className="recipe__tip">{STEPS[stepIndex].tip}</p>
      <ul className="recipe__list">
        {STEPS.slice(0, 4).map((s, i) => (
          <li key={s.id} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
            {i < stepIndex ? '✓' : '•'} {s.title}
          </li>
        ))}
        {COMING_STEPS.map((s) => (
          <li key={s} className="is-soon">
            • {s} <small>(soon)</small>
          </li>
        ))}
      </ul>
      <p className="recipe__note">A pretend recipe for the game, not a real pet recipe.</p>
    </div>
  )

  /* ── 하단 버튼 ── */
  const actions = (
    <>
      <button type="button" className="btn btn--ghost" onClick={goPrev} disabled={stepIndex === 0}>
        ◀ Back
      </button>
      <button type="button" className={`btn btn--primary ${canGoNext ? 'is-ready' : ''}`} onClick={goNext} disabled={!canGoNext}>
        {NEXT_LABELS[stepIndex]}
      </button>
    </>
  )

  /* ── 무대 ── */
  let scene
  if (step === 'flavor' || step === 'mix') {
    scene = (
      <div className="cookie-scene">
        <MixStage
          key={step === 'flavor' ? `flavor-${flavorId}` : 'mix'}
          flavor={flavor}
          progress={step === 'flavor' ? 0 : mixProgress}
          swirl={step === 'flavor' ? 0 : swirl}
          interactive={step === 'mix'}
          onStir={handleStir}
        />
        {step === 'flavor' && (
          <span key={flavorId} className="flavor-tag" style={{ '--powder': flavor.label }}>
            <PowderIcon topper={flavor} />
            <span>
              {flavor.name} <small>{flavor.colorName}</small>
            </span>
          </span>
        )}
      </div>
    )
  } else if (step === 'roll') {
    scene = (
      <div className="cookie-scene">
        <RollStage flavor={flavor} flat={flat} onRoll={handleRoll} />
      </div>
    )
  } else if (step === 'cut') {
    scene = (
      <div className="cookie-scene cookie-scene--cut">
        <CutStage flavor={flavor} cutterId={cutterId} cookies={cookies} stampId={stampId} onStamp={handleStamp} />
        <CookieTray cookies={cookies} flavor={flavor} max={MAX_COOKIES} />
      </div>
    )
  } else {
    scene = (
      <div className="cookie-scene cookie-scene--ready">
        <div className="ready-card">
          <span className="ready-card__badge">Coming soon</span>
          <CookieTray cookies={cookies} flavor={flavor} big max={Math.max(cookies.length, 4)} />
          <p className="ready-card__text">Ready for the oven!</p>
        </div>
      </div>
    )
  }

  return (
    <GameShell
      className={`cookie cookie--${step}`}
      title="Cookie Bakery"
      eyebrow="PENEFIT CREW BAKERY"
      characterId="cookie"
      showCharacter={false}
      onHome={onHome}
      onRestart={onRestart}
      status={status}
      left={recipeCard}
      leftTitle="Game Recipe"
      leftClassName="panel--recipe"
      right={panels[step]}
      rightTitle={panelTitles[step]}
      actions={actions}
    >
      {/* 안내: 고른 크루가 말풍선으로 알려 줘요 */}
      <div className="guide">
        <span key={step} className="guide__crew">
          <CrewSprite crew={crew} />
        </span>
        <p className="stage__hint guide__bubble" aria-live="polite">
          <span className="guide__name">{crew.name}</span>
          {hints[step]}
        </p>
      </div>
      {scene}
    </GameShell>
  )
}

export default CookieBakery
