"""rename satellite subsystem timestamp to recorded_at

Revision ID: 0dd4fe6b19e4
Revises: b332f1fb2048
Create Date: 2026-07-05 08:51:01.939444

"""

from typing import Sequence, Union

from sqlalchemy import text

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0dd4fe6b19e4"
down_revision: Union[str, Sequence[str], None] = "b332f1fb2048"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(text("""
            ALTER TABLE thermals
                RENAME COLUMN timestamp TO recorded_at;
             """))
    op.execute(text("""
             ALTER TABLE statuses
                 RENAME COLUMN timestamp TO recorded_at;
             """))
    op.execute(text("""
             ALTER TABLE power_systems
                 RENAME COLUMN timestamp TO recorded_at;
             """))
    op.execute(text("""
             ALTER TABLE warnings
                 RENAME COLUMN timestamp TO recorded_at;
             """))
    op.execute(text("""
             ALTER TABLE attitudes
                 RENAME COLUMN timestamp TO recorded_at;
             """))
    op.execute(text("""
             ALTER TABLE orbital_states
                 RENAME COLUMN timestamp TO recorded_at;
             """))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(text("""
             ALTER TABLE thermals
                 RENAME COLUMN recorded_at TO timestamp;
             """))
    op.execute(text("""
             ALTER TABLE statuses
                 RENAME COLUMN recorded_at TO timestamp;
             """))
    op.execute(text("""
             ALTER TABLE power_systems
                 RENAME COLUMN recorded_at TO timestamp;
             """))
    op.execute(text("""
             ALTER TABLE warnings
                 RENAME COLUMN recorded_at TO timestamp;
             """))
    op.execute(text("""
             ALTER TABLE attitudes
                 RENAME COLUMN recorded_at TO timestamp;
             """))
    op.execute(text("""
             ALTER TABLE orbital_states
                 RENAME COLUMN recorded_at TO timestamp;
             """))
