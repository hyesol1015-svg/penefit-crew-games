import { useEffect, useRef, useState } from 'react'
import GameShell from '../../components/GameShell.jsx'
import CrewSprite from '../../components/CrewSprite.jsx'
import { findCrew } from '../../characters.js'
// 다른 게임과 같은 진행 표시 · 파우더 아이콘 · 공통 게임 UI 스타일을 재사용해요
import StepBar from '../bapkku/StepBar.jsx'
import PowderIcon from '../bapkku/PowderIcon.jsx'
import JellyMixBowl from './JellyMixBowl.jsx'
import JellyStage from './JellyStage.jsx'
import JellyFinish from './JellyFinish.jsx'
import { JellyShape } from './JellyArt.jsx'
import { STEPS, FLAVORS, DEFAULT_FLAVOR_ID, MOLDS, DEFAULT_MOLD_ID, SLOTS, MIX_TURNS, jellyColors } from './jellyData.js'
import '../../styles/bapkku.css'
import '../../styles/jelly.css'

/**
 * JellyLab — 말랑젤리 연구소 (Gummy Lab)
 *
 *   ① Choose Flavor : 첫 번째 맛 (실제 페네핏 파우더 6종, 기본 색)
 *   ② Mix Jelly     : 두 번째 맛을 고르고 원을 그리며 저어 색 섞기 (약 3초, 같은 맛도 OK)
 *   ③ Choose Mold   : Bear · Heart · Star · Dog · Cat 실리콘 몰드 (6칸 트레이, 미리보기)
 *   ④ Pour Jelly    : 비커를 끌어 몰드 칸 위에서 붓기 (몰드 밖에서는 안 부어져요, 약 3초)
 *   ⑤ Set Jelly     : 칠 지팡이를 젤리 위에 대거나 톡톡 → 반투명하고 탱글하게 (약 4~5초)
 *   ⑥ Pop It Out    : 젤리를 톡 누르거나 위로 끌어 꺼내 접시에 담기
 *   ⑦ Finish        : 완성 젤리 + 크루 축하 + PENEFITGAME 바우처
 *
 * ★ 반려동물용 젤리 간식을 만드는 '게임 속 가상 레시피'예요. 실제 급여 안전성이나 영양 효과를 보증하지 않아요.
 */
const NEXT_LABELS = ['Next: Mix ▶', 'Next: Mold ▶', 'Next: Pour ▶', 'Next: Set ▶', 'Next: Pop ▶', 'Finish!']
const EMPTY = SLOTS.map(() => 0)

