import type { ParsedQs } from 'qs';

export function getStringQuery(value: string | ParsedQs | (string | ParsedQs)[] | undefined): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
}

export function getNumberQuery(
  value: string | ParsedQs | (string | ParsedQs)[] | undefined,
  fallback: number,
  options: { min?: number; max?: number } = {},
): number {
  const rawValue = getStringQuery(value);
  const parsed = rawValue ? Number(rawValue) : fallback;
  const min = options.min ?? Number.MIN_SAFE_INTEGER;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;

  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}
