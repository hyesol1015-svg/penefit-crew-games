/**
 * Meta Pixel 도우미 — 광고 성과를 재기 위한 이벤트 전송 (PENEFIT Game Pixel)
 *
 * 기본 코드(PageView)는 index.html 에 들어 있어요.
 * 여기서는 게임 안에서 일어나는 일을 맞춤 이벤트로 보내요.
 *   GameStart    : 메인 화면에서 게임을 시작했을 때 (처음부터 다시하기 포함)
 *   GameComplete : 완성 화면(바우처 카드)이 나타났을 때
 *   CopyCode     : 바우처 코드 'Copy Code' 버튼을 눌렀을 때
 *   ShopNowClick : Shopee 링크를 눌렀을 때
 *
 * 광고 차단기 등으로 fbq 가 없어도 게임은 그대로 동작해요. (아무 일도 안 해요)
 */

// 지금 플레이 중인 게임 id ('bapkku' | 'cookie' | 'cafe' | 'jelly')
let currentGame = ''

export function setCurrentGame(id) {
  currentGame = id || ''
}

export function getCurrentGame() {
  return currentGame
}

/** 표준 이벤트 (예: 'ViewContent') */
export function track(event, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', event, params)
    }
  } catch {
    // 측정이 실패해도 게임에는 영향이 없어요
  }
}

/** 맞춤 이벤트 (예: 'GameStart') */
export function trackCustom(event, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('trackCustom', event, params)
    }
  } catch {
    // 측정이 실패해도 게임에는 영향이 없어요
  }
}

let shopeeTrackingInstalled = false

/**
 * Shopee 링크 클릭 측정 — 문서 전체에 클릭 리스너 하나만 달아요. (한 번만 설치돼요)
 * 어느 화면의 링크든 주소에 'shopee' 가 들어 있으면 ShopNowClick 을 보내요.
 */
export function installShopeeClickTracking() {
  if (shopeeTrackingInstalled || typeof document === 'undefined') return
  shopeeTrackingInstalled = true
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!link) return
      const href = link.getAttribute('href') || ''
      if (!href.toLowerCase().includes('shopee')) return
      trackCustom('ShopNowClick', { game: getCurrentGame(), href })
    },
    true, // capture 단계: 링크가 새 탭으로 열리기 전에 먼저 기록해요
  )
}
