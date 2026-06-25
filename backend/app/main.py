from asyncio import create_task, sleep
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.api.telemetry import router as telemetry_router
from app.core.config import get_cors_origins
from app.core.database import create_tables
from app.models.schemas import TelemetryEnvelope
from app.simulator.simulator import Simulator

simulator = Simulator()


async def run_simulator():
    while True:
        simulator.update(60)
        await sleep(1.0)


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    task = create_task(run_simulator())
    yield
    task.cancel()


app = FastAPI(title="Spacecraft Ground Station API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)


@app.get("/health")
async def health():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    return {"status": "ok"}


@app.get("/telemetry/latest")
async def telemetry_latest():
    """Retrieve the latest telemetry from the simulator"""
    return simulator.get_telemetry()


app.include_router(telemetry_router)


@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            telemetry = simulator.get_telemetry()

            envelope = TelemetryEnvelope.create(
                telemetry=telemetry,
                sequence=simulator.get_current_telemetry_sequence_number(),
                source="simulator",
            )

            await websocket.send_json(envelope.model_dump(mode="json"))
            await sleep(1.0)
    except WebSocketDisconnect:
        pass
