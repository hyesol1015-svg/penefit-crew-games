import { useEffect, useRef, useState } from 'react'
import GameShell from '../../components/GameShell.jsx'
import CrewSprite from '../../components/CrewSprite.jsx'
import { findCrew } from '../../characters.js'
// 다른 게임과 같은 진행 표시 · 파우더 아이콘 · 장식 그림 · 공통 게임 UI 스타일을 재사용해요
import StepBar from '../bapkku/StepBar.jsx'
import PowderIcon from '../bapkku/PowderIcon.jsx'
import { Decoration } from '../cookie/DecorArt.jsx'
import MixPourStage from './MixPourStage.jsx'
import CafeStage from './CafeStage.jsx'
import CafeFinish from './CafeFinish.jsx'
import { Cup } from './CupArt.jsx'
import {
  STEPS,
  CUPS,
  DEFAULT_CUP_ID,
  DRINKS,
  DEFAULT_DRINK_ID,
  MIX_TURNS,
  DECORATIONS,
  MAX_DECORATIONS,
  icingPalette,
} from './cafeData.js'
import '../../styles/bapkku.css'
import '../../styles/cafe.css'

/**
 * MungpuccinoCafe — 멍푸치노 카페 (Puppuccino Café)
 *
 *   ① Choose Cup     : 컵 5색 (Cream · Pink · Mint · Lavender · Butter Yellow)
 *   ② Choose Flavor  : 실제 페네핏 파우더 6종 → 음료 색이 바뀌어요
 *   ③ Mix & Pour     : 원을 그리며 저어 섞기(약 3초) → 피처를 끌어 컵에 붓기(약 2~3초)
 *   ④ Add Foam       : 펫 전용 거품기를 컵 위에서 누르고 움직이기(약 2~4초), 빙글빙글 → 소용돌이
 *   ⑤ Decorate       : 장식 4종 × 파스텔 4색, 거품 위를 눌러 올리기
 *   ⑥ Finish         : 완성 멍푸치노 + 크루 축하 + PENEFITGAME 바우처
 *
 * ★ 게임 속 가상 펫 음료예요. 실제 반려동물 음료 레시피나 급여 안내가 아니에요.
 */
const NEXT_LABELS = ['Next: Flavor ▶', 'Next: Mix ▶', 'Next: Foam ▶', 'Next: Decorate ▶', 'Finish!']

