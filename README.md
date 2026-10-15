# PENEFIT CREW · Little Kitchen

페네핏 크루의 귀여운 2D 요리 미니게임 모음입니다.
React + Vite + 순수 CSS로 만들었고, 유료 API·AI API·외부 데이터베이스를 쓰지 않습니다.
추가로 설치한 패키지도 없습니다.

현재 플레이 가능한 게임: **밥꾸 스튜디오** (사료 그릇에 토퍼 파우더 뿌려 꾸미기)

---

## 1. 실행 방법

> Node.js 18 이상이 필요합니다. (`node -v`로 확인)

```bash
# 처음 한 번만: 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

터미널에 나온 주소(보통 `http://localhost:5173`)를 브라우저에서 엽니다.

### 휴대폰에서 테스트하기

PC와 휴대폰이 **같은 와이파이**에 연결되어 있어야 합니다.

```bash
npm run dev -- --host
```

터미널의 `Network:` 주소(예: `http://192.168.0.12:5173`)를 휴대폰 브라우저에 입력하세요.

### 배포용 빌드

```bash
npm run build     # dist/ 폴더에 결과물 생성
npm run preview   # 빌드 결과 미리보기
npm run lint      # 코드 검사
```

---

## 2. 폴더 구조

```
src/
├─ main.jsx                 # 앱 시작점 (global.css 불러오기)
├─ App.jsx                  # 화면 전환 (메인 ↔ 게임)
├─ characters.js            # ★ 캐릭터 이미지 설정 (PNG 교체는 여기서)
├─ components/
│  ├─ MainScreen.jsx        # 메인 화면: 타이틀 + 게임 카드 4개
│  └─ CharacterSlot.jsx     # 캐릭터 이미지 자리 (이미지 없으면 이모지 표시)
├─ games/
│  ├─ gameList.js           # 게임 카드 목록 (이름, 설명, PLAY/Coming Soon)
│  └─ bapkku/
│     ├─ BapkkuStudio.jsx   # 밥꾸 스튜디오 게임 화면 + 완성 축하 화면
│     ├─ Bowl.jsx           # SVG 사료 그릇 + 터치/마우스 처리
│     └─ bapkkuData.js      # 그릇 색, 토퍼 색, 파우더 계산 함수
└─ styles/
   ├─ global.css            # 색상 변수, 버튼, 화면 틀
   ├─ main.css              # 메인 화면 스타일
   └─ bapkku.css            # 밥꾸 스튜디오 스타일
```

`src/App.css`, `src/index.css`, `src/assets/`는 Vite 기본 템플릿 파일로, 지금은 쓰지 않습니다. 지워도 됩니다.

---

## 3. 캐릭터 이미지(PNG) 교체 방법

지금은 캐릭터 자리에 임시 이모지(🐶)가 보입니다. 실제 페네핏 크루 캐릭터로 바꾸려면:

1. `public/characters/` 폴더를 만들고 PNG 파일을 넣습니다.
   ```
   public/characters/crew-main.png
   public/characters/crew-chef.png
   public/characters/crew-cheer.png
   ```
2. `src/characters.js`를 열어 `image` 값을 바꿉니다.
   ```js
   main: {
     name: '페네핏 크루',
     image: '/characters/crew-main.png',   // ← null 대신 경로 입력
     emoji: '🐶',
   },
   ```
3. 저장하면 화면에 바로 반영됩니다. 다른 코드는 고칠 필요가 없습니다.

| 키 | 표시 위치 | 권장 크기 |
| --- | --- | --- |
| `main` | 메인 화면 상단 (큰 원) | 512×512 이상 |
| `bapkku` | 밥꾸 스튜디오 오른쪽 위 (작은 원) | 256×256 이상 |
| `cheer` | 밥꾸 완성 축하 화면 | 512×512 이상 |

- **배경이 투명한 정사각형 PNG**를 쓰면 가장 자연스럽습니다.
- 이미지를 넣으면 점선 테두리와 "캐릭터 자리" 문구가 자동으로 사라집니다.
- 경로가 틀리거나 파일이 없으면 자동으로 이모지가 다시 나타납니다.

---

## 4. 쉽게 고칠 수 있는 부분

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 그릇 색 추가/변경 | `src/games/bapkku/bapkkuData.js` → `BOWLS` |
| 토퍼 종류·색 추가 | `src/games/bapkku/bapkkuData.js` → `TOPPERS` |
| 한 번에 뿌려지는 알갱이 수·퍼짐 | `bapkkuData.js` → `createPowderBurst` |
| 게임 카드 이름·설명·오픈 여부 | `src/games/gameList.js` |
| 전체 색감(버터/크림/피치) | `src/styles/global.css` 맨 위 `:root` |

### 새 게임 열기 (예: 쿠키 베이커리)

1. `src/games/cookie/CookieBakery.jsx` 컴포넌트를 만듭니다. (`BapkkuStudio.jsx` 구조 참고)
2. `src/games/gameList.js`에서 해당 카드의 `status`를 `'play'`로 바꿉니다.
3. `src/App.jsx`에 한 줄 추가합니다.
   ```jsx
   {screen === 'cookie' && <CookieBakery onHome={goHome} />}
   ```

---

## 5. 밥꾸 스튜디오 플레이 방법

1. **그릇 고르기**: 크림 / 핑크 / 민트
2. **토퍼 파우더 고르기**: 단호박 / 비트 / 브로콜리
3. 그릇 위를 **톡톡 누르거나, 누른 채로 문지르면** 파우더가 뿌려집니다.
   그릇 테두리를 눌러도 사료 위에만 떨어집니다.
4. **↺ 초기화**로 토핑을 모두 지우고, **완성!**을 누르면 축하 화면이 나옵니다.
5. 축하 화면에서 **다시 만들기** 또는 **메인 화면으로**를 고를 수 있습니다.

※ 글꼴은 Google Fonts(무료)의 Jua, Gowun Dodum, Fredoka를 씁니다. 인터넷이 끊겨 있으면 기본 글꼴로 표시돼도 게임은 그대로 동작합니다.
