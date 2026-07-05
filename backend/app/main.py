from asyncio import create_task, sleep
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.database.connection import close_pool, init_pool
from app.database.queries import (
    insert_attitude_state,
    insert_orbital_state,
    insert_power_system_state,
    insert_status,
    insert_thermal_state,
    insert_warning,
    update_warning_resolved_at,
    retrieve_satellite,
    seed_satellite,
)
from app.models.models import TelemetryEnvelope
from app.simulator.simulator import Simulator

simulator = Simulator()


async def run_simulator():
    record = await retrieve_satellite("theodore")
    satellite_id = record["id"]
    previous_status = None
    warnings = set()
    while True:
        simulator.update(60)
        telemetry = simulator.get_telemetry()
        await insert_orbital_state(
            satellite_id,
            telemetry.position.altitude_km,
            telemetry.position.latitude_deg,
            telemetry.position.longitude_deg,
            telemetry.velocity.orbital_velocity_km_per_s,
            telemetry.velocity.ground_track_velocity_km_per_s,
        )
        await insert_power_system_state(
            satellite_id,
            telemetry.power_system.battery_level_pct,
            telemetry.power_system.solar_input_w,
            telemetry.power_system.power_draw_w,
        )
        await insert_thermal_state(
            satellite_id,
            telemetry.thermal.temp_battery_c,
            telemetry.thermal.temp_solar_panels_c,
            telemetry.thermal.temp_electronics_c,
            telemetry.thermal.temp_exterior_c,
        )
        await insert_attitude_state(
            satellite_id,
            telemetry.attitude.pitch_deg,
            telemetry.attitude.roll_deg,
            telemetry.attitude.yaw_deg,
        )
        if previous_status != telemetry.mission_state.system_status:
            previous_status = telemetry.mission_state.system_status
            await insert_status(
                satellite_id,
                telemetry.mission_state.system_status,
            )
        if telemetry.mission_state.active_warnings != warnings:
            new_warnings = telemetry.mission_state.active_warnings.difference(warnings)
            dropped_warnings = warnings.difference(
                telemetry.mission_state.active_warnings
            )
            warnings = telemetry.mission_state.active_warnings
            # Add new warnings
            for warning in new_warnings:
                await insert_warning(satellite_id, warning)
            # Resolve dropped warnings
            for warning in dropped_warnings:
                await update_warning_resolved_at(satellite_id, warning)
        await sleep(1.0)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_pool()
    await seed_satellite("theodore")
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
