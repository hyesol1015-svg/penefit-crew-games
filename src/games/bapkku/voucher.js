/**
 * 완성 화면 바우처 보상 설정 — 여기 한 곳에서만 고치면 돼요.
 *
 *   enabled     : false 로 바꾸면 완성 화면에서 바우처 카드가 사라져요. (바우처가 없을 때)
 *   code        : 복사되는 바우처 코드 (화면에도 이 글자가 그대로 보여요)
 *   title       : 카드 제목
 *   description : 코드 아래 안내 문구
 *   copyLabel   : 복사 버튼 문구
 *   copiedLabel : 복사에 성공했을 때 버튼 문구
 *
 * ※ 할인율·유효기간·최소 구매금액·구매 링크는 정해진 정보가 없어서 넣지 않았어요.
 *   정보가 정해지면 description 문구에 직접 추가하세요.
 * ※ code 를 빈 글자('')로 두어도 카드가 숨겨져요.
 */
export const VOUCHER = {
  enabled: true,
  code: 'PENEFITGAME',
  title: 'A Little Gift for You!',
  description: 'Use your code at checkout on Shopee SG.',
  copyLabel: 'Copy Voucher Code',
  copiedLabel: 'Copied!',
}

/** 바우처 카드를 보여 줄지 */
export const hasVoucher = (voucher = VOUCHER) => Boolean(voucher?.enabled && voucher.code?.trim())
