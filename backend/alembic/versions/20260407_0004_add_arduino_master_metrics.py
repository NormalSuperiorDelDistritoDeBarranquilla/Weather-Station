from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260407_0004"
down_revision = "20260404_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("sensor_data") as batch_op:
        batch_op.add_column(sa.Column("luminosity", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("rain_analog", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("rain_digital", sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column("wind_speed", sa.Float(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("sensor_data") as batch_op:
        batch_op.drop_column("wind_speed")
        batch_op.drop_column("rain_digital")
        batch_op.drop_column("rain_analog")
        batch_op.drop_column("luminosity")
