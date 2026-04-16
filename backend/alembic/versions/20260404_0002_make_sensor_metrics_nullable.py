from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260404_0002"
down_revision = "20260404_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("sensor_data") as batch_op:
        batch_op.alter_column("temperature", existing_type=sa.Float(), nullable=True)
        batch_op.alter_column("humidity", existing_type=sa.Float(), nullable=True)
        batch_op.alter_column("pressure", existing_type=sa.Float(), nullable=True)
        batch_op.alter_column("air_quality", existing_type=sa.Float(), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table("sensor_data") as batch_op:
        batch_op.alter_column("temperature", existing_type=sa.Float(), nullable=False)
        batch_op.alter_column("humidity", existing_type=sa.Float(), nullable=False)
        batch_op.alter_column("pressure", existing_type=sa.Float(), nullable=False)
        batch_op.alter_column("air_quality", existing_type=sa.Float(), nullable=False)
