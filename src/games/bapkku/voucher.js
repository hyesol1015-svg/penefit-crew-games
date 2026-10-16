/**
 * 완성 화면 바우처 보상 설정 — 여기 한 곳에서만 고치면 돼요. (네 게임 엔딩이 모두 이 설정을 써요)
 *
 *   enabled     : false 로 바꾸면 완성 화면에서 바우처 카드가 사라져요. (바우처가 없을 때)
 *   code        : 복사되는 바우처 코드 (화면에도 이 글자가 그대로 보여요)
 *   title       : 카드 제목 ('25% OFF' 처럼 할인 문구로 시작하면 크게 강조돼요)
 *   description : 코드 아래 짧은 안내 문구
 *   copyLabel   : 복사 버튼 문구
 *   copiedLabel : 복사에 성공했을 때 버튼 문구
 *   howToLabel  : 사용 방법 안내 창을 여는 버튼 문구
 *   howToTitle  : 사용 방법 안내 창 제목
 *   steps       : 사용 방법 3단계 (VoucherHowTo.jsx 가 보여 줘요)
 *                 title / lines 안의 {code} 는 위 code 로 자동으로 바뀌어요.
 *                 codeBox : true 면 그 단계에 코드 쿠폰 박스 + Copy 버튼이 나와요
 *                 icons : 단계마다 작은 그림 3개 (cart · jar · checkout · voucher · code · apply · check · shipping · order)
 *
 * ※ 문구는 바우처 담당자가 정해 준 내용이에요. 할인율·조건이 바뀌면 여기 문구만 고치면 돼요.
 * ※ code 를 빈 글자('')로 두어도 카드가 숨겨져요.
 */
export const VOUCHER = {
  enabled: true,
  code: 'PENEGAME',
  title: '25% OFF Voucher',
  description: 'Use this code on Shopee SG.',
  copyLabel: 'Copy Code',
  copiedLabel: 'Copied!',
  howToLabel: 'How to Use',
  howToTitle: 'How to use your voucher',
  steps: [
    {
      title: 'Add 1 Palette Powder 45g to Cart',
      lines: [
        'Visit the penefit.sg shop on Shopee SG.',
        'Pick any 1 Palette Powder 45g and add 1 jar to your cart.',
        'Go to checkout.',
      ],
      icons: ['jar', 'cart', 'checkout'],
      tone: 'peach',
    },
    {
      title: 'Enter the Secret Code and Apply',
      lines: ['Tap Shop Voucher at checkout.', 'Enter the secret code: {code}', 'Tap Apply.'],
      icons: ['voucher', 'code', 'apply'],
      tone: 'butter',
      codeBox: true, // 이 단계에 코드 쿠폰 박스 + Copy 버튼을 보여 줘요
    },
    {
      title: 'Select Your Voucher & Check Out',
      lines: [
        'Select the 25% OFF voucher and tap OK.',
        'Under Platform Vouchers, add an eligible Free Shipping Voucher if available.',
        'Check the voucher discount and final payment amount.',
        'Enter your delivery details and tap Place Order.',
      ],
      icons: ['check', 'shipping', 'order'],
      tone: 'mint',
    },
  ],
}

/** 바우처 카드를 보여 줄지 */
export const hasVoucher = (voucher = VOUCHER) => Boolean(voucher?.enabled && voucher.code?.trim())

/** 문구 안의 {code} 를 실제 코드로 바꿔요 */
export const fillCode = (text, voucher = VOUCHER) => String(text).replaceAll('{code}', voucher.code.trim())

/** 클립보드 복사: 최신 방식 → 예전 방식 순서로 시도, 성공하면 true (카드·안내 창 공통) */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 권한이 막혀 있으면 아래의 예전 방식으로 한 번 더 시도해요
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '0'
    area.style.left = '0'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}
