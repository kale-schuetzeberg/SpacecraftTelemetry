import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models.orm import Base

SAMPLE_ENTRY = {
    "satelliteId": "SAT-001",
    "timestamp": "2024-01-15T12:00:00Z",
    "altitude": 400.0,
    "velocity": 7.8,
    "status": "nominal",
}


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestSessionLocal = sessionmaker(bind=engine)

    def override_get_session():
        session = TestSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)


@pytest.fixture
def seeded_client(client):
    client.post("/telemetry", json=SAMPLE_ENTRY)
    client.post(
        "/telemetry",
        json={**SAMPLE_ENTRY, "satelliteId": "SAT-002", "status": "warning"},
    )
    return client
