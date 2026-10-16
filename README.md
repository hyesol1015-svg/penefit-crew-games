# PENEFIT CREW · Little Kitchen

페네핏 크루의 귀여운 2D 모바일 요리게임 모음입니다.
React + Vite + 순수 CSS/SVG로 만들었고, 유료 API·AI API·외부 데이터베이스를 쓰지 않습니다.
추가로 설치한 패키지도 없습니다.

현재 플레이 가능한 게임: **밥꾸 스튜디오** (사료 그릇에 토퍼 파우더를 뿌리고 고기 토핑 올리기), **쿠키 베이커리** (맛 → 섞기 → 밀기 → 찍기 → 굽기 → 꾸미기 → 완성 + 바우처), **멍푸치노 카페** (컵 → 맛 → 섞고 붓기 → 거품 → 꾸미기 → 완성 + 바우처), **말랑젤리 연구소** (맛 → 두 맛 섞기 → 몰드 → 붓기 → 굳히기 → 꺼내기 → 완성 + 바우처)

---

## 0. 화면 언어와 이름

게임 화면은 **모두 영어**예요. (주석과 README 같은 개발 문서만 한국어)
- 화면 문구는 각 화면 파일에 직접 들어 있어요. 문구를 바꾸려면 아래 파일에서 영어 문장을 찾아 고치면 돼요.
  - 메인: `components/MainScreen.jsx`, 게임 카드: `games/gameList.js`
  - 밥꾸(Bowl Decorating Studio): `games/bapkku/BapkkuStudio.jsx`, 단계·그릇·파우더 이름: `games/bapkku/bapkkuData.js`
  - 쿠키·멍푸치노·젤리: `games/cookie|cafe|jelly/*.jsx`, 캐릭터 이름: `characters.js`

