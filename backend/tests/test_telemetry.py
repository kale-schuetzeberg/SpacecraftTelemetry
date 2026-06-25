from tests.conftest import SAMPLE_ENTRY


# POST /telemetry


def test_add_telemetry_success(client):
    response = client.post("/telemetry", json=SAMPLE_ENTRY)
    assert response.status_code == 201
    body = response.json()
    assert body["satelliteId"] == "SAT-001"
    assert body["altitude"] == 400.0
    assert body["velocity"] == 7.8
    assert body["status"] == "nominal"
    assert isinstance(body["id"], int)


def test_add_telemetry_negative_altitude(client):
    response = client.post("/telemetry", json={**SAMPLE_ENTRY, "altitude": -1.0})
    assert response.status_code == 422


def test_add_telemetry_zero_altitude(client):
    response = client.post("/telemetry", json={**SAMPLE_ENTRY, "altitude": 0.0})
    assert response.status_code == 422


def test_add_telemetry_negative_velocity(client):
    response = client.post("/telemetry", json={**SAMPLE_ENTRY, "velocity": -5.0})
    assert response.status_code == 422


def test_add_telemetry_invalid_status(client):
    response = client.post("/telemetry", json={**SAMPLE_ENTRY, "status": "flying"})
    assert response.status_code == 422


def test_add_telemetry_invalid_timestamp(client):
    response = client.post(
        "/telemetry", json={**SAMPLE_ENTRY, "timestamp": "not-a-date"}
    )
    assert response.status_code == 422


# GET /telemetry


def test_get_telemetry_empty(client):
    response = client.get("/telemetry")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 0
    assert body["data"] == []
    assert body["limit"] == 20
    assert body["offset"] == 0


def test_get_telemetry_returns_all(seeded_client):
    response = seeded_client.get("/telemetry")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert len(body["data"]) == 2


def test_get_telemetry_filter_by_satellite_id(seeded_client):
    response = seeded_client.get("/telemetry?satellite_id=SAT-001")
    body = response.json()
    assert body["total"] == 1
    assert body["data"][0]["satelliteId"] == "SAT-001"


def test_get_telemetry_filter_by_status(seeded_client):
    response = seeded_client.get("/telemetry?status=warning")
    body = response.json()
    assert body["total"] == 1
    assert body["data"][0]["status"] == "warning"


def test_get_telemetry_pagination_limit(seeded_client):
    response = seeded_client.get("/telemetry?limit=1")
    body = response.json()
    assert body["total"] == 2
    assert len(body["data"]) == 1


def test_get_telemetry_pagination_offset(seeded_client):
    response = seeded_client.get("/telemetry?limit=1&offset=1")
    body = response.json()
    assert body["total"] == 2
    assert len(body["data"]) == 1


def test_get_telemetry_limit_exceeds_max(client):
    response = client.get("/telemetry?limit=999")
    assert response.status_code == 422


# GET /telemetry/{satellite_id}


def test_get_by_satellite_id_found(seeded_client):
    response = seeded_client.get("/telemetry/SAT-001")
    assert response.status_code == 200
    assert response.json()["satelliteId"] == "SAT-001"


def test_get_by_satellite_id_not_found(client):
    response = client.get("/telemetry/UNKNOWN")
    assert response.status_code == 404


# DELETE /telemetry/{satellite_id}


def test_delete_telemetry_success(seeded_client):
    entry_id = seeded_client.post("/telemetry", json=SAMPLE_ENTRY).json()["id"]
    response = seeded_client.delete(f"/telemetry/{entry_id}")
    assert response.status_code == 204


def test_delete_telemetry_not_found(client):
    response = client.delete("/telemetry/99999")
    assert response.status_code == 404
