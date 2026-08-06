import time
from typing import Any, Callable, Dict, Tuple

class SimpleMemoryCache:
    """In-memory TTL cache for read-heavy public FastAPI endpoints."""
    def __init__(self):
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        if key in self._cache:
            expires_at, value = self._cache[key]
            if time.time() < expires_at:
                return value
            del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 30) -> None:
        self._cache[key] = (time.time() + ttl_seconds, value)

    def invalidate(self, key: str) -> None:
        self._cache.pop(key, None)

memory_cache = SimpleMemoryCache()
