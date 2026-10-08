import { Pool } from "pg";
import { aiPipeline, SensorReadings, PipelineResult, getAssetParams } from "./ai-engine";

export interface AssetRecord {
  id: string;
  asset_type: string;
  type_label: string;
  image: string;
  last_service: string;
  health_score: number;
  health_state: string;
  failure_probability: number;
  rul_days: number;
  is_anomaly: boolean;
  anomaly_score: number;
  vibration: number;
  temperature: number;
  current: number;
  pressure: number;
  root_cause: string;
  recommended_action: string;
  rules_triggered: string[];
  updated_at: string;
}

export interface SensorTelemetryRecord {
  id: string;
  asset_id: string;
  timestamp: string;
  vibration: number;
  temperature: number;
  current: number;
  pressure: number;
  is_anomaly: boolean;
  anomaly_score: number;
}

export interface AlertRecord {
  id: string;
  asset_id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  status: "Open" | "Acknowledged" | "Resolved";
  root_cause?: string;
  time_ago?: string;
  created_at: string;
  resolved_at?: string;
}

export interface WorkOrderRecord {
  id: string;
  asset_id: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  due_date: string;
  due_label: string;
  status: "Pending" | "In Progress" | "Completed";
  task_type: "Predictive" | "Preventative" | "Emergency" | "Routine";
  assigned_to?: string;
  notes?: string;
  created_at: string;
}

// Global In-Memory / Fallback Storage
class MemoryDB {
  assets: Map<string, AssetRecord> = new Map();
  telemetry: SensorTelemetryRecord[] = [];
  alerts: AlertRecord[] = [];
  workOrders: WorkOrderRecord[] = [];
  isInitialized: boolean = false;

  constructor() {
    this.seedDefaults();
  }