| 코드 폴더/파일 | 화면에 보이는 이름 |
| --- | --- |
| 전체 | PENEFIT CREW's Little Kitchen |
| `bapkku` (밥꾸 스튜디오) | Bowl Decorating Studio |
| `cookie` | Cookie Bakery |
| `cafe` (멍푸치노 카페) | Puppuccino Café |
| `jelly` (말랑젤리 연구소, 펫 젤리 간식) | Gummy Lab |
| 크루: 페네 / 셉셉이 / 피티 / 돌돌이 | Pene / Sepsep / Piti / Doldol |

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
├─ characters.js              # ★ 페네핏 크루 4마리 + 앞모습 자르기 위치
├─ gameAssets.js              # ★ 배경·로고·썸네일·제품 이미지 설정
├─ components/
│  ├─ MainScreen.jsx          # 메인 화면(로비): 캐릭터 + 타이틀 + 게임 카드 4개
│  ├─ GameShell.jsx           # ★ 모든 게임이 함께 쓰는 반응형 게임 화면 틀
│  ├─ CrewSprite.jsx          # 크루 캐릭터 시트에서 앞모습만 잘라 보여 주기
│  ├─ CharacterSlot.jsx       # 임시 캐릭터 자리 (이미지 없으면 이모지 표시)
│  └─ BuildingStage.jsx       # 아직 구현 전인 게임의 임시 무대
├─ games/
│  ├─ gameList.js             # 게임 카드 목록 (이름, 설명, 펫 메뉴 표시)
│  ├─ index.js                # 게임 id ↔ 게임 화면 연결 (등록부)
│  ├─ bapkku/                 # 밥꾸 스튜디오 (플레이 가능)
│  │  ├─ BapkkuStudio.jsx
│  │  ├─ Bowl.jsx
│  │  └─ bapkkuData.js
│  ├─ cookie/                    # 쿠키 베이커리 (① 맛 ~ ⑦ 완성까지 플레이 가능)
│  │  ├─ CookieBakery.jsx        #   단계 진행·패널·버튼
│  │  ├─ cookieData.js           #   단계, 맛(밥꾸 파우더 6종 재사용), 쿠키틀 5종, 섞기·밀기 기준
│  │  ├─ MixStage.jsx            #   믹싱볼 (맛 고르기·섞기)
│  │  ├─ RollStage.jsx           #   베이킹 매트 + 밀대
│  │  ├─ CutStage.jsx            #   쿠키틀 찍기
│  │  ├─ BakeStage.jsx           #   오븐 (굽기 타이밍 게임)
│  │  ├─ DecorateStage.jsx       #   구운 쿠키 꾸미기
│  │  ├─ DecorArt.jsx            #   장식 4종 그림 + 장식된 쿠키
│  │  ├─ CookieFinish.jsx        #   완성 화면 (접시 + 크루 + 바우처)
│  │  ├─ CookieArt.jsx           #   매트·반죽·쿠키·쿠키틀·트레이 그림 (임시 SVG)
│  │  └─ doughShape.js           #   반죽 모양 계산
│  ├─ cafe/                      # 멍푸치노 카페 (① 컵 ~ ⑥ 완성까지 플레이 가능)
│  │  ├─ MungpuccinoCafe.jsx     #   단계 진행·패널·버튼
│  │  ├─ cafeData.js             #   단계, 컵 5색(밥꾸 그릇 색 재사용), 맛 6종(페네핏 파우더 재사용), 섞기·붓기·거품 기준
│  │  ├─ MixPourStage.jsx        #   믹싱볼 섞기 + 피처로 붓기
│  │  ├─ CafeStage.jsx           #   카페 테이블 위 컵 (거품기·꾸미기)
│  │  ├─ CupArt.jsx              #   컵·음료·거품·장식·테이블 그림 (임시 SVG)
│  │  └─ CafeFinish.jsx          #   완성 화면 (멍푸치노 + 크루 + 바우처)
│  ├─ jelly/                     # 말랑젤리 연구소 (① 맛 ~ ⑦ 완성까지 플레이 가능)
│  │  ├─ JellyLab.jsx            #   단계 진행·패널·버튼
│  │  ├─ jellyData.js            #   단계, 맛(페네핏 파우더 재사용), 몰드 5종, 트레이 6칸, 붓기·굳히기 기준
│  │  ├─ JellyMixBowl.jsx        #   유리 믹싱볼 (두 맛 섞기)
│  │  ├─ JellyStage.jsx          #   몰드 트레이 (붓기·굳히기·꺼내기)
│  │  ├─ JellyArt.jsx            #   젤리·몰드·접시 그림 (임시 SVG)
│  │  └─ JellyFinish.jsx         #   완성 화면 (젤리 접시 + 크루 + 바우처)
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

## 3. 페네핏 크루 캐릭터

### 지금 들어 있는 캐릭터
`public/assets/characters/` 폴더의 원본 PNG 4개를 사용해요.

| 파일 | 캐릭터 | 쓰이는 곳 |
| --- | --- | --- |
| `dog_brown.png` | 페네 (Pene) | 메인 화면 크루 고르기, 밥꾸 안내 말풍선, 밥꾸 완성 화면 |
| `dog_cream.png` | 셉셉이 (Sepsep) | 〃 |
| `cat_orange.png` | 피티 (Piti) | 〃 |
| `cat_black.png` | 돌돌이 (Doldol) | 〃 |

- 각 PNG에는 **앞모습 · 옆모습 · 뒷모습 · 반대쪽 옆모습**이 가로로 나란히 있어요.
- 원본 파일은 그대로 두고, 화면에서는 **앞모습 영역만 잘라서** 보여 줘요. (`components/CrewSprite.jsx`)
- 잘라 낼 위치는 `src/characters.js`의 `CREW` 목록에 `front: [x, y, 가로, 세로]`로 적혀 있어요.
  (이미지 픽셀을 분석해서 캐릭터 둘레에 10px 여유를 두고 정했어요)