function MungpuccinoCafe({ onHome, onRestart, crewId }) {
  const crew = findCrew(crewId)

  const [stepIndex, setStepIndex] = useState(0)
  const [cupId, setCupId] = useState(DEFAULT_CUP_ID)
  const [drinkId, setDrinkId] = useState(DEFAULT_DRINK_ID)
  const [mixed, setMixed] = useState(0) // 저은 양 (라디안)
  const [swirl, setSwirl] = useState(0) // 섞을 때 소용돌이 각도
  const [level, setLevel] = useState(0) // 컵 수위 0~1
  const [foam, setFoam] = useState(0) // 거품 0~1
  const [foamSwirl, setFoamSwirl] = useState(0) // 거품 소용돌이 각도
  const [decorType, setDecorType] = useState(DECORATIONS[0].id)
  const [icingId, setIcingId] = useState('flavor')
  const [decorations, setDecorations] = useState([])
  const [newestDecor, setNewestDecor] = useState(null)
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
  const cup = CUPS.find((c) => c.id === cupId) ?? CUPS[0]
  const drink = DRINKS.find((d) => d.id === drinkId) ?? DRINKS[0]
  const mixGoal = Math.PI * 2 * MIX_TURNS
  const mixProgress = Math.min(mixed / mixGoal, 1)
  const palette = icingPalette(drink)
  const icing = palette.find((c) => c.id === icingId) ?? palette[0]

  /* ── 단계 조건 ── */
  const complete = {
    cup: Boolean(cup),
    flavor: Boolean(drink),
    mix: mixProgress >= 1 && level >= 1,
    foam: foam >= 1,
    decorate: decorations.length >= 1,
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
  const handlePour = (d) => setLevel((l) => Math.min(1, l + d))
  const handleFoam = (amount, swirlDelta) => {
    setFoam((f) => Math.min(1, f + amount))
    if (swirlDelta) setFoamSwirl((s) => Math.min(Math.PI * 6, s + Math.abs(swirlDelta)))
  }
  const handleDecorate = (x, y) => {
    if (decorations.length >= MAX_DECORATIONS) {
      showNotice('The foam is full of decorations!')
      return
    }
    const id = makeId()
    const size = (decorType === 'dots' ? 8.6 : 8) * (0.92 + Math.random() * 0.16)
    const rot = Math.round((Math.random() - 0.5) * 40)
    setDecorations((ds) => [...ds, { id, type: decorType, color: icing.color, x, y, rot, size }])
    setNewestDecor(id)
  }
  const undoDecor = () => {
    setDecorations((ds) => ds.slice(0, -1))
    setNewestDecor(null)
  }
  const clearDecor = () => {
    setDecorations([])
    setNewestDecor(null)
  }

  /* ── 크루 말풍선 ── */
  const mixHint =
    mixProgress < 1
      ? mixProgress > 0.5
        ? 'Almost mixed. Keep stirring!'
        : mixProgress > 0
          ? 'Nice! Round and round!'
          : 'Stir in circles to mix the drink!'
      : level >= 1
        ? 'The cup is full! Tap Next for foam.'
        : level > 0
          ? 'Pouring... keep it over the cup!'
          : 'Drag the pitcher over the cup to pour!'
  const hints = {
    cup: `Welcome to the café! Pick a cup. ${cup.name} looks cute!`,
    flavor: `Which flavor today? ${drink.name} it is?`,
    mix: mixHint,
    foam:
      foam >= 1
        ? foamSwirl > Math.PI * 2
          ? 'Wow, a swirly foam top! Tap Next.'
          : 'Fluffy! Tap Next to decorate.'
        : foam > 0
          ? 'Keep going! Swirl it round and round!'
          : 'Hold the whisk over the cup and move it!',
    decorate:
      notice ||
      (decorations.length === 0 ? 'Pick a decoration, then tap the foam!' : 'So cute! Add more or tap Finish!'),
  }

  /* ── 위쪽: 단계 표시 + 게이지 ── */
  const meter = (label, value, text) => (
    <div className="meter cafe-meter">
      <div className="meter__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={label}>
        <div className="meter__fill" style={{ width: `${value * 100}%` }} />
      </div>
      <span className="stage__count">{text}</span>
    </div>
  )
  const status = (
    <>
      <StepBar steps={STEPS} current={isDone ? STEPS.length - 1 : stepIndex} reachable={reachable} onSelect={goToStep} />
      {step === 'mix' &&
        (mixProgress < 1
          ? meter('Mixing', mixProgress, <>Mixed <b>{Math.round(mixProgress * 100)}%</b></>)
          : meter('Pouring', level, <>Cup <b>{Math.round(level * 100)}%</b></>))}
      {step === 'foam' && meter('Foam', foam, <>Foam <b>{Math.round(foam * 100)}%</b></>)}
      {step === 'decorate' && (
        <div className="meter cafe-meter">
          <span className="stage__count">
            Decorations <b>{decorations.length}</b> / {MAX_DECORATIONS}
          </span>
        </div>
      )}
    </>
  )

  /* ── 패널 ── */
  const cupPicker = (
    <div className="powder-panel">
      <div className="option-grid cup-grid" role="radiogroup" aria-label="Cup color">
        {CUPS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={cupId === c.id}
            className={`chip chip--cup ${cupId === c.id ? 'is-active' : ''}`}
            onClick={() => setCupId(c.id)}
          >
            <svg className="chip__cup" viewBox="-60 -128 128 136" aria-hidden="true">
              <Cup cup={c} />
            </svg>
            <span className="chip__name">{c.name}</span>
          </button>
        ))}
      </div>
      <p className="panel-help">A pretend café treat, just for fun.</p>
    </div>
  )

  const flavorPicker = (
    <div className="powder-panel">
      <div className="option-grid" role="radiogroup" aria-label="Drink flavor">
        {DRINKS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={drinkId === f.id}
            className={`chip chip--topper ${drinkId === f.id ? 'is-active' : ''}`}
            style={{ '--powder': f.label }}
            onClick={() => setDrinkId(f.id)}
          >
            <PowderIcon topper={f} />
            <span className="chip__text">
              <span className="chip__name">{f.name}</span>
              <span className="chip__sub">{f.colorName}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="panel-help">A pretend game recipe, not a real pet recipe.</p>
    </div>
  )

  const progressPanel = (title, help, dots, value) => (
    <div className="powder-panel cafe-progress">
      <div className="cafe-progress__dots" aria-hidden="true">
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className={`food-panel__dot ${i < Math.round(value * dots + 0.0001) ? 'is-filled' : ''}`} />
        ))}
      </div>
      <p className="cafe-progress__title">{title}</p>
      <p className="panel-help">{help}</p>
    </div>
  )

  const mixPanel =
    mixProgress < 1
      ? progressPanel('1. Stir to mix', 'Move your finger or mouse in circles inside the bowl.', 4, mixProgress)
      : progressPanel(level >= 1 ? 'Cup is full!' : '2. Pour into the cup', 'Drag the pitcher and hold it over the cup.', 4, level)

  const foamPanel = progressPanel(
    foam >= 1 ? 'Fluffy foam!' : 'Whip the foam',
    'Hold the whisk over the cup and move it. Swirl it for a swirly top!',
    4,
    foam,
  )

  const decoratePanel = (
    <div className="powder-panel">
      <div className="option-grid cafe-decor-grid" role="radiogroup" aria-label="Decoration">
        {DECORATIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={decorType === d.id}
            className={`chip chip--decor ${decorType === d.id ? 'is-active' : ''}`}
            onClick={() => setDecorType(d.id)}
          >
            <svg className="chip__decor" viewBox="-10 -10 20 20" aria-hidden="true">
              <circle r="9.5" fill="#FFF6EA" />
              <Decoration type={d.id} color={icing.color} size={6.4} palette={palette.map((c) => c.color)} />
            </svg>
            <span className="chip__name">{d.name}</span>
          </button>
        ))}
      </div>
      <div className="icing-row" role="radiogroup" aria-label="Decoration color">
        {palette.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={icingId === c.id}
            aria-label={`${c.name} color`}
            title={c.name}
            className={`icing-swatch ${icingId === c.id ? 'is-active' : ''}`}
            style={{ '--icing': c.color }}
            onClick={() => setIcingId(c.id)}
          />
        ))}
      </div>
      <div className="powder-panel__tools">
        <button type="button" className="tool-btn" onClick={undoDecor} disabled={decorations.length === 0}>
          ↶ Undo
        </button>
        <button type="button" className="tool-btn" onClick={clearDecor} disabled={decorations.length === 0}>
          ↺ Clear Decorations
        </button>
      </div>
      <p className="panel-help">Add at least 1 decoration. Mix shapes and colors!</p>
    </div>
  )

  const panels = { cup: cupPicker, flavor: flavorPicker, mix: mixPanel, foam: foamPanel, decorate: decoratePanel }
  const panelTitles = { cup: 'Cups', flavor: 'Drink Flavor', mix: 'Mix & Pour', foam: 'Add Foam', decorate: 'Decorations' }

  /* ── 노트북 왼쪽 메뉴 카드 ── */
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
      <p className="recipe__note">A pretend café treat for the game, not a real pet recipe.</p>
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
  let scene
  if (step === 'cup') {
    scene = <CafeStage mode="show" cup={cup} drink={drink} level={0} foam={0} swirl={0} decorations={[]} palette={[]} />
  } else if (step === 'flavor' || step === 'mix') {
    scene = (
      <MixPourStage
        key={step === 'flavor' ? `flavor-${drinkId}` : 'mix'}
        cup={cup}
        drink={drink}
        mix={step === 'flavor' ? 0 : mixProgress}
        swirl={step === 'flavor' ? 0 : swirl}
        level={level}
        interactive={step === 'mix'}
        onStir={handleStir}
        onPour={handlePour}
      />
    )
  } else {
    scene = (
      <CafeStage
        mode={step}
        cup={cup}
        drink={drink}
        level={level}
        foam={foam}
        swirl={foamSwirl}
        decorations={step === 'decorate' ? decorations : []}
        palette={palette.map((c) => c.color)}
        newestId={newestDecor}
        onFoam={handleFoam}
        onDecorate={handleDecorate}
        onMiss={() => showNotice('Tap the foam on top of the cup!')}
      />
    )
  }

  return (
    <GameShell
      className={`cafe cafe--${step}`}
      title="Puppuccino Café"
      eyebrow="PENEFIT CREW CAFÉ"
      characterId="cafe"
      showCharacter={false}
      onHome={onHome}
      onRestart={onRestart}
      status={status}
      left={recipeCard}
      leftTitle="Café Menu"
      leftClassName="panel--recipe"
      right={panels[step]}
      rightTitle={panelTitles[step]}
      actions={actions}
      overlay={
        isDone && (
          <CafeFinish
            crew={crew}
            cup={cup}
            drink={drink}
            foam={foam}
            swirl={foamSwirl}
            decorations={decorations}
            palette={palette.map((c) => c.color)}
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
      <div key={step} className="cafe-scene">
        {scene}
        {step === 'flavor' && (
          <span key={drinkId} className="cafe-flavor-tag" style={{ '--powder': drink.label }}>
            <PowderIcon topper={drink} />
            <span>
              {drink.name} <small>{drink.colorName}</small>
            </span>
          </span>
        )}
      </div>
    </GameShell>
  )
}

export default MungpuccinoCafe
