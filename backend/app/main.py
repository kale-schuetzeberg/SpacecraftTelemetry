from asyncio import create_task, sleep
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.models.models import TelemetryEnvelope
from app.simulator.simulator import Simulator

simulator = Simulator()

async def run_simulator():
    while True:
        simulator.update(60)
        await sleep(1.0)

@asynccontextmanager
async def lifespan(_: FastAPI):
    task = create_task(run_simulator())
    yield
    task.cancel()

app = FastAPI(title="Spacecraft Ground Station API", lifespan=lifespan)

@app.get("/")
async def root():
    """System health check"""
    return {"status": "operational"}

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
                source="simulator"
            )

            await websocket.send_json(envelope.model_dump(mode='json'))
            await sleep(1.0)
    except WebSocketDisconnect:
        pass

