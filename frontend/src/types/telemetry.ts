export interface Position {
    altitude_km: number;
    latitude_deg: number;
    longitude_deg: number;
}

export interface Velocity {
    orbital_velocity_km_per_s: number;
    ground_track_velocity_km_per_s: number;
}

export interface PowerSystem {
    battery_level_pct: number;
    solar_input_w: number;
    power_draw_w: number;
    net_power_w: number;
}

export interface Thermal {
    temp_battery_c: number;
    temp_solar_panels_c: number;
    temp_electronics_c: number;
    temp_exterior_c: number;
}

export interface Attitude {
    pitch_deg: number;
    roll_deg: number;
    yaw_deg: number;
}

export type SystemStatus = 'nominal' | 'warning' | 'critical' | 'offline';

export interface Status {
    system_status: SystemStatus;
    active_warnings: string[];
    mission_time_s: number;
}

export interface Telemetry {
    timestamp: string;
    position: Position;
    velocity: Velocity;
    power_system: PowerSystem;
    thermal: Thermal;
    attitude: Attitude;
    status: Status;
}

export interface TelemetryEnvelope {
    send_timestamp_ms: number;
    source: 'simulator' | 'rocket';
    sequence_number: number;
    telemetry: Telemetry;
}