  seedDefaults() {
    if (this.isInitialized && this.assets.size > 0) return;

    const defaultList: { id: string; type: string; label: string; img: string; lastService: string; mode: string; step: number }[] = [
      { id: "HVAC-01", type: "HVAC", label: "HVAC System", img: "/assets/equip-0-1.jpg", lastService: "42 days ago", mode: "degrade", step: 9 },
      { id: "PUMP-01", type: "PUMP", label: "Industrial Water Pump", img: "/assets/equip-0-0.jpg", lastService: "14 days ago", mode: "degrade", step: 6 },
      { id: "ELEVATOR-01", type: "ELEVATOR", label: "Passenger Elevator", img: "/assets/equip-0-2.jpg", lastService: "5 days ago", mode: "normal", step: 0 },
      { id: "GENERATOR-01", type: "GENERATOR", label: "Backup Generator", img: "/assets/equip-1-0.jpg", lastService: "120 days ago", mode: "normal", step: 0 },
      { id: "CHILLER-01", type: "CHILLER", label: "Industrial Chiller", img: "/assets/equip-1-1.jpg", lastService: "210 days ago", mode: "normal", step: 0 },
    ];

    for (const item of defaultList) {
      const params = getAssetParams(item.type);
      const isDeg = item.mode === "degrade";
      const factor = isDeg ? Math.min(item.step / 10.0, 1.0) : 0;
      
      const sensors: SensorReadings = {
        vibration: Number((params.vib_base + (isDeg ? params.vib_deg * factor : 0)).toFixed(2)),
        temperature: Number((params.temp_base + (isDeg ? params.temp_deg * factor : 0)).toFixed(2)),
        current: Number((params.curr_base + (isDeg ? params.curr_deg * factor : 0)).toFixed(2)),
        pressure: Number((params.press_base + (isDeg ? params.press_deg * factor : 0)).toFixed(2)),
      };

      const res = aiPipeline.process(item.type, sensors);

      const record: AssetRecord = {
        id: item.id,
        asset_type: item.type,
        type_label: item.label,
        image: item.img,
        last_service: item.lastService,
        health_score: res.health.score,
        health_state: res.health.state,
        failure_probability: res.predictions.failure_probability,
        rul_days: res.predictions.rul_days,
        is_anomaly: res.predictions.is_anomaly,
        anomaly_score: res.predictions.anomaly_score,
        vibration: res.sensors.vibration,
        temperature: res.sensors.temperature,
        current: res.sensors.current,
        pressure: res.sensors.pressure,
        root_cause: res.neurosymbolic.root_cause,
        recommended_action: res.neurosymbolic.recommended_action,
        rules_triggered: res.neurosymbolic.rules_triggered,
        updated_at: new Date().toISOString(),
      };

      this.assets.set(item.id, record);

      // Generate seed telemetry history
      const now = Date.now();
      for (let i = 10; i >= 0; i--) {
        const time = new Date(now - i * 15 * 60 * 1000).toISOString();
        const noise = (Math.random() - 0.5) * 0.2;
        this.telemetry.push({
          id: `tel-${item.id}-${i}`,
          asset_id: item.id,
          timestamp: time,
          vibration: Number((sensors.vibration + noise).toFixed(2)),
          temperature: Number((sensors.temperature + noise * 2).toFixed(2)),
          current: Number((sensors.current + noise).toFixed(2)),
          pressure: Number((sensors.pressure + noise * 1.5).toFixed(2)),
          is_anomaly: res.predictions.is_anomaly && i <= 3,
          anomaly_score: res.predictions.anomaly_score,
        });
      }
    }

    // Seed Initial Alerts
    this.alerts = [
      {
        id: "ALT-001",
        asset_id: "HVAC-01",
        severity: "critical",
        title: "HVAC Bearing Friction Exceeded",
        message: "AI predicts failure in 3.2 days due to elevated compressor heat & high vibration.",
        status: "Open",
        root_cause: "High bearing vibration combined with elevated compressor heat",
        time_ago: "4 mins ago",
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: "ALT-002",
        asset_id: "PUMP-01",
        severity: "warning",
        title: "Suction Cavitation Warning",
        message: "Mild vibration elevation detected (4.2 mm/s).",
        status: "Acknowledged",
        root_cause: "Impeller cavitation causing mild vibration elevation",
        time_ago: "45 mins ago",
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: "ALT-003",
        asset_id: "CHILLER-01",
        severity: "info",
        title: "Routine Self-Diagnostic Pass",
        message: "Nominal operational envelope verified across all 4 sensors.",
        status: "Resolved",
        time_ago: "3 hours ago",
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        resolved_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ];

    // Seed Initial Work Orders
    this.workOrders = [
      {
        id: "WO-101",
        asset_id: "HVAC-01",
        title: "Inspect primary compressor bearing and flush refrigerant coolant loops",
        priority: "Critical",
        due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        due_label: "Now (48h)",
        status: "Pending",
        task_type: "Predictive",
        assigned_to: "Lead Tech: Marcus V.",
        created_at: new Date().toISOString(),
      },
      {
        id: "WO-102",
        asset_id: "PUMP-01",
        title: "Check suction pressure and inspect pump seal integrity",
        priority: "High",
        due_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        due_label: "In 5 days",
        status: "Pending",
        task_type: "Predictive",
        assigned_to: "Technician: Sarah K.",
        created_at: new Date().toISOString(),
      },
      {
        id: "WO-103",
        asset_id: "ELEVATOR-01",
        title: "Quarterly cable tension calibration and safety switch verification",
        priority: "Medium",
        due_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        due_label: "In 2 weeks",
        status: "Pending",
        task_type: "Routine",
        assigned_to: "Otis Service Partner",
        created_at: new Date().toISOString(),
      },
      {
        id: "WO-104",
        asset_id: "GENERATOR-01",
        title: "Backup fuel line flush and battery float voltage inspection",
        priority: "Low",
        due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        due_label: "This Month",
        status: "Completed",
        task_type: "Preventative",
        assigned_to: "Facility Team B",
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    this.isInitialized = true;
  }
}

// Global singleton for memory database
const memoryDb = (global as any).__buildguard_memory_db || new MemoryDB();
if (process.env.NODE_ENV !== "production") {
  (global as any).__buildguard_memory_db = memoryDb;
}

// PostgreSQL Connection Pool (used if DATABASE_URL or POSTGRES_URL is configured)
let pgPool: Pool | null = null;
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

function getPgPool(): Pool | null {
  if (!connectionString) return null;
  if (!pgPool) {
    try {
      pgPool = new Pool({
        connectionString,
        ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 4000,
      });
    } catch (e) {
      console.warn("Postgres pool creation failed, falling back to MemoryDB:", e);
      return null;
    }
  }
  return pgPool;
}

/** Check if live PostgreSQL database is connected */
export async function getDbStatus(): Promise<{ connected: boolean; provider: string; details?: any }> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT current_database(), current_user, version();");
      return {
        connected: true,
        provider: "PostgreSQL / Supabase",
        details: res.rows[0],
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: "In-Memory / Fallback Storage",
        details: { message: err.message },
      };
    }
  }
  return {
    connected: false,
    provider: "In-Memory / Local Storage (Zero-Config Vercel Ready)",
    details: { totalAssets: memoryDb.assets.size, totalAlerts: memoryDb.alerts.length },
  };
}

