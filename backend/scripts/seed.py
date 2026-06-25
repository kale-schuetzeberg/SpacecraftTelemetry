import json
import urllib.request
import random
import datetime

SATELLITES = [
    "ASTRA-1",
    "BOREALIS-2",
    "CASSINI-X",
    "DAWN-7",
    "ECHO-3",
    "FALCON-9S",
    "GENESIS-4",
    "HELIOS-B",
    "ICARUS-II",
    "KEPLER-12",
    "LUNA-6",
    "MARS-3A",
    "NOVA-8",
    "ORBIT-1",
]

STATUSES = ["nominal", "warning", "critical", "offline"]
base = datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc)

entries = []

# Each satellite gets all 4 statuses at least once
for sat_i, sat in enumerate(SATELLITES):
    for status_i, status in enumerate(STATUSES):
        ts = base + datetime.timedelta(
            hours=sat_i * 40 + status_i * 8 + random.randint(0, 7)
        )
        entries.append(
            {
                "satelliteId": sat,
                "timestamp": ts.isoformat().replace("+00:00", "Z"),
                "altitude": round(random.uniform(280, 1400), 1),
                "velocity": round(random.uniform(5.2, 9.8), 2),
                "status": status,
            }
        )

# Top up to 80 entries with random distribution
for i in range(80 - len(entries)):
    sat = SATELLITES[i % len(SATELLITES)]
    ts = base + datetime.timedelta(hours=700 + i * 5 + random.randint(0, 4))
    entries.append(
        {
            "satelliteId": sat,
            "timestamp": ts.isoformat().replace("+00:00", "Z"),
            "altitude": round(random.uniform(280, 1400), 1),
            "velocity": round(random.uniform(5.2, 9.8), 2),
            "status": random.choice(STATUSES),
        }
    )

random.shuffle(entries)

ok = 0
for e in entries:
    data = json.dumps(e).encode()
    req = urllib.request.Request(
        "http://localhost:8000/telemetry",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        if r.status == 201:
            ok += 1

print(f"Seeded {ok}/80 entries across {len(SATELLITES)} satellites")
