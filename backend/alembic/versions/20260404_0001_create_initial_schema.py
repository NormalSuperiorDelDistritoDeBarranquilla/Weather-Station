from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260404_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="admin"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "sensor_data",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("station_id", sa.String(length=50), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("humidity", sa.Float(), nullable=False),
        sa.Column("pressure", sa.Float(), nullable=False),
        sa.Column("air_quality", sa.Float(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_sensor_data_id", "sensor_data", ["id"], unique=False)
    op.create_index("ix_sensor_data_station_id", "sensor_data", ["station_id"], unique=False)
    op.create_index("ix_sensor_data_timestamp", "sensor_data", ["timestamp"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_sensor_data_timestamp", table_name="sensor_data")
    op.drop_index("ix_sensor_data_station_id", table_name="sensor_data")
    op.drop_index("ix_sensor_data_id", table_name="sensor_data")
    op.drop_table("sensor_data")

    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
