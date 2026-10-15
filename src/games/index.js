import BapkkuStudio from './bapkku/BapkkuStudio.jsx'
import CookieBakery from './cookie/CookieBakery.jsx'
import MungpuccinoCafe from './cafe/MungpuccinoCafe.jsx'
import JellyLab from './jelly/JellyLab.jsx'

/**
 * 게임 화면 등록부
 * gameList.js 의 id 와 실제 게임 컴포넌트를 연결합니다.
 * 새 게임을 추가할 때는 컴포넌트를 import 하고 여기에 한 줄만 더하면 돼요.
 */
export const GAME_SCREENS = {
  bapkku: BapkkuStudio,
  cookie: CookieBakery,
  cafe: MungpuccinoCafe,
  jelly: JellyLab,
}