function JellyLab({ onHome, onRestart, crewId }) {
  const crew = findCrew(crewId)

  const [stepIndex, setStepIndex] = useState(0)
  const [firstId, setFirstId] = useState(DEFAULT_FLAVOR_ID)
  const [secondId, setSecondId] = useState(FLAVORS[2]?.id ?? DEFAULT_FLAVOR_ID)
  const [mixed, setMixed] = useState(0)
  const [swirl, setSwirl] = useState(0)
  const [moldId, setMoldId] = useState(DEFAULT_MOLD_ID)
  const [fills, setFills] = useState(EMPTY)
  const [sets, setSets] = useState(EMPTY)
  const [newlySet, setNewlySet] = useState([])
  const [popped, setPopped] = useState(SLOTS.map(() => false))
  const [plateItems, setPlateItems] = useState([])
  const [isDone, setIsDone] = useState(false)
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
  const first = FLAVORS.find((f) => f.id === firstId) ?? FLAVORS[0]
  const second = FLAVORS.find((f) => f.id === secondId) ?? first
  const mixGoal = Math.PI * 2 * MIX_TURNS
  const mixProgress = Math.min(mixed / mixGoal, 1)
  // 섞기 전에는 첫 번째 맛 색, 다 섞으면 두 맛을 섞은 색
  const colors = jellyColors(first, mixProgress >= 1 ? second : first)
  const mold = MOLDS.find((m) => m.id === moldId) ?? MOLDS[0]
  const filledCount = fills.filter((f) => f >= 1).length
  const setAvg = sets.reduce((a, v) => a + Math.min(v, 1), 0) / SLOTS.length
  const setCount = sets.filter((v) => v >= 1).length

  /* ── 단계 조건 ── */
  const complete = {
    flavor: Boolean(first),
    mix: mixProgress >= 1,
    mold: Boolean(mold),
    pour: filledCount === SLOTS.length,
    set: setCount === SLOTS.length,
    pop: plateItems.length >= 1,
  }
  const firstIncomplete = STEPS.findIndex((s) => s.id !== 'done' && !complete[s.id])
  const reachable = firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete
  const canGoNext = complete[step]

  const goToStep = (index) => {
    if (index > reachable) return
    if (STEPS[index].id === 'done') {
      setIsDone(true)
      return
    }
    setStepIndex(index)
  }
  const goNext = () => canGoNext && goToStep(stepIndex + 1)
  const goPrev = () => stepIndex > 0 && goToStep(stepIndex - 1)

  /* ── 조작 ── */
  const handleStir = (amount, signed) => {
    setMixed((m) => Math.min(m + amount, mixGoal))
    setSwirl((s) => s + signed)
  }
  const handlePour = (i, amount) => setFills((prev) => prev.map((f, k) => (k === i ? Math.min(1, f + amount) : f)))
  const handleSet = (i, amount) => {
    const before = sets[i]
    if (before >= 1 || fills[i] < 1) return
    setSets((prev) => prev.map((v, k) => (k === i ? Math.min(1, v + amount) : v)))
    if (before + amount >= 1) setNewlySet((ns) => (ns.includes(i) ? ns : [...ns, i]))
  }
  const handlePop = (i, from) => {
    if (popped[i] || sets[i] < 1) return
    setPopped((prev) => prev.map((p, k) => (k === i ? true : p)))
    setPlateItems((items) => [...items, { id: makeId(), slot: i, from }])
  }

  /* ── 크루 말풍선 ── */
  const hints = {
    flavor: `Welcome to the Gummy Lab! Pick a base flavor. ${first.name}?`,
    mix:
      mixProgress >= 1
        ? 'What a pretty color! Tap Next.'
        : mixProgress > 0.5
          ? 'The colors are blending. Keep stirring!'
          : mixProgress > 0
            ? 'Round and round!'
            : 'Pick a second flavor, then stir in circles!',
    mold: `${mold.name} molds! So cute. Pick any shape you like.`,
    pour:
      filledCount === SLOTS.length
        ? 'All filled! Tap Next to set them.'
        : filledCount > 0
          ? `Nice pour! ${filledCount} / ${SLOTS.length} molds filled.`
          : 'Drag the beaker over a mold to pour!',
    set:
      setCount === SLOTS.length
        ? 'Wobbly and set! Tap Next to pop them out.'
        : setAvg > 0
          ? 'Brrr! Chill each jelly until it sparkles.'
          : 'Hold the chill wand over a jelly, or tap it!',
    pop:
      notice ||
      (plateItems.length === 0
        ? 'Tap a gummy, or drag it up, to pop it out!'
        : plateItems.length === SLOTS.length
          ? 'All on the plate! Tap Finish!'
          : 'Boing! Pop more or tap Finish!'),
  }

  /* ── 위쪽: 단계 표시 + 게이지 ── */
  const meter = (label, value, text) => (
    <div className="meter jelly-meter">
      <div className="meter__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label}>
        <div className="meter__fill" style={{ width: `${value * 100}%` }} />
      </div>
      <span className="stage__count">{text}</span>
    </div>
  )
  const status = (
    <>
      <StepBar steps={STEPS} current={isDone ? STEPS.length - 1 : stepIndex} reachable={reachable} onSelect={goToStep} />
      {step === 'mix' && meter('Mixing', mixProgress, <>Mixed <b>{Math.floor(mixProgress * 100)}%</b></>)}
      {step === 'pour' &&
        meter('Pouring', fills.reduce((a, f) => a + f, 0) / SLOTS.length, <>Molds <b>{filledCount}</b> / {SLOTS.length}</>)}
      {step === 'set' && meter('Setting', setAvg, <>Set <b>{Math.floor(setAvg * 100)}%</b></>)}
      {step === 'pop' && meter('Popped', plateItems.length / SLOTS.length, <>Popped <b>{plateItems.length}</b> / {SLOTS.length}</>)}
    </>
  )

  /* ── 패널 ── */
  const flavorGrid = (selected, onPick, label) => (
    <div className="option-grid" role="radiogroup" aria-label={label}>
      {FLAVORS.map((f) => (
        <button
          key={f.id}
          type="button"
          role="radio"
          aria-checked={selected === f.id}
          className={`chip chip--topper ${selected === f.id ? 'is-active' : ''}`}
          style={{ '--powder': f.label }}
          onClick={() => onPick(f.id)}
        >
          <PowderIcon topper={f} />
          <span className="chip__text">
            <span className="chip__name">{f.name}</span>
            <span className="chip__sub">{f.colorName}</span>
          </span>
        </button>
      ))}
    </div>
  )

  const progressPanel = (title, help, n, done) => (
    <div className="powder-panel jelly-progress">
      <div className="jelly-progress__dots" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`jelly-dot ${i < done ? 'is-filled' : ''}`} style={{ '--jelly': colors.base }} />
        ))}
      </div>
      <p className="jelly-progress__title">{title}</p>
      <p className="panel-help">{help}</p>
    </div>
  )

  const panels = {
    flavor: (
      <div className="powder-panel">
        {flavorGrid(firstId, setFirstId, 'First flavor')}
        <p className="panel-help">A pretend pet gummy recipe for the game.</p>
      </div>
    ),
    mix: (
      <div className="powder-panel">
        <p className="jelly-panel-label">
          2nd flavor <span>(same flavor is OK!)</span>
        </p>
        {flavorGrid(secondId, setSecondId, 'Second flavor')}
        <p className="panel-help">Stir in circles inside the bowl to mix the two colors.</p>
      </div>
    ),
    mold: (
      <div className="powder-panel">
        <div className="option-grid mold-grid" role="radiogroup" aria-label="Jelly mold">
          {MOLDS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={moldId === m.id}
              className={`chip chip--mold ${moldId === m.id ? 'is-active' : ''}`}
              onClick={() => setMoldId(m.id)}
            >
              <svg className="chip__mold" viewBox="-24 -24 48 48" aria-hidden="true">
                <JellyShape moldId={m.id} colors={colors} fill={1} set={1} />
              </svg>
              <span className="chip__name">{m.name}</span>
            </button>
          ))}
        </div>
        <p className="panel-help">One tray makes {SLOTS.length} gummies.</p>
      </div>
    ),
    pour: progressPanel(
      filledCount === SLOTS.length ? 'All molds filled!' : 'Fill every mold',
      'Drag the beaker and hold it over a mold. It will not pour outside the molds.',
      SLOTS.length,
      filledCount,
    ),
    set: progressPanel(
      setCount === SLOTS.length ? 'All set and wobbly!' : 'Chill each jelly',
      'Hold the chill wand over a jelly, or tap it a few times.',
      SLOTS.length,
      setCount,
    ),
    pop: progressPanel(
      plateItems.length === SLOTS.length ? 'Plate is full!' : 'Pop the gummies',
      'Tap or drag up a gummy. Pop as many as you like, then tap Finish.',
      SLOTS.length,
      plateItems.length,
    ),
  }
  const panelTitles = { flavor: 'Base Flavor', mix: 'Mix Jelly', mold: 'Jelly Molds', pour: 'Pour Jelly', set: 'Set Jelly', pop: 'Pop It Out' }

  const recipeCard = (
    <div className="recipe">
      <p className="recipe__step">
        STEP {stepIndex + 1} · {STEPS[stepIndex].title}
      </p>
      <p className="recipe__tip">{STEPS[stepIndex].tip}</p>
      <ul className="recipe__list">
        {STEPS.slice(0, -1).map((s, i) => (
          <li key={s.id} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
            {i < stepIndex ? '✓' : '•'} {s.title}
          </li>
        ))}
      </ul>
      <p className="recipe__note jelly-note">A pretend pet gummy recipe for the game, not a real pet recipe.</p>
    </div>
  )

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
  const scene =
    step === 'flavor' || step === 'mix' ? (
      <JellyMixBowl
        key={step === 'flavor' ? `f-${firstId}` : 'mix'}
        first={first}
        second={step === 'flavor' ? first : second}
        mix={step === 'flavor' ? 0 : mixProgress}
        swirl={step === 'flavor' ? 0 : swirl}
        interactive={step === 'mix'}
        onStir={handleStir}
      />
    ) : (
      <JellyStage
        mode={step}
        moldId={moldId}
        colors={colors}
        fills={fills}
        sets={sets}
        popped={popped}
        plateItems={plateItems}
        newlySet={newlySet}
        onPour={handlePour}
        onSet={handleSet}
        onPop={handlePop}
        onMiss={() => showNotice('Tap a gummy that is still in the mold!')}
      />
    )

  return (
    <GameShell
      className={`jelly jelly--${step}`}
      title="Gummy Lab"
      eyebrow="PENEFIT CREW GUMMY LAB"
      characterId="jelly"
      showCharacter={false}
      onHome={onHome}
      onRestart={onRestart}
      status={status}
      left={recipeCard}
      leftTitle="Lab Notes"
      leftClassName="panel--recipe"
      right={panels[step]}
      rightTitle={panelTitles[step]}
      actions={actions}
      overlay={
        isDone && (
          <JellyFinish
            crew={crew}
            mold={mold}
            first={first}
            second={second}
            colors={colors}
            items={plateItems}
            onRemake={() => onRestart?.()}
            onHome={onHome}
          />
        )
      }
    >
      <div className="guide">
        <span key={step} className="guide__crew">
          <CrewSprite crew={crew} />
        </span>
        <p className="stage__hint guide__bubble" aria-live="polite">
          <span className="guide__name">{crew.name}</span>
          {hints[step]}
        </p>
      </div>
      <div key={step} className="jelly-scene">
        {scene}
        {(step === 'flavor' || step === 'mix') && (
          <span className="jelly-flavor-tags">
            <span key={firstId} className="jelly-flavor-tag" style={{ '--powder': first.label }}>
              <PowderIcon topper={first} />
              <span>{first.name}</span>
            </span>
            {step === 'mix' && (
              <>
                <span className="jelly-flavor-plus" aria-hidden="true">
                  +
                </span>
                <span key={secondId} className="jelly-flavor-tag" style={{ '--powder': second.label }}>
                  <PowderIcon topper={second} />
                  <span>{second.name}</span>
                </span>
              </>
            )}
          </span>
        )}
      </div>
    </GameShell>
  )
}

export default JellyLab
