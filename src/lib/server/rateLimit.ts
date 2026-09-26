type Options = {
  now?: () => number;
  perIp?: number;
  total?: number;
};

// A small local guard. Distributed rate limiting must be configured at the hosting edge.
export function createLocalRsvpRateLimit({ now = Date.now, perIp = 5, total = 30 }: Options = {}) {
  let windowStart = now();
  let allRequests = 0;
  const requestsByIp = new Map<string, number>();
  return async (request: Request): Promise<boolean> => {
    const current = now();
    if (current - windowStart >= 60_000) {
      windowStart = current;
      allRequests = 0;
      requestsByIp.clear();
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip") || "unknown";
    const count = requestsByIp.get(ip) ?? 0;
    if (count >= perIp || allRequests >= total) return false;
    requestsByIp.set(ip, count + 1);
    allRequests++;
    return true;
  };
}
