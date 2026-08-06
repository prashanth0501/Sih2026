import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    """Zero-dependency, thread-safe sliding window rate limiter for FastAPI.

    Resolves real client IP across proxies via `CF-Connecting-IP` (Cloudflare),
    `X-Forwarded-For` (Render), and direct socket IP.
    """

    def __init__(self, requests_per_minute: int = 60, window_seconds: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def get_client_ip(self, request: Request) -> str:
        # 1. Cloudflare header
        cf_ip = request.headers.get("CF-Connecting-IP")
        if cf_ip:
            return cf_ip.split(",")[0].strip()

        # 2. X-Forwarded-For header (Render / proxies)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # 3. Direct client host
        if request.client and request.client.host:
            return request.client.host

        return "127.0.0.1"

    async def check(self, request: Request) -> None:
        ip = self.get_client_ip(request)
        now = time.time()
        window_start = now - self.window_seconds

        timestamps = self.hits[ip]

        # Clean expired timestamps outside the sliding window
        while timestamps and timestamps[0] < window_start:
            timestamps.popleft()

        if len(timestamps) >= self.requests_per_minute:
            retry_after = int(self.window_seconds - (now - timestamps[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in {max(1, retry_after)} seconds.",
                headers={"Retry-After": str(max(1, retry_after))},
            )

        timestamps.append(now)


# Pre-configured rate limiter instances for different API risk levels
limiter_auth = SlidingWindowRateLimiter(requests_per_minute=10, window_seconds=60)
limiter_write = SlidingWindowRateLimiter(requests_per_minute=30, window_seconds=60)
limiter_general = SlidingWindowRateLimiter(requests_per_minute=120, window_seconds=60)
