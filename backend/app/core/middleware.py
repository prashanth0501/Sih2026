from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds essential production security headers to HTTP responses (skips OPTIONS preflight)."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        if request.method != "OPTIONS":
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

            # Enable HSTS on HTTPS requests
            if request.url.scheme == "https" or request.headers.get("X-Forwarded-Proto") == "https":
                response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
