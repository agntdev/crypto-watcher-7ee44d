let clockOffset = 0;

export function now(): number {
  return Date.now() + clockOffset;
}

export function setClockOffset(offsetMs: number): void {
  clockOffset = offsetMs;
}

export function resetClock(): void {
  clockOffset = 0;
}
