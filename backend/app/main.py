from asyncio import create_task, sleep
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.services.telemetry_service import TelemetryPersister
from app.database.connection import close_pool, init_pool
from app.database.queries import (
    retrieve_satellite,
    seed_satellite,
)
from app.models.models import TelemetryEnvelope
from app.simulator.simulator import Simulator

SATELLITE_NAME = "theodore"

simulator = Simulator()


async def run_simulator():
    record = await retrieve_satellite(SATELLITE_NAME)
    telemetry_persistor = TelemetryPersister(record["id"])
    while True:
        simulator.update(60)
        await telemetry_persistor.persist_telemetry(simulator.get_telemetry())
        await sleep(1.0)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_pool()
    await seed_satellite(SATELLITE_NAME)
    task = create_task(run_simulator())
    yield
    task.cancel()
    await close_pool()


app = FastAPI(title="Spacecraft Ground Station API", lifespan=lifespan)


@app.get("/health")
async def health():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    return {"status": "ok"}


@app.get("/telemetry/latest")
async def telemetry_latest():
    """Retrieve the latest telemetry"""
    return simulator.get_telemetry()


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
