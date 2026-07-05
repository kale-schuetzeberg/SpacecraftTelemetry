"""create initial schema

Revision ID: d3a3312339a3
Revises:
Create Date: 2026-06-27 21:16:13.320884

"""

from typing import Sequence, Union

from sqlalchemy import text

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d3a3312339a3"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        text(
            """CREATE TYPE system_status AS ENUM ('nominal', 'warning', 'critical', 'offline')"""
        )
    )

    op.execute(
        text(
            """CREATE TYPE warning_type AS ENUM ('low_fuel', 'high_temp', 'sensor_fault', 'low_altitude', 'low_battery')"""
        )
    )

    op.execute(text("""
            CREATE TABLE satellites
            (
                id                 UUID PRIMARY KEY     DEFAULT uuidv7(),
                satellite_name     VARCHAR(64) NOT NULL,
                mission_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """))

    op.execute(text("""
            CREATE TABLE orbital_states
            (
                id                             UUID PRIMARY KEY DEFAULT uuidv7(),
                satellite_id                   UUID             NOT NULL,
                timestamp                      TIMESTAMPTZ      NOT NULL,
                altitude_km                    DOUBLE PRECISION NOT NULL,
                latitude_deg                   DOUBLE PRECISION NOT NULL,
                longitude_deg                  DOUBLE PRECISION NOT NULL,
                orbital_velocity_km_per_s      DOUBLE PRECISION NOT NULL,
                ground_track_velocity_km_per_s DOUBLE PRECISION NOT NULL,
                FOREIGN KEY (satellite_id) REFERENCES satellites (id)
            )
            """))

    op.execute(text("""
            CREATE TABLE power_systems
            (
                id                UUID PRIMARY KEY DEFAULT uuidv7(),
                satellite_id      UUID        NOT NULL,
                timestamp         TIMESTAMPTZ NOT NULL,
                battery_level_pct NUMERIC(5, 2),
                solar_input_w     DOUBLE PRECISION,
                power_draw_w      DOUBLE PRECISION,
                FOREIGN KEY (satellite_id) REFERENCES satellites (id)
            )
            """))

    op.execute(text("""
            CREATE TABLE thermals
            (
                id                  UUID PRIMARY KEY DEFAULT uuidv7(),
                satellite_id        UUID        NOT NULL,
                timestamp           TIMESTAMPTZ NOT NULL,
                temp_battery_c       NUMERIC(5, 2),
                temp_solar_panels_c NUMERIC(5, 2),
                temp_electronics_c  NUMERIC(5, 2),
                temp_exterior_c     NUMERIC(5, 2),
                FOREIGN KEY (satellite_id) REFERENCES satellites (id)
            )
            """))

    op.execute(text("""
            CREATE TABLE attitudes
            (
                id           UUID PRIMARY KEY DEFAULT uuidv7(),
                satellite_id UUID        NOT NULL,
                timestamp    TIMESTAMPTZ NOT NULL,
                pitch_deg    DOUBLE PRECISION,
                roll_deg     DOUBLE PRECISION,
                yaw_deg      DOUBLE PRECISION,
                FOREIGN KEY (satellite_id) REFERENCES satellites (id)
            )
            """))

    op.execute(text("""
            CREATE TABLE statuses
            (
                id            UUID PRIMARY KEY DEFAULT uuidv7(),
                satellite_id  UUID          NOT NULL,
                timestamp     TIMESTAMPTZ   NOT NULL,
                system_status system_status NOT NULL,
                FOREIGN KEY (satellite_id) REFERENCES satellites (id)
            )
            """))

    op.execute(text("""
            CREATE TABLE warnings
            (
                id           UUID PRIMARY KEY DEFAULT uuidv7(),
                satellite_id UUID         NOT NULL,
                timestamp    TIMESTAMPTZ  NOT NULL,
                warning      warning_type NOT NULL,
                FOREIGN KEY (satellite_id) REFERENCES satellites (id)
            )
            """))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(text("DROP TABLE IF EXISTS warnings"))
    op.execute(text("DROP TABLE IF EXISTS statuses"))
    op.execute(text("DROP TABLE IF EXISTS attitudes"))
    op.execute(text("DROP TABLE IF EXISTS thermals"))
    op.execute(text("DROP TABLE IF EXISTS power_systems"))
    op.execute(text("DROP TABLE IF EXISTS orbital_states"))
    op.execute(text("DROP TABLE IF EXISTS satellites"))
    op.execute(text("DROP TYPE IF EXISTS warning_type"))
    op.execute(text("DROP TYPE IF EXISTS system_status"))