- 메인 화면에서 캐릭터를 누르면 선택되고, 새로고침해도 기억돼요.
- `cat_black.png`는 배경이 투명하지 않고 흰색이에요. 그래서 모든 캐릭터를 흰 카드 위에 올려 자연스럽게 보이게 했어요.
  투명 배경 PNG로 바꾸면 `characters.js`에서 `whiteBackground: true` 줄을 지워도 돼요.

### 캐릭터 이미지를 바꾸거나 새로 추가할 때
1. PNG를 `public/assets/characters/`에 넣어요.
2. `src/characters.js`의 `CREW`에 항목을 고치거나 추가해요.
   ```js
   {
     id: 'pene',                                  // 영어 이름 (겹치면 안 돼요)
     name: 'Pene',                                // 화면에 보이는 이름 (영어)
     species: 'puppy',
     image: '/assets/characters/dog_brown.png',   // 파일 경로
     sheet: [1920, 644],                          // 원본 이미지 전체 크기
     front: [7, 33, 509, 605],                    // 앞모습 영역 [x, y, 가로, 세로]
   },
   ```
3. 이미지 크기나 그림 위치가 바뀌면 `sheet`와 `front` 값도 함께 고쳐 주세요.
   값이 틀리면 옆모습이 같이 보이거나 몸이 잘려 보여요.

### 아직 이모지로 표시되는 자리
쿠키·멍푸치노·젤리 게임 화면의 상단 캐릭터 자리는 아직 임시 이모지예요. (`characters.js`의 `CHARACTERS`)

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
| `tools.scoop` | 사료 담기 단계의 스쿱 (지금은 SVG로 그린 임시 스쿱) | 가로형 투명 PNG, 왼쪽 컵·오른쪽 손잡이 |

제품 사진은 코드에서 모양을 바꾸지 않고 원본 그대로(비율 유지) 보여 줍니다.

### 파우더 제품 이미지 (PENEFIT Palette Powder)
파우더 6종의 제품 PNG는 `src/games/bapkku/bapkkuData.js`의 `TOPPER_DATA` 각 항목 `image`에 경로를 넣어요.
(예: `image: '/assets/toppers/beetroot.png'` → 파일은 `public/assets/toppers/beetroot.png`)
넣으면 선택 카드와 끌어서 쓰는 파우더 통이 모두 실제 제품 이미지로 바뀌어요. 권장: 세로형 누끼 PNG(약 8:11), 뚜껑이 위쪽.
지금은 임시 파우더 통 그림(로고 없음, 제품명·영문 컬러명 라벨)이 표시돼요.

사료 그릇은 터치 위치에 파우더를 뿌려야 해서 SVG로 그렸습니다. 그릇 색은 `bapkkuData.js`의 `BOWLS`에서 바꿀 수 있습니다.

---

## 5. 밥꾸 스튜디오 플레이 방법

위쪽의 **단계 표시(① 그릇 → ② 사료 → ③ 파우더 → ④ 토핑 → ⑤ 완성)**를 따라 진행해요.
각 단계의 조건을 채워야 **다음** 버튼이 켜지고, **이전** 버튼이나 단계 표시를 눌러 뒤로 갈 수 있어요.
단계를 오가도 고른 그릇·담은 사료·뿌린 가루는 그대로 남아요.

1. **그릇 고르기** — 크림 / 핑크 / 민트 / 라벤더 / 버터 옐로우 중 하나를 고르면 조리대에 '퐁' 하고 놓여요.
2. **사료 담기** — 빈 그릇에서 시작해요. 아래 방법 중 아무거나 4번 하면 그릇이 가득 차요.
   - 스쿱을 끌어서 그릇 위에 놓기
   - 스쿱을 톡 누르기
   - 그릇을 톡 누르기
   - 패널의 **한 스쿱 담기** 버튼 (키보드: 스쿱에 초점을 두고 Enter)
