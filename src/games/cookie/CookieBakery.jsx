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
import BakeStage from './BakeStage.jsx'
import DecorateStage from './DecorateStage.jsx'
import CookieFinish from './CookieFinish.jsx'
import { CookieTray, CutterCardArt } from './CookieArt.jsx'
import { Decoration } from './DecorArt.jsx'
import {
  STEPS,
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
  MAX_DECOR_PER_COOKIE,
  BAKE,
  DECORATIONS,
  bakedColors,
  icingPalette,
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
 *   ⑤ Bake Cookies  : 트레이를 오븐에 넣고, Perfect 구간에서 Stop (타이밍 게임, 약 5~8초)
 *   ⑥ Decorate      : 장식 4종 × 파스텔 아이싱 4색으로 쿠키마다 꾸미기
 *   ⑦ Finish        : 접시에 담긴 완성 쿠키 + 크루 축하 + PENEFITGAME 바우처
 *
 * ★ 게임용 가상 레시피예요. 실제 반려동물 쿠키 레시피가 아니에요.
 *
 * 화면 틀은 공통 GameShell 을 쓰고, 고른 맛·반죽 상태·쿠키는 모든 단계에서 그대로 유지돼요.
 */

const NEXT_LABELS = ['Next: Mix ▶', 'Next: Roll ▶', 'Next: Cut ▶', 'Next: Bake ▶', 'Next: Decorate ▶', 'Finish!']

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

  // ⑤ 굽기
  const [bakePhase, setBakePhase] = useState('idle') // idle | loading | baking | result
  const [doneness, setDoneness] = useState(0) // 0~1 (구운 정도)
  const [elapsed, setElapsed] = useState(0) // 오븐 타이머 (ms)
  const [bakeResult, setBakeResult] = useState(null) // soft | perfect | crispy
  const [bakedLevel, setBakedLevel] = useState(0) // 성공했을 때의 구운 정도 (쿠키 색)
  const rafRef = useRef(0)
  const donenessRef = useRef(0)
  const loadTimer = useRef(0)

  // ⑥ 꾸미기
  const [decorType, setDecorType] = useState(DECORATIONS[0].id)
  const [icingId, setIcingId] = useState('flavor')
  const [decorations, setDecorations] = useState([])
  const [selectedCookie, setSelectedCookie] = useState(null)
  const [newestDecor, setNewestDecor] = useState(null)

  // ⑦ 완성 화면
  const [isDone, setIsDone] = useState(false)

  const idCounter = useRef(0)
  const makeId = () => ++idCounter.current

  const noticeTimer = useRef(null)
  const showNotice = (text) => {
    setNotice(text)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 1700)
  }
  useEffect(
    () => () => {
      clearTimeout(noticeTimer.current)
      clearTimeout(loadTimer.current)
      cancelAnimationFrame(rafRef.current)
    },
    [],
  )

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
    bake: bakeResult === 'perfect',
    decorate: decorations.length >= 1, // 장식을 하나라도 올리면 Finish
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
    if (bakePhase === 'loading' || bakePhase === 'baking') resetBake() // 굽는 도중 다른 단계로 가면 굽기를 처음으로
    setStepIndex(index)
  }
  const goNext = () => canGoNext && goToStep(stepIndex + 1)
  const goPrev = () => stepIndex > 0 && goToStep(stepIndex - 1)

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
    resetBake() // 쿠키가 바뀌면 다시 구워야 해요
  }
  const undoCookie = () => {
    const last = cookies[cookies.length - 1]
    setCookies((list) => list.slice(0, -1))
    if (last) setDecorations((ds) => ds.filter((d) => d.cookieId !== last.id))
    setStampId(null)
    resetBake()
  }
  const clearCookies = () => {
    setCookies([])
    setDecorations([])
    setStampId(null)
    resetBake()
  }

  /* ── ⑤ 굽기 (타이밍 게임) ── */
  function resetBake() {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(loadTimer.current)
    donenessRef.current = 0
    setBakePhase('idle')
    setDoneness(0)
    setElapsed(0)
    setBakeResult(null)
  }

  const finishBake = (d) => {
    cancelAnimationFrame(rafRef.current)
    const [p0, p1] = BAKE.PERFECT
    const result = d < p0 ? 'soft' : d <= p1 ? 'perfect' : 'crispy'
    setBakePhase('result')
    setBakeResult(result)
    if (result === 'perfect') setBakedLevel(d)
  }

  const startBake = () => {
    if (bakePhase !== 'idle') return
    setBakePhase('loading') // 트레이가 오븐 안으로 쏙
    loadTimer.current = setTimeout(() => {
      setBakePhase('baking')
      const t0 = performance.now()
      const tick = (now) => {
        const el = now - t0
        const d = Math.min(el / BAKE.DURATION, 1)
        donenessRef.current = d
        setElapsed(el)
        setDoneness(d)
        if (d >= 1) finishBake(1) // 끝까지 가면 너무 바삭해요
        else rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 750)
  }

  const stopBake = () => {
    if (bakePhase !== 'baking') return
    finishBake(donenessRef.current)
  }

  /* ── ⑥ 꾸미기 ── */
  const palette = icingPalette(flavor)
  const icing = palette.find((c) => c.id === icingId) ?? palette[0]
  const handleDecorate = (cookieId, x, y) => {
    setSelectedCookie(cookieId)
    if (decorations.filter((d) => d.cookieId === cookieId).length >= MAX_DECOR_PER_COOKIE) {
      showNotice('This cookie is full! Try another one.')
      return
    }
    const id = makeId()
    const size = (decorType === 'dots' ? 6.6 : 6) * (0.92 + Math.random() * 0.16)
    const rot = Math.round((Math.random() - 0.5) * 40)
    setDecorations((ds) => [...ds, { id, cookieId, type: decorType, color: icing.color, x, y, rot, size }])
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
    bake:
      bakePhase === 'idle'
        ? 'Tap Bake! Then tap Stop in the Perfect zone.'
        : bakePhase === 'loading'
          ? 'Into the oven we go!'
          : bakePhase === 'baking'
            ? doneness < BAKE.PERFECT[0]
              ? 'Baking... wait for it!'
              : doneness <= BAKE.PERFECT[1]
                ? 'Now! Tap Stop!'
                : 'Hurry, tap Stop!'
            : bakeResult === 'perfect'
              ? 'Golden and perfect! Tap Next to decorate.'
              : bakeResult === 'soft'
                ? 'Still a bit soft. Let\'s try again!'
                : 'Oops, a little too crispy! Let\'s try again!',
    decorate:
      notice ||
      (decorations.length === 0
        ? 'Pick a decoration, then tap a cookie!'
        : 'So pretty! Decorate more or tap Finish!'),
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
      <StepBar steps={STEPS} current={isDone ? STEPS.length - 1 : stepIndex} reachable={reachable} onSelect={goToStep} />
      {step === 'mix' && meter('Mixing', mixProgress, <>Mixed <b>{Math.round(mixProgress * 100)}%</b></>)}
      {step === 'roll' && meter('Rolling', flat, <>Rolls <b>{rollCount}</b> / {ROLL_PASSES}</>)}
      {step === 'bake' && (
        <div className="meter cookie-meter bake-meter">
          <div
            className="bake-meter__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(doneness * 100)}
            aria-label="Baking"
            style={{ '--p0': `${BAKE.PERFECT[0] * 100}%`, '--p1': `${BAKE.PERFECT[1] * 100}%` }}
          >
            <span className="bake-meter__zone" aria-hidden="true">
              Perfect
            </span>
            <span className="bake-meter__marker" style={{ left: `${doneness * 100}%` }} aria-hidden="true" />
          </div>
          <span className="stage__count">
            ⏱ <b>{(elapsed / 1000).toFixed(1)}s</b>
          </span>
        </div>
      )}
      {step === 'decorate' && (
        <div className="meter cookie-meter">
          <span className="stage__count">
            Decorations <b>{decorations.length}</b>
          </span>
        </div>
      )}
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

  const bakeButton =
    bakePhase === 'baking' ? (
      <button key="stop" type="button" className="bake-btn bake-btn--stop" onClick={stopBake}>
        ■ Stop!
      </button>
    ) : bakePhase === 'result' && bakeResult !== 'perfect' ? (
      <button key="retry" type="button" className="bake-btn" onClick={resetBake}>
        ↺ Try Again
      </button>
    ) : bakePhase === 'result' ? (
      <button key="done" type="button" className="bake-btn bake-btn--done" disabled>
        ✓ Perfectly Baked
      </button>
    ) : (
      <button key="bake" type="button" className="bake-btn" onClick={startBake} disabled={bakePhase === 'loading'}>
        {bakePhase === 'loading' ? 'Into the oven...' : 'Bake!'}
      </button>
    )

  const bakePanel = (
    <div className="powder-panel bake-panel">
      {bakeButton}
      <p className={`bake-result ${bakeResult ? `is-${bakeResult}` : ''}`} aria-live="polite">
        {bakeResult === 'perfect'
          ? 'Golden and perfect!'
          : bakeResult === 'soft'
            ? 'Too soft! Stop a little later.'
            : bakeResult === 'crispy'
              ? 'Too crispy! Stop a little sooner.'
              : 'Stop when the marker is in the green Perfect zone.'}
      </p>
      {bakeResult === 'perfect' && (
        <button type="button" className="text-btn" onClick={resetBake}>
          Bake again
        </button>
      )}
      <p className="panel-help">You can also tap the oven to stop.</p>
    </div>
  )

  const decoratePanel = (
    <div className="powder-panel decor-panel">
      <div className="option-grid decor-grid" role="radiogroup" aria-label="Decoration">
        {DECORATIONS.map((d) => {
          const active = decorType === d.id
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`chip chip--decor ${active ? 'is-active' : ''}`}
              onClick={() => setDecorType(d.id)}
            >
              <svg className="chip__decor" viewBox="-10 -10 20 20" aria-hidden="true">
                <circle r="9.5" fill="#FFF6EA" />
                <Decoration type={d.id} color={icing.color} size={6.4} palette={palette.map((c) => c.color)} />
              </svg>
              <span className="chip__name">{d.name}</span>
            </button>
          )
        })}
      </div>
      <div className="icing-row" role="radiogroup" aria-label="Icing color">
        {palette.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={icingId === c.id}
            aria-label={`${c.name} icing`}
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
      <p className="panel-help">Decorate at least 1 cookie. Make each one different!</p>
    </div>
  )

  const panels = {
    flavor: flavorPicker,
    mix: progressPanel(mixProgress, mixProgress >= 1, { todo: 'Stir to mix the dough', done: 'Dough is ready!', help: 'Move your finger or mouse in circles inside the bowl.' }, 4),
    roll: progressPanel(flat, flat >= 1, { todo: `Roll ${ROLL_PASSES} times`, done: 'Dough is flat!', help: 'Drag the rolling pin up and down over the dough.' }, ROLL_PASSES),
    cut: cutterPicker,
    bake: bakePanel,
    decorate: decoratePanel,
  }
  const panelTitles = { flavor: 'Dough Flavor', mix: 'Mix Dough', roll: 'Roll Dough', cut: 'Cookie Cutters', bake: 'Bake Cookies', decorate: 'Decorations' }

  /* ── 노트북 왼쪽 레시피 카드 ── */
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
  } else if (step === 'bake') {
    scene = (
      <div className="cookie-scene">
        <BakeStage flavor={flavor} cookies={cookies} phase={bakePhase} doneness={bakePhase === 'idle' ? 0 : doneness} elapsed={elapsed} onOvenTap={stopBake} />
      </div>
    )
  } else {
    scene = (
      <div className="cookie-scene">
        <DecorateStage
          cookies={cookies}
          colors={bakedColors(flavor, bakedLevel)}
          decorations={decorations}
          palette={palette.map((c) => c.color)}
          selectedId={selectedCookie}
          newestId={newestDecor}
          onDecorate={handleDecorate}
          onMiss={() => showNotice('Tap a cookie to decorate it!')}
        />
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
      overlay={
        isDone && (
          <CookieFinish
            crew={crew}
            flavor={flavor}
            cookies={cookies}
            colors={bakedColors(flavor, bakedLevel)}
            decorations={decorations}
            palette={palette.map((c) => c.color)}
            onRemake={() => onRestart?.()}
            onHome={onHome}
          />
        )
      }
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
