"""Loopback-only UI/API. Public Pages never hosts this service or its credentials."""

import secrets
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from observatory.live import (
    LiveBootstrap,
    LiveManager,
    LiveProfile,
    LiveSnapshot,
    RunConflict,
    StartRun,
    readiness,
)
from observatory.scenarios import catalog


def create_app(manager: LiveManager, site: Path) -> FastAPI:
    token = secrets.token_urlsafe(32)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        manager.close()

    app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)

    @app.middleware("http")
    async def local_boundary(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        origin = request.headers.get("origin")
        expected = f"http://{request.headers.get('host', '')}"
        if (origin and origin != expected) or request.headers.get("sec-fetch-site") == "cross-site":
            return JSONResponse(
                {"detail": "Only this local application can access the runner"}, status_code=403
            )
        if request.method not in {"GET", "HEAD"}:
            if not secrets.compare_digest(request.headers.get("x-observatory-token", ""), token):
                return JSONResponse(
                    {"detail": "Reload the local app before starting a run"}, status_code=403
                )
            if len(await request.body()) > 16_384:
                return JSONResponse({"detail": "Request is too large"}, status_code=413)
        response = await call_next(request)
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost"])

    @app.get("/api/live/bootstrap")
    def bootstrap() -> LiveBootstrap:
        return LiveBootstrap(
            token=token,
            latest_run_id=manager.latest_run_id,
            profiles=[
                LiveProfile(
                    id=p.id,
                    label=p.label,
                    model=p.model,
                    ready=readiness(p) is None,
                    reason=readiness(p),
                )
                for p in manager.profiles
            ],
            scenarios=catalog(),
        )

    @app.post("/api/live/runs", status_code=201)
    def start(body: StartRun) -> LiveSnapshot:
        try:
            return manager.start(body)
        except RunConflict as exc:
            raise HTTPException(409, str(exc)) from None
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from None

    @app.get("/api/live/runs/{run_id}")
    def status(run_id: str) -> LiveSnapshot:
        try:
            return manager.snapshot(run_id)
        except KeyError:
            raise HTTPException(404, "Run not found in this local session") from None

    @app.post("/api/live/runs/{run_id}/stop")
    def stop(run_id: str) -> LiveSnapshot:
        try:
            return manager.stop(run_id)
        except KeyError:
            raise HTTPException(404, "Run not found in this local session") from None

    @app.get("/api/live/runs/{run_id}/download")
    def download(run_id: str) -> Response:
        snapshot = status(run_id)
        if snapshot.status == "running":
            raise HTTPException(409, "Wait for the run to stop before downloading")
        artifact = snapshot.bundle if snapshot.recording_saved else snapshot
        suffix = ".json" if snapshot.recording_saved else ".progress.json"
        return Response(
            artifact.model_dump_json(indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{snapshot.run_id}{suffix}"'},
        )

    if site.is_dir():
        app.mount("/", StaticFiles(directory=site, html=True), name="viewer")
    return app