3. **파우더 뿌리기** — 실제 PENEFIT Palette Powder 6종 (`bapkkuData.js`의 `TOPPER_DATA`에서 관리)

   | 제품명 (화면 표시) | 컬러 | 게임용 참고 색상 |
   | --- | --- | --- |
   | Beetroot | RED | `#CE829A` |
   | Broccoli | GREEN | `#A8C97D` |
   | Sweet Pumpkin | YELLOW | `#F0D16E` |
   | Psyllium Husk | BEIGE | `#DCC693` |
   | Chlorella | DEEP GREEN | `#689F63` |
   | Purple Sweet Potato | PURPLE | `#B997BD` |

   - 색은 `color` 한 곳만 고치면 떨어지는 가루 색(밝은색·어두운색)과 통 라벨 색이 자동으로 따라 바뀌어요.
   - 오른쪽 위의 **파우더 통을 끌어서** 그릇 위로 가져오면 통이 기울며 가루가 떨어져요.
   - 그릇 위에서 **좌우로 흔들수록** 많이 나오고, 가만히 누르고 있으면 솔솔 조금씩 나와요.
   - 통의 **위아래 위치**로 사료의 뒤쪽/앞쪽 중 어디에 떨어질지 정해져요.
   - 그릇 밖에서는 가루가 나오지 않아요. 가루는 사료 위에만 쌓여요.
   - 보조 조작: 그릇을 **톡 누르거나 문질러도** 그 자리에 뿌려져요.
   - 키보드: 통에 초점을 두고 방향키로 옮기고 Enter로 뿌리기
   - **↶ Undo**(되돌리기)는 마지막 한 번의 동작(한 번 끌기 또는 연속 톡톡, 파우더를 바꾸면 새 동작)을 취소, **↺ Clear All**(전체 지우기)은 모두 지워요.
   - **15알**이면 Next 버튼이 켜지고 별 1개, **35알** 별 2개, **60알** 별 3개(게이지 가득). 별 3개는 선택이에요.
     자연스럽게 1~2초 흔들면 15알이 돼요. (`POWDER_MIN`, `STAR_STEPS`, `GOAL`)
   - 1알 = 고운 입자 여러 개가 모인 한 꼬집이라 적은 숫자로도 그릇이 소복해 보여요. (`GRAIN_DOTS`)
4. **고기 토핑 (Meat Toppings)** — Salmon · Pork · Chicken · Beef (익힌 고기, 게임 속 장식이에요. 급여량·영양 정보 아님)
   - 카드를 고르고 **그릇을 누르거나**, **카드를 그릇 위로 끌어다 놓으면** 한 조각이 올라가요. 여러 종류를 섞어도 돼요.
   - 올린 조각을 **누르면 선택**(점선 테두리), **끌면 이동**. 사료 밖으로는 나가지 않아요.
   - **↶ Undo**는 마지막 조각 취소, **✕ Remove**는 선택한 조각 삭제. 최대 12개(`MAX_MEATS`).
   - 1개 이상 올리면 **Finish!** 버튼이 켜져요.
   - 그림은 `MeatArt.jsx`의 임시 SVG예요. `bapkkuData.js`의 `MEATS` 각 항목 `image`에
     `'/assets/meats/salmon.png'`처럼 경로를 넣으면 카드와 그릇 위가 모두 PNG로 바뀌어요. (배경 투명 PNG 권장)
5. **완성** — "Bowl Complete!" 화면에 그릇·사료·파우더·고기 토핑과 고른 크루가 함께 나와요.
   **Start Over**는 ① 그릇 단계부터 새로 시작, **Home**은 메인 화면으로 가요.
   - 완성 화면에는 선물 상자와 함께 **바우처 카드**(코드 `PENEFITGAME`)가 나타나요.
     **Copy Voucher Code**를 누르면 코드가 복사되고 버튼이 **Copied!**(체크 표시)로 바뀌어요.
     복사가 안 되는 환경이면 코드가 자동으로 선택되어 직접 복사(Ctrl+C / 길게 누르기)할 수 있어요.
   - 바우처 코드·문구는 `src/games/bapkku/voucher.js` 한 곳에서 바꿔요. `enabled: false`면 카드가 사라져요.
     (할인율·유효기간·최소 금액·구매 링크는 아직 넣지 않았어요)

