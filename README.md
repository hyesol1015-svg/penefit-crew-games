# PENEFIT CREW · Little Kitchen

페네핏 크루의 귀여운 2D 모바일 요리게임 모음입니다.
React + Vite + 순수 CSS/SVG로 만들었고, 유료 API·AI API·외부 데이터베이스를 쓰지 않습니다.
추가로 설치한 패키지도 없습니다.

현재 플레이 가능한 게임: **밥꾸 스튜디오** (사료 그릇에 토퍼 파우더를 뿌려 꾸미기)

---

## 1. 실행 방법 (처음 하는 분용)

> Node.js 18 이상이 필요합니다. VS Code 터미널에서 `node -v`로 확인할 수 있어요.

1. VS Code에서 이 폴더(`penefit-crew-games`)를 엽니다.
2. 메뉴 **터미널 → 새 터미널**을 엽니다.
3. 처음 한 번만 패키지를 설치합니다.
   ```bash
   npm install
   ```
4. 게임을 실행합니다.
   ```bash
   npm run dev
   ```
5. 터미널에 나온 주소 **`http://localhost:5173`** 을 Ctrl+클릭하면 브라우저에서 열립니다.
6. 끌 때는 터미널에서 **Ctrl + C** 를 누릅니다.

코드를 저장하면 브라우저 화면이 자동으로 새로고침됩니다.

### 휴대폰에서 테스트하기

PC와 휴대폰이 **같은 와이파이**에 연결되어 있어야 합니다.

```bash
npm run dev -- --host
```

터미널의 `Network:` 주소(예: `http://192.168.0.12:5173`)를 휴대폰 브라우저에 입력하세요.

PC에서 휴대폰 화면처럼 보려면 Chrome에서 **F12 → 왼쪽 위 휴대폰 아이콘(Ctrl+Shift+M)** 을 누르고 기기를 iPhone 등으로 고르면 됩니다.

### 배포용 빌드

```bash
npm run build     # dist/ 폴더에 결과물 생성 (오류 확인용으로도 사용)
npm run preview   # 빌드 결과 미리보기
npm run lint      # 코드 검사
```

---

## 2. 폴더 구조

```
src/
├─ main.jsx                   # 앱 시작점 (global.css 불러오기)
├─ App.jsx                    # 화면 전환 (메인 ↔ 게임) + 처음부터 다시하기
├─ characters.js              # ★ 캐릭터 이미지 설정 (캐릭터 PNG 교체)
├─ gameAssets.js              # ★ 배경·로고·썸네일·제품 이미지 설정
├─ components/
│  ├─ MainScreen.jsx          # 메인 화면(로비): 캐릭터 + 타이틀 + 게임 카드 4개
│  ├─ GameShell.jsx           # ★ 모든 게임이 함께 쓰는 반응형 게임 화면 틀
│  ├─ CharacterSlot.jsx       # 캐릭터 이미지 자리 (이미지 없으면 이모지 표시)
│  └─ BuildingStage.jsx       # 아직 구현 전인 게임의 임시 무대
├─ games/
│  ├─ gameList.js             # 게임 카드 목록 (이름, 설명, 펫용/사람용 표시)
│  ├─ index.js                # 게임 id ↔ 게임 화면 연결 (등록부)
│  ├─ bapkku/                 # 밥꾸 스튜디오 (플레이 가능)
│  │  ├─ BapkkuStudio.jsx
│  │  ├─ Bowl.jsx
│  │  └─ bapkkuData.js
│  ├─ cookie/CookieBakery.jsx     # 쿠키 베이커리 (화면 틀만 연결, 다음 단계에서 구현)
│  ├─ cafe/MungpuccinoCafe.jsx    # 멍푸치노 카페 (화면 틀만 연결, 다음 단계에서 구현)
│  └─ jelly/JellyLab.jsx          # 말랑젤리 연구소 (화면 틀만 연결, 다음 단계에서 구현)
└─ styles/
   ├─ global.css              # 색상 변수, 말랑 버튼, 주방 배경
   ├─ shell.css               # ★ 게임 화면 반응형 배치 (노트북/아이패드/휴대폰/가로)
   ├─ main.css                # 메인 화면 반응형 배치
   └─ bapkku.css              # 밥꾸 스튜디오 전용 스타일
```

`src/App.css`, `src/index.css`, `src/assets/`는 Vite 기본 템플릿 파일로, 지금은 쓰지 않습니다.

### 화면 크기별 배치

| 화면 | 기준 | 게임 화면 배치 |
| --- | --- | --- |
| 노트북 | 1280px 이상 | 가운데 무대 + 양옆 재료 패널, 무대 아래 버튼 |
| 아이패드 세로 | 768~1279px | 큰 무대 + 아래쪽 큰 패널 2칸 |
| 휴대폰 세로 | 767px 이하 | 위 무대 + 아래 시트 (재료가 많으면 패널만 스크롤) |
| 가로 화면 | 1279px 이하 가로 | 왼쪽 무대 + 오른쪽 패널 기둥 |

모든 게임은 `GameShell`을 쓰므로, 배치를 고치고 싶으면 `styles/shell.css` 한 곳만 수정하면 됩니다.

## 3. 캐릭터 이미지(PNG) 교체 방법

캐릭터 자리에는 지금 임시 이모지(🐶, 🎉)와 점선 원이 보입니다.
캐릭터 얼굴은 코드로 그리지 않았으니, **원본 2D 캐릭터 PNG**를 넣어 주세요.

