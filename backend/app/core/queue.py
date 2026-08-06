import asyncio
from typing import Callable, Any, TypeVar
from functools import wraps

T = TypeVar("T")

# High-Concurrency Async Concurrency Manager for 100+ Simultaneous Users
# Allows up to 100 parallel worker tasks while queuing overflow requests cleanly.
class HighConcurrencyQueueManager:
    def __init__(self, max_concurrent: int = 100):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.active_count = 0
        self.total_processed = 0

    async def run(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        async with self.semaphore:
            self.active_count += 1
            try:
                result = await func(*args, **kwargs)
                self.total_processed += 1
                return result
            finally:
                self.active_count -= 1

    def stats(self) -> dict:
        return {
            "active_tasks": self.active_count,
            "total_processed": self.total_processed,
            "available_slots": self.semaphore._value,
        }

# Global Worker Queue instance handling 100+ concurrent users
worker_queue = HighConcurrencyQueueManager(max_concurrent=100)


def concurrency_queued():
    """Decorator to route high-traffic endpoint handlers through the worker queue."""
    def decorator(func: Callable[..., Any]):
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any):
            return await worker_queue.run(func, *args, **kwargs)
        return wrapper
    return decorator