/** Initialize tables in PostgreSQL if connected */
export async function initDbSchema(): Promise<boolean> {
  const pool = getPgPool();
  if (!pool) return false;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buildguard_assets (
        id VARCHAR(50) PRIMARY KEY,
        asset_type VARCHAR(50) NOT NULL,
        type_label VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        last_service VARCHAR(100),
        health_score INTEGER NOT NULL,
        health_state VARCHAR(50) NOT NULL,
        failure_probability NUMERIC(5, 2) NOT NULL,
        rul_days NUMERIC(6, 1) NOT NULL,
        is_anomaly BOOLEAN NOT NULL,
        anomaly_score NUMERIC(6, 3) NOT NULL,
        vibration NUMERIC(6, 2) NOT NULL,
        temperature NUMERIC(6, 2) NOT NULL,
        current NUMERIC(6, 2) NOT NULL,
        pressure NUMERIC(6, 2) NOT NULL,
        root_cause TEXT,
        recommended_action TEXT,
        rules_triggered TEXT[],
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS buildguard_sensor_telemetry (
        id VARCHAR(100) PRIMARY KEY,
        asset_id VARCHAR(50) REFERENCES buildguard_assets(id) ON DELETE CASCADE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        vibration NUMERIC(6, 2) NOT NULL,
        temperature NUMERIC(6, 2) NOT NULL,
        current NUMERIC(6, 2) NOT NULL,
        pressure NUMERIC(6, 2) NOT NULL,
        is_anomaly BOOLEAN DEFAULT FALSE,
        anomaly_score NUMERIC(6, 3) DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS buildguard_alerts (
        id VARCHAR(50) PRIMARY KEY,
        asset_id VARCHAR(50) REFERENCES buildguard_assets(id) ON DELETE CASCADE,
        severity VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Open',
        root_cause TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS buildguard_work_orders (
        id VARCHAR(50) PRIMARY KEY,
        asset_id VARCHAR(50) REFERENCES buildguard_assets(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE,
        due_label VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        task_type VARCHAR(50) NOT NULL DEFAULT 'Predictive',
        assigned_to VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed if empty
    const check = await pool.query("SELECT COUNT(*) FROM buildguard_assets");
    if (parseInt(check.rows[0].count) === 0) {
      const assetList: AssetRecord[] = Array.from(memoryDb.assets.values());
      for (const asset of assetList) {
        await pool.query(
          `INSERT INTO buildguard_assets 
           (id, asset_type, type_label, image, last_service, health_score, health_state, failure_probability, rul_days, is_anomaly, anomaly_score, vibration, temperature, current, pressure, root_cause, recommended_action, rules_triggered, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          [
            asset.id, asset.asset_type, asset.type_label, asset.image, asset.last_service,
            asset.health_score, asset.health_state, asset.failure_probability, asset.rul_days,
            asset.is_anomaly, asset.anomaly_score, asset.vibration, asset.temperature,
            asset.current, asset.pressure, asset.root_cause, asset.recommended_action,
            asset.rules_triggered, asset.updated_at
          ]
        );
      }
    }
    return true;
  } catch (err) {
    console.warn("Postgres schema init failed, continuing with in-memory store:", err);
    return false;
  }
}

/** Get all assets formatted for API */
export async function getAllAssets(): Promise<any[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM buildguard_assets ORDER BY failure_probability DESC");
      if (res.rows.length > 0) {
        return res.rows.map(mapDbRowToAsset);
      }
    } catch (e) {
      // fallback to memory
    }
  }

  const assetList: AssetRecord[] = Array.from(memoryDb.assets.values());
  return assetList.map((asset: AssetRecord) => ({
    id: asset.id,
    asset_type: asset.asset_type,
    type_label: asset.type_label,
    image: asset.image,
    last_service: asset.last_service,
    sensors: {
      vibration: asset.vibration,
      temperature: asset.temperature,
      current: asset.current,
      pressure: asset.pressure,
    },
    predictions: {
      is_anomaly: asset.is_anomaly,
      anomaly_score: asset.anomaly_score,
      failure_probability: asset.failure_probability,
      rul_days: asset.rul_days,
    },
    health: {
      score: asset.health_score,
      state: asset.health_state,
    },
    neurosymbolic: {
      root_cause: asset.root_cause,
      recommended_action: asset.recommended_action,
      rules_triggered: asset.rules_triggered || [],
    },
  }));
}

/** Get single asset by ID */
export async function getAssetById(id: string): Promise<any | null> {
  const targetId = id.toUpperCase();
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM buildguard_assets WHERE UPPER(id) = $1 OR UPPER(asset_type) = $1", [targetId]);
      if (res.rows.length > 0) {
        return mapDbRowToAsset(res.rows[0]);
      }
    } catch (e) {
      // fallback to memory
    }
  }

  const assetList: AssetRecord[] = Array.from(memoryDb.assets.values());
  const asset = assetList.find(
    (a: AssetRecord) => a.id.toUpperCase() === targetId || a.asset_type.toUpperCase() === targetId
  );

  if (!asset) return null;

  return {
    id: asset.id,
    asset_type: asset.asset_type,
    type_label: asset.type_label,
    image: asset.image,
    last_service: asset.last_service,
    sensors: {
      vibration: asset.vibration,
      temperature: asset.temperature,
      current: asset.current,
      pressure: asset.pressure,
    },
    predictions: {
      is_anomaly: asset.is_anomaly,
      anomaly_score: asset.anomaly_score,
      failure_probability: asset.failure_probability,
      rul_days: asset.rul_days,
    },
    health: {
      score: asset.health_score,
      state: asset.health_state,
    },
    neurosymbolic: {
      root_cause: asset.root_cause,
      recommended_action: asset.recommended_action,
      rules_triggered: asset.rules_triggered || [],
    },
  };
}

/** Update or insert live simulation reading into database */
export async function recordSimulation(
  assetType: string,
  sensors: SensorReadings,
  pipelineResult: PipelineResult
): Promise<void> {
  const atype = assetType.toUpperCase();
  const assetId = `${atype}-01`;

  // Update in memory DB
  const existing = memoryDb.assets.get(assetId);
  const updated: AssetRecord = {
    id: assetId,
    asset_type: atype,
    type_label: existing?.type_label || `${atype} Unit`,
    image: existing?.image || `/assets/equip-0-0.jpg`,
    last_service: existing?.last_service || "Recent",
    health_score: pipelineResult.health.score,
    health_state: pipelineResult.health.state,
    failure_probability: pipelineResult.predictions.failure_probability,
    rul_days: pipelineResult.predictions.rul_days,
    is_anomaly: pipelineResult.predictions.is_anomaly,
    anomaly_score: pipelineResult.predictions.anomaly_score,
    vibration: sensors.vibration,
    temperature: sensors.temperature,
    current: sensors.current,
    pressure: sensors.pressure,
    root_cause: pipelineResult.neurosymbolic.root_cause,
    recommended_action: pipelineResult.neurosymbolic.recommended_action,
    rules_triggered: pipelineResult.neurosymbolic.rules_triggered,
    updated_at: new Date().toISOString(),
  };

  memoryDb.assets.set(assetId, updated);

  // Add telemetry point
  memoryDb.telemetry.unshift({
    id: `tel-${assetId}-${Date.now()}`,
    asset_id: assetId,
    timestamp: new Date().toISOString(),
    vibration: sensors.vibration,
    temperature: sensors.temperature,
    current: sensors.current,
    pressure: sensors.pressure,
    is_anomaly: pipelineResult.predictions.is_anomaly,
    anomaly_score: pipelineResult.predictions.anomaly_score,
  });

  // If critical, trigger alert
  if (pipelineResult.health.state === "Critical" || pipelineResult.predictions.failure_probability > 75) {
    const existingOpen = memoryDb.alerts.find((a: AlertRecord) => a.asset_id === assetId && a.status === "Open");
    if (!existingOpen) {
      memoryDb.alerts.unshift({
        id: `ALT-${Date.now().toString().slice(-4)}`,
        asset_id: assetId,
        severity: "critical",
        title: `${updated.type_label} Critical Anomaly`,
        message: pipelineResult.neurosymbolic.root_cause,
        status: "Open",
        root_cause: pipelineResult.neurosymbolic.root_cause,
        time_ago: "Just now",
        created_at: new Date().toISOString(),
      });
    }
  }

  // Persist to Postgres if available
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE buildguard_assets 
         SET health_score = $1, health_state = $2, failure_probability = $3, rul_days = $4,
             is_anomaly = $5, anomaly_score = $6, vibration = $7, temperature = $8,
             current = $9, pressure = $10, root_cause = $11, recommended_action = $12,
             rules_triggered = $13, updated_at = NOW()
         WHERE id = $14`,
        [
          updated.health_score, updated.health_state, updated.failure_probability, updated.rul_days,
          updated.is_anomaly, updated.anomaly_score, updated.vibration, updated.temperature,
          updated.current, updated.pressure, updated.root_cause, updated.recommended_action,
          updated.rules_triggered, assetId
        ]
      );
    } catch (e) {
      // non-fatal
    }
  }
}

/** Update asset telemetry specifically with custom asset ID */
export async function updateAssetTelemetry(
  assetId: string,
  sensors: SensorReadings,
  pipelineResult: PipelineResult
): Promise<void> {
  const atype = assetId.split("-")[0] || "HVAC";
  const existing = memoryDb.assets.get(assetId);
  const updated: AssetRecord = {
    id: assetId,
    asset_type: existing?.asset_type || atype,
    type_label: existing?.type_label || `${atype} Equipment`,
    image: existing?.image || `/assets/equip-0-0.jpg`,
    last_service: existing?.last_service || "Mobile Inspection (Today)",
    health_score: pipelineResult.health.score,
    health_state: pipelineResult.health.state,
    failure_probability: pipelineResult.predictions.failure_probability,
    rul_days: pipelineResult.predictions.rul_days,
    is_anomaly: pipelineResult.predictions.is_anomaly,
    anomaly_score: pipelineResult.predictions.anomaly_score,
    vibration: sensors.vibration,
    temperature: sensors.temperature,
    current: sensors.current,
    pressure: sensors.pressure,
    root_cause: pipelineResult.neurosymbolic.root_cause,
    recommended_action: pipelineResult.neurosymbolic.recommended_action,
    rules_triggered: pipelineResult.neurosymbolic.rules_triggered,
    updated_at: new Date().toISOString(),
  };

  memoryDb.assets.set(assetId, updated);

  memoryDb.telemetry.unshift({
    id: `tel-${assetId}-${Date.now()}`,
    asset_id: assetId,
    timestamp: new Date().toISOString(),
    vibration: sensors.vibration,
    temperature: sensors.temperature,
    current: sensors.current,
    pressure: sensors.pressure,
    is_anomaly: pipelineResult.predictions.is_anomaly,
    anomaly_score: pipelineResult.predictions.anomaly_score,
  });

  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE buildguard_assets 
         SET health_score = $1, health_state = $2, failure_probability = $3, rul_days = $4,
             is_anomaly = $5, anomaly_score = $6, vibration = $7, temperature = $8,
             current = $9, pressure = $10, root_cause = $11, recommended_action = $12,
             rules_triggered = $13, updated_at = NOW()
         WHERE id = $14`,
        [
          updated.health_score, updated.health_state, updated.failure_probability, updated.rul_days,
          updated.is_anomaly, updated.anomaly_score, updated.vibration, updated.temperature,
          updated.current, updated.pressure, updated.root_cause, updated.recommended_action,
          updated.rules_triggered, assetId
        ]
      );
    } catch (e) {
      // non-fatal
    }
  }
}

/** Insert an alert */
export async function insertAlert(alert: AlertRecord): Promise<void> {
  memoryDb.alerts.unshift(alert);
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO buildguard_alerts (id, asset_id, severity, title, message, status, root_cause, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [alert.id, alert.asset_id, alert.severity, alert.title, alert.message, alert.status, alert.root_cause || null, alert.created_at]
      );
    } catch (e) {
      // fallback
    }
  }
}

/** Insert a work order */
export async function insertWorkOrder(wo: WorkOrderRecord): Promise<void> {
  memoryDb.workOrders.unshift(wo);
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO buildguard_work_orders (id, asset_id, title, priority, due_date, due_label, status, task_type, assigned_to, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [wo.id, wo.asset_id, wo.title, wo.priority, wo.due_date, wo.due_label, wo.status, wo.task_type, wo.assigned_to || null, wo.notes || null, wo.created_at]
      );
    } catch (e) {
      // fallback
    }
  }
}

/** Get alerts */
export async function getAlerts(): Promise<AlertRecord[]> {
  return memoryDb.alerts;
}

/** Get work orders */
export async function getWorkOrders(): Promise<WorkOrderRecord[]> {
  return memoryDb.workOrders;
}

/** Map postgres row to Asset object */
function mapDbRowToAsset(row: any) {
  return {
    id: row.id,
    asset_type: row.asset_type,
    type_label: row.type_label,
    image: row.image,
    last_service: row.last_service,
    sensors: {
      vibration: parseFloat(row.vibration),
      temperature: parseFloat(row.temperature),
      current: parseFloat(row.current),
      pressure: parseFloat(row.pressure),
    },
    predictions: {
      is_anomaly: Boolean(row.is_anomaly),
      anomaly_score: parseFloat(row.anomaly_score),
      failure_probability: parseFloat(row.failure_probability),
      rul_days: parseFloat(row.rul_days),
    },
    health: {
      score: parseInt(row.health_score),
      state: row.health_state,
    },
    neurosymbolic: {
      root_cause: row.root_cause,
      recommended_action: row.recommended_action,
      rules_triggered: row.rules_triggered || [],
    },
  };
}
