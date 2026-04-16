from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260404_0003"
down_revision = "20260404_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("sensor_data") as batch_op:
        batch_op.add_column(sa.Column("rain", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("altitude", sa.Float(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("sensor_data") as batch_op:
        batch_op.drop_column("altitude")
        batch_op.drop_column("rain")