노트북 화면에서는 왼쪽에 '오늘의 레시피' 카드가 나와 지금 할 일을 알려 줘요.

---

## 5-2. 쿠키 베이커리 플레이 방법

※ 게임용 가상 레시피예요. 실제 반려동물 쿠키 레시피가 아니에요.

1. **Choose Flavor** — 밥꾸 스튜디오와 같은 페네핏 파우더 6종(아이콘·영어 이름·컬러명)에서 반죽 맛을 골라요. 반죽 색이 그 맛 색으로 바뀌고, 모든 단계에서 유지돼요.
2. **Mix Dough** — 믹싱볼 안에서 손가락/마우스로 **원을 그리며** 저어요. 같은 방향으로 약 3바퀴(`MIX_TURNS`)면 완성 — 1바퀴 1초 기준 약 3초. 톡톡 누르기만 해서는 섞이지 않아요.
3. **Roll Dough** — 밀대를 **위아래로** 끌어 반죽 위를 지나가게 해요. 한 방향으로 한 번 지나가면 1번, **4번**(`ROLL_PASSES`)이면 납작해져요. 매트 아무 곳을 끌어도 밀대가 따라와요.
4. **Cut Shapes** — 쿠키틀(Dog·Cat·Paw·Heart·Star)을 고르고 반죽을 누르면 꾹 찍혀요. 너무 겹치면 가까운 빈자리로 옮기거나 "No room there!"라고 알려 줘요. 찍은 쿠키는 아래 **베이킹 트레이**에 모여요. 1개만 찍어도 다음으로 갈 수 있고 최대 10개. **Undo / Clear All** 가능.
5. **Bake Cookies** — **Bake!**를 누르면 트레이가 오븐 안으로 들어가고 타이머·게이지가 올라가요. 게이지 표시가 초록 **Perfect** 구간(약 3.5~5.5초)에 있을 때 **Stop!**(또는 오븐 누르기). 너무 빨리/늦게 멈추면 **Try Again**. (`BAKE` — 전체 7초, Perfect 0.5~0.78) 구워도 원래 맛 색은 남아요(노릇한 색 최대 38%).
6. **Decorate** — 장식(Paw Print · Heart · Star · Dots)과 아이싱 색(맛 파스텔 · Cream · Pink · Butter)을 고르고 쿠키를 누르면 그 자리에 올라가요. 장식은 쿠키 모양 안쪽에만 놓이고, 쿠키마다 다르게 꾸밀 수 있어요(쿠키당 최대 8개). **Undo / Clear Decorations**. 1개 이상이면 **Finish!**
7. **Finish** — "Cookies Complete!" + "You baked something pawsome!" 접시에 직접 만든 쿠키(모양·색·장식)가 그대로 담기고, 고른 크루가 축하해요. 아래에 밥꾸와 **같은 바우처 카드**(`bapkku/VoucherCard.jsx`, 설정 `bapkku/voucher.js`)가 나와요. **Start Over / Home**.

그림은 모두 임시 SVG예요. 쿠키 PNG가 생기면 `cookieData.js`의 `CUTTERS` 각 항목 `image`에 경로를 넣으면 돼요.

## 5-3. 멍푸치노 카페 플레이 방법

※ 게임 속 가상 펫 음료예요. 실제 반려동물 음료 레시피나 급여 안내가 아니에요.

