import type { WatchlistEntry, UserSettings, UserInfo } from "./types.js";
import { DEFAULT_SETTINGS } from "./types.js";

const watchlistStore = new Map<string, WatchlistEntry[]>();
const settingsStore = new Map<string, UserSettings>();
const cooldownStore = new Map<string, number>();
const userIndexStore = new Map<string, number[]>();
const alertCountStore = new Map<string, number>();

function watchKey(userId: number): string {
  return `watchlist:${userId}`;
}

function settingsKey(userId: number): string {
  return `settings:${userId}`;
}

function cooldownKey(userId: number, ticker: string): string {
  return `cooldown:${userId}:${ticker.toUpperCase()}`;
}

export async function getWatchlist(userId: number): Promise<WatchlistEntry[]> {
  return watchlistStore.get(watchKey(userId)) ?? [];
}

export async function setWatchlist(userId: number, entries: WatchlistEntry[]): Promise<void> {
  watchlistStore.set(watchKey(userId), entries);
}

export async function addWatchlistEntry(userId: number, entry: WatchlistEntry): Promise<void> {
  const list = await getWatchlist(userId);
  const idx = list.findIndex((e) => e.ticker.toUpperCase() === entry.ticker.toUpperCase());
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...entry };
  } else {
    list.push(entry);
  }
  await setWatchlist(userId, list);
}

export async function removeWatchlistEntry(userId: number, ticker: string): Promise<boolean> {
  const list = await getWatchlist(userId);
  const filtered = list.filter((e) => e.ticker.toUpperCase() !== ticker.toUpperCase());
  if (filtered.length === list.length) return false;
  await setWatchlist(userId, filtered);
  return true;
}

export async function getWatchlistEntry(userId: number, ticker: string): Promise<WatchlistEntry | null> {
  const list = await getWatchlist(userId);
  return list.find((e) => e.ticker.toUpperCase() === ticker.toUpperCase()) ?? null;
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  return settingsStore.get(settingsKey(userId)) ?? { ...DEFAULT_SETTINGS };
}

export async function setUserSettings(userId: number, settings: UserSettings): Promise<void> {
  settingsStore.set(settingsKey(userId), settings);
}

export async function getCooldown(userId: number, ticker: string): Promise<number | null> {
  return cooldownStore.get(cooldownKey(userId, ticker)) ?? null;
}

export async function setCooldown(userId: number, ticker: string, timestamp: number): Promise<void> {
  cooldownStore.set(cooldownKey(userId, ticker), timestamp);
}

export async function addUserInfo(info: UserInfo): Promise<void> {
  const key = "user_index";
  const users = userIndexStore.get(key) ?? [];
  if (!users.includes(info.userId)) {
    users.push(info.userId);
    userIndexStore.set(key, users);
  }
}

export async function getUserCount(): Promise<number> {
  const users = userIndexStore.get("user_index") ?? [];
  return users.length;
}

export async function incrementAlertCount(ticker: string): Promise<void> {
  const current = alertCountStore.get(ticker) ?? 0;
  alertCountStore.set(ticker, current + 1);
}

export async function getAlertCounts(): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const [k, v] of alertCountStore) {
    result[k] = v;
  }
  return result;
}

export function resetStorage(): void {
  watchlistStore.clear();
  settingsStore.clear();
  cooldownStore.clear();
  userIndexStore.clear();
  alertCountStore.clear();
}