1. `public/characters/` 폴더를 만들고 PNG 파일을 넣습니다.
2. `src/characters.js`를 열어 `image` 값을 바꿉니다.
   ```js
   main: {
     name: '페네핏 크루',
     image: '/characters/crew-main.png',   // ← null 대신 경로 입력
     emoji: '🐶',
   },
   ```
3. 저장하면 바로 반영됩니다. 점선 테두리와 "캐릭터 자리" 문구는 자동으로 사라집니다.

| 키 | 표시 위치 | 권장 크기 |
| --- | --- | --- |
| `main` | 메인 화면 상단 창문 앞 | 512×512 이상 |
| `bapkku` | 밥꾸 스튜디오 오른쪽 위 | 256×256 이상 |
| `cheer` | 밥꾸 완성 화면 (그릇 옆) | 256×256 이상 |

배경이 투명한 정사각형 PNG를 권장합니다. 파일이 없거나 경로가 틀리면 자동으로 이모지로 돌아갑니다.

---

## 4. 배경·로고·제품 이미지 교체 방법

고품질 이미지가 필요한 자리는 `src/gameAssets.js`에 모아 두었습니다.
지금은 CSS/SVG로 그린 **임시 디자인**이 보이고, 경로를 넣으면 이미지로 바뀝니다.

1. 이미지를 `public/assets/` 폴더에 넣습니다.
2. `src/gameAssets.js`에서 해당 값을 `'/assets/파일이름.png'`로 바꿉니다.

| 설정 | 바뀌는 곳 | 권장 |
| --- | --- | --- |
| `kitchenBackground` | 메인·게임 화면의 주방 배경 (벽지·창문·조리대) | 세로형 1080×1920 이상 |
| `logo` | 메인 화면 'PENEFIT CREW' 글자 | 투명 PNG |
| `gameThumbs.bapkku` 등 | 게임 카드의 이모지 아이콘 | 정사각형 투명 PNG |
| `toppers.pumpkin` 등 | 토퍼 선택 버튼의 임시 병 → 실제 제품 사진 | 정사각형 누끼 PNG |

제품 사진은 코드에서 모양을 바꾸지 않고 원본 그대로(비율 유지) 보여 줍니다.

사료 그릇은 터치 위치에 파우더를 뿌려야 해서 SVG로 그렸습니다. 그릇 색은 `bapkkuData.js`의 `BOWLS`에서 바꿀 수 있습니다.

---

## 5. 밥꾸 스튜디오 플레이 방법

1. 아래 트레이에서 **그릇**(크림 / 핑크 / 민트)을 고릅니다.
2. **토퍼**(단호박 / 비트 / 브로콜리)를 고릅니다.
3. 그릇을 **톡톡 누르거나 누른 채로 문지르면** 파우더가 뿌려집니다.
   그릇 테두리나 몸통을 눌러도 파우더는 사료 위에만 떨어집니다.
4. 위쪽 **토핑 게이지**가 차면서 별이 켜집니다. (1개 / 60개 / 120개)
5. **↺ 초기화**로 다시 시작하고, **완성!**을 누르면 별점 결과 화면이 나옵니다.
6. 결과 화면에서 **다시 만들기** 또는 **메인 화면으로**를 고를 수 있습니다.

---

## 6. 쉽게 고칠 수 있는 부분

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 그릇 색 추가/변경 | `src/games/bapkku/bapkkuData.js` → `BOWLS` |
| 토퍼 종류·색 추가 | `bapkkuData.js` → `TOPPERS` |
| 별점 기준 | `bapkkuData.js` → `STAR_STEPS`, `GOAL` |
| 한 번에 뿌려지는 알갱이 수·퍼짐 | `bapkkuData.js` → `createPowderBurst` |
| 게임 카드 이름·설명·오픈 여부 | `src/games/gameList.js` |
| 전체 색감(버터/크림/피치·나무색) | `src/styles/global.css` 맨 위 `:root` |

### 게임 화면 만들기 (GameShell 사용법)

각 게임은 `GameShell`에 내용물만 넘기면 화면 크기에 맞게 자동 배치됩니다.

```jsx
<GameShell
  title="쿠키 베이커리"
  characterId="cookie"
  onHome={onHome}          // 홈 버튼
  onRestart={onRestart}    // 처음부터 다시하기 버튼
  status={<점수나 게이지 />}
  left={<재료 선택 />}  leftTitle="재료"
  right={<도구 선택 />} rightTitle="도구"
  actions={<완성 버튼 />}
>
  {/* 무대: 실제 요리 장면 */}
</GameShell>
```

새 게임을 추가할 때는 `games/gameList.js`에 카드 정보를, `games/index.js`에 화면 연결을 한 줄씩 추가합니다.

---

## 7. Git 백업

이 프로젝트는 Git으로 관리됩니다. 변경 이력은 VS Code 왼쪽의 **소스 제어** 아이콘에서 볼 수 있어요.

```bash
git log --oneline          # 저장 기록 보기
git add -A && git commit -m "설명"   # 현재 상태 저장
```

※ 글꼴은 Google Fonts(무료)의 Jua, Gowun Dodum, Fredoka를 씁니다. 인터넷이 끊겨 있으면 기본 글꼴로 표시돼도 게임은 그대로 동작합니다.
