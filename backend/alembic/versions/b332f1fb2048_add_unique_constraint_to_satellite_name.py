"""satellites - add a unique constraint to satellite_name

Revision ID: b332f1fb2048
Revises: d3a3312339a3
Create Date: 2026-06-28 13:57:14.650799

"""

from typing import Sequence, Union

from sqlalchemy import text

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b332f1fb2048"
down_revision: Union[str, Sequence[str], None] = "d3a3312339a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(text("""
            ALTER TABLE satellites
                ADD CONSTRAINT unique_satellite_name UNIQUE (satellite_name);
            """))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(text("""
            ALTER TABLE satellites
                DROP CONSTRAINT unique_satellite_name;
            """))
