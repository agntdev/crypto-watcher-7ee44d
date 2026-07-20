export interface WatchlistEntry {
  ticker: string;
  coinGeckoId?: string;
  priceThreshold?: number;
  pctThreshold?: number;
  lastAlertTime?: number;
}

export interface UserSettings {
  quietHoursStart?: string;
  quietHoursEnd?: string;
  summaryTime?: string;
  cooldownDuration: number;
}

export interface CooldownRecord {
  lastAlertTime: number;
}

export interface UserInfo {
  userId: number;
  username?: string;
  firstSeen: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  cooldownDuration: 3600,
};

export const TICKER_MAP: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  ton: "the-open-network",
  sol: "solana",
  doge: "dogecoin",
  xrp: "ripple",
  ada: "cardano",
  dot: "polkadot",
  avax: "avalanche-2",
  matic: "polygon",
  bnb: "binancecoin",
  usdt: "tether",
  usdc: "usd-coin",
  link: "chainlink",
  uni: "uniswap",
  shib: "shiba-inu",
  ltc: "litecoin",
  xlm: "stellar",
  algo: "algorand",
  near: "near",
  apt: "aptos",
  arb: "arbitrum",
  op: "optimism",
  sui: "sui",
  pepe: "pepe",
  wif: "dogwifcoin",
  fet: "fetch-ai",
  render: "render-token",
  fil: "filecoin",
  atom: "cosmos",
  hbar: "hedera-hashgraph",
  inj: "injective-protocol",
  sei: "sei-network",
  tia: "celestia",
  meme: "memecoin",
  bonk: "bonk",
  floki: "floki",
  bome: "book-of-meme",
  ordi: "ordinals",
  stx: "blockstack",
  imx: "immutable-x",
  cro: "crypto-com-chain",
  ftm: "fantom",
  sand: "the-sandbox",
  mana: "decentraland",
  axs: "axie-infinity",
  gala: "gala",
  enj: "enjincoin",
  chz: "chiliz",
  comp: "compound-governance-token",
  aave: "aave",
  mkr: "maker",
  snx: "havven",
  crv: "curve-dao-token",
  sushi: "sushi",
  yfi: "yearn-finance",
  one: "harmony",
  egld: "elrond-erd-2",
  mina: "mina-protocol",
  iotx: "iotex",
  celo: "celo",
  flow: "flow",
  icp: "internet-computer",
  vet: "vechain",
  theta: "theta-token",
  axl: "axelar",
};

export function resolveCoinGeckoId(ticker: string): string | null {
  const lower = ticker.toLowerCase();
  return TICKER_MAP[lower] ?? null;
}
