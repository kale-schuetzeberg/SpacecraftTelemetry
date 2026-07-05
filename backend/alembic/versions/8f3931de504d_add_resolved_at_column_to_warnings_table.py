"""add resolved_at column to warnings table

Revision ID: 8f3931de504d
Revises: 0dd4fe6b19e4
Create Date: 2026-07-05 09:02:17.068812

"""

from typing import Sequence, Union

from sqlalchemy import text

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8f3931de504d"
down_revision: Union[str, Sequence[str], None] = "0dd4fe6b19e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(text("""
                    ALTER TABLE warnings
                        ADD COLUMN resolved_at TIMESTAMPTZ NULL;
                    """))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(text("""
                    ALTER TABLE warnings
                        DROP COLUMN resolved_at;
                    """))