1. **Choose Cup** — Cream · Pink · Mint · Lavender · Butter Yellow 컵(밥꾸 그릇과 같은 색 팔레트). 고른 컵은 끝까지 유지돼요.
2. **Choose Flavor** — 페네핏 파우더 6종(실제 아이콘). 음료 색이 그 맛 색으로 바뀌어요.
3. **Mix & Pour** — 믹싱볼 안에서 원을 그리며 약 3바퀴(`MIX_TURNS`) 저으면 파우더가 녹아 색이 고르게 섞여요. 그다음 **피처를 끌어 컵 위**에 두면 기울어지며 음료가 흘러 들어가요(약 2.4초, `POUR_SECONDS`). 다른 곳에 놓으면 제자리로 돌아가요.
4. **Add Foam** — 펫 전용 거품기(발바닥 손잡이)를 컵 위에서 누르고 움직이면 크림색 거품이 쌓이고 출렁여요. 빙글빙글 돌리면 위에 소용돌이 무늬가 생겨요(약 2~4초, `FOAM`).
5. **Decorate** — 장식 4종(Paw Print · Heart · Star · Dots, 쿠키 게임 장식 그림 재사용) + 맛과 어울리는 파스텔 4색. 거품 윗면을 누르면 올라가요. **Undo / Clear Decorations**. 1개 이상이면 **Finish!**
6. **Finish** — "Puppuccino Complete!" + "You made something pawsome!" 직접 만든 멍푸치노(컵·음료·거품·장식) + 크루 축하 + 같은 바우처 카드(`bapkku/voucher.js`). **Start Over / Home**.

컵 PNG가 생기면 `cafeData.js`의 `CUPS` 각 항목 `image`에 경로를 넣으면 돼요. 이미지가 없거나 경로가 틀려도 임시 그림으로 계속 플레이돼요.

## 5-4. 말랑젤리 연구소(Gummy Lab) 플레이 방법

※ 반려동물용 젤리 간식을 만드는 게임 속 가상 레시피예요. 실제 급여 안전성이나 영양 효과를 보증하지 않아요.
   유해한 재료(자일리톨·초콜릿·포도·건포도·양파·마늘 등)는 게임에 넣지 않아요.

1. **Choose Flavor** — 페네핏 파우더 6종 중 첫 번째 맛(기본 색).
2. **Mix Jelly** — 두 번째 맛을 고르고(같은 맛도 OK) 유리 볼 안에서 원을 그리며 약 3바퀴 저으면 두 색이 섞여요.
3. **Choose Mold** — Bear · Heart · Star · Dog · Cat 실리콘 몰드 (트레이 6칸). 위에 젤리 미리보기가 떠요.
4. **Pour Jelly** — 비커를 끌어 몰드 칸 위에 두면 기울어지며 부어져요. 위 칸이 차면 같은 줄 아래 칸으로 이어서 부어요. 몰드 밖에서는 붓지 않아요. (한 칸 0.45초, 약 3초)
5. **Set Jelly** — 칠 지팡이(눈꽃)를 젤리 위에 대고 있거나 톡톡 누르면 굳어요. 굳을수록 반투명하고 탱글해지고 반짝여요. (약 4~5초)
6. **Pop It Out** — 젤리를 톡 누르거나 위로 끌면 말랑하게 눌렸다가 통 튀어나와 접시에 차곡차곡. 1개 이상이면 **Finish!**
7. **Finish** — "Gummy Lab Complete!" + "You made something pawsome!" 꺼낸 젤리(색·모양·개수 그대로)가 접시에서 말랑말랑 흔들리고, 크루 축하 + 같은 바우처 카드(`bapkku/voucher.js`).

키보드로도 Enter/스페이스로 각 단계를 진행할 수 있어요. 젤리 PNG가 생기면 `jellyData.js`의 `MOLDS` 각 항목 `image`에 경로를 넣으면 돼요.

## 6. 쉽게 고칠 수 있는 부분

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 그릇 색 추가/변경 | `src/games/bapkku/bapkkuData.js` → `BOWLS` |
| 토퍼 종류·색 추가 | `bapkkuData.js` → `TOPPERS` |
| 별점 기준 | `bapkkuData.js` → `POWDER_MIN`, `STAR_STEPS`, `GOAL` |
| 완성 화면 바우처 코드·문구 | `src/games/bapkku/voucher.js` → `VOUCHER` |
| 고기 토핑 이름·이미지 | `bapkkuData.js` → `MEATS` (그림: `MeatArt.jsx`) |
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
