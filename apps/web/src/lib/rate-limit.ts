const store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  interval: number;
  maxRequests: number;
}

const defaults: Record<string, RateLimitConfig> = {
  auth: { interval: 15 * 60 * 1000, maxRequests: 10 },
  checkout: { interval: 60 * 1000, maxRequests: 5 },
  review: { interval: 60 * 1000, maxRequests: 10 },
  track: { interval: 60 * 1000, maxRequests: 20 },
  payment: { interval: 60 * 1000, maxRequests: 10 },
  webhook: { interval: 1000, maxRequests: 5 },
  default: { interval: 60 * 1000, maxRequests: 30 },
};

export function checkRateLimit(
  identifier: string,
  group: keyof typeof defaults | "default" = "default"
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = defaults[group] || defaults.default;
  const now = Date.now();
  const key = `${group}:${identifier}`;

  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + config.interval;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt };
}

export function rateLimitMiddleware(
  identifier: string,
  group: keyof typeof defaults | "default" = "default"
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  return checkRateLimit(identifier, group);
}

export function getRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
}): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
