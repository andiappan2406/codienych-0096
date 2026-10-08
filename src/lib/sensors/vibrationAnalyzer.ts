/**
 * Device Motion & Vibration Severity Analyzer
 * Uses window.DeviceMotionEvent & DeviceOrientationEvent to capture 3-axis
 * accelerometer signals, computing RMS acceleration, estimated vibration velocity (mm/s),
 * peak-to-peak amplitude, and ISO 10816-3 severity rating.
 */

export interface VibrationMetrics {
  isSupported: boolean;
  isActive: boolean;
  raw: {
    x: number; // m/s²
    y: number; // m/s²
    z: number; // m/s²
    totalMagnitude: number; // Dynamic magnitude with gravity removed
  };
  peakMagnitude: number;       // Peak acceleration in m/s²
  rmsAcceleration: number;     // RMS acceleration (m/s²)
  velocityRmsMmS: number;      // Estimated RMS vibration velocity in mm/s (ISO standard unit)
  crestFactor: number;         // Peak-to-RMS ratio
  dominantFrequencyHz: number; // Dominant mechanical vibration frequency
  isoSeverity: {
    zone: "Zone A (Good)" | "Zone B (Acceptable)" | "Zone C (Alert)" | "Zone D (Danger)";
    status: "Good" | "Acceptable" | "Alert" | "Danger";
    color: string;
    description: string;
  };
  historyWaveform: { x: number; y: number; z: number; mag: number; timestamp: number }[];
}

export class MobileVibrationAnalyzer {
  public isSupported: boolean = false;
  public isActive: boolean = false;
  private history: { x: number; y: number; z: number; mag: number; timestamp: number }[] = [];
  private maxHistoryLength: number = 100;
  private peakValue: number = 0;
  private lastTimestamp: number = 0;
  private gravityCalibrated: { x: number; y: number; z: number } = { x: 0, y: 0, z: 9.81 };
  private onDataCallback: ((metrics: VibrationMetrics) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.isSupported = "DeviceMotionEvent" in window;
    }
  }

  public static async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const deviceMotionEvent = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof deviceMotionEvent?.requestPermission === "function") {
      try {
        const response = await deviceMotionEvent.requestPermission();
        return response === "granted";
      } catch (err) {
        console.warn("DeviceMotionEvent permission request rejected:", err);
        return false;
      }
    }
    return true; // Non-iOS browsers do not require explicit requestPermission
  }

  public async start(onData: (metrics: VibrationMetrics) => void): Promise<boolean> {
    if (typeof window === "undefined" || !this.isSupported) return false;

    const granted = await MobileVibrationAnalyzer.requestPermission();
    if (!granted) {
      console.warn("Motion sensor permission was not granted.");
      return false;
    }

    this.onDataCallback = onData;
    this.isActive = true;
    this.history = [];
    this.peakValue = 0;

    window.addEventListener("devicemotion", this.handleMotion, { passive: true });
    return true;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    if (!this.isActive) return;

    const now = Date.now();
    let ax = 0;
    let ay = 0;
    let az = 0;

    // Prefer linear acceleration (without gravity) if provided by OS
    if (event.acceleration && event.acceleration.x !== null) {
      ax = event.acceleration.x || 0;
      ay = event.acceleration.y || 0;
      az = event.acceleration.z || 0;
    } else if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.x !== null) {
      // Low-pass filter baseline gravity compensation
      const rawX = event.accelerationIncludingGravity.x || 0;
      const rawY = event.accelerationIncludingGravity.y || 0;
      const rawZ = event.accelerationIncludingGravity.z || 0;

      const alpha = 0.9;
      this.gravityCalibrated.x = alpha * this.gravityCalibrated.x + (1 - alpha) * rawX;
      this.gravityCalibrated.y = alpha * this.gravityCalibrated.y + (1 - alpha) * rawY;
      this.gravityCalibrated.z = alpha * this.gravityCalibrated.z + (1 - alpha) * rawZ;

      ax = rawX - this.gravityCalibrated.x;
      ay = rawY - this.gravityCalibrated.y;
      az = rawZ - this.gravityCalibrated.z;
    }

    const mag = Math.sqrt(ax * ax + ay * ay + az * az);

    if (mag > this.peakValue) {
      this.peakValue = mag;
    } else {
      this.peakValue *= 0.98; // Gradual decay
    }

    this.history.push({
      x: Number(ax.toFixed(3)),
      y: Number(ay.toFixed(3)),
      z: Number(az.toFixed(3)),
      mag: Number(mag.toFixed(3)),
      timestamp: now,
    });

    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    // Calculate RMS Acceleration over recent history buffer
    const recent = this.history.slice(-40);
    const sumSquare = recent.reduce((sum, item) => sum + item.mag * item.mag, 0);
    const rmsAcceleration = recent.length > 0 ? Math.sqrt(sumSquare / recent.length) : 0;

    // Velocity RMS Estimation (mm/s) according to standard mechanical frequency envelope (~25-50Hz avg mechanical center)
    // v_rms ≈ (a_rms / (2 * pi * f)) * 1000
    const assumedCenterFreq = 30.0; // Hz
    const velocityRmsMmS = Number(((rmsAcceleration / (2 * Math.PI * assumedCenterFreq)) * 1000).toFixed(2));

    const crestFactor = rmsAcceleration > 0.01 ? Number((this.peakValue / rmsAcceleration).toFixed(2)) : 1.0;

    // Zero-crossing dominant frequency estimation
    let zeroCrossings = 0;
    for (let i = 1; i < recent.length; i++) {
      if ((recent[i].x >= 0 && recent[i - 1].x < 0) || (recent[i].x < 0 && recent[i - 1].x >= 0)) {
        zeroCrossings++;
      }
    }
    const durationSec = recent.length > 1 ? (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000 : 1;
    const dominantFrequencyHz = durationSec > 0 ? Math.round((zeroCrossings / 2) / durationSec) : 0;

    // ISO 10816-3 Vibration Severity Classification (Medium/Large Machines on Flexible/Rigid Foundation)
    // Zone A: < 1.4 mm/s (Good/New Machine)
    // Zone B: 1.4 - 2.8 mm/s (Acceptable for unrestricted long-term operation)
    // Zone C: 2.8 - 4.5 mm/s (Alert / Unsatisfactory for long-term operation)
    // Zone D: > 4.5 mm/s (Danger / Critical Damage likely)
    let isoSeverity: VibrationMetrics["isoSeverity"];
    if (velocityRmsMmS > 4.5) {
      isoSeverity = {
        zone: "Zone D (Danger)",
        status: "Danger",
        color: "#ef4444",
        description: "Vibration severity exceeds ISO danger threshold. Immediate shutdown or maintenance advised.",
      };
    } else if (velocityRmsMmS > 2.8) {
      isoSeverity = {
        zone: "Zone C (Alert)",
        status: "Alert",
        color: "#f59e0b",
        description: "Unsatisfactory vibration. Inspect alignment, loose mountings, or bearing wear.",
      };
    } else if (velocityRmsMmS > 1.4) {
      isoSeverity = {
        zone: "Zone B (Acceptable)",
        status: "Acceptable",
        color: "#3b82f6",
        description: "Vibration is within acceptable operational envelope for continuous duty.",
      };
    } else {
      isoSeverity = {
        zone: "Zone A (Good)",
        status: "Good",
        color: "#22c55e",
        description: "Smooth baseline operation conforming to newly commissioned equipment specs.",
      };
    }

    const metrics: VibrationMetrics = {
      isSupported: true,
      isActive: true,
      raw: {
        x: Number(ax.toFixed(2)),
        y: Number(ay.toFixed(2)),
        z: Number(az.toFixed(2)),
        totalMagnitude: Number(mag.toFixed(2)),
      },
      peakMagnitude: Number(this.peakValue.toFixed(2)),
      rmsAcceleration: Number(rmsAcceleration.toFixed(2)),
      velocityRmsMmS,
      crestFactor,
      dominantFrequencyHz,
      isoSeverity,
      historyWaveform: [...this.history],
    };

    if (this.onDataCallback) {
      this.onDataCallback(metrics);
    }
  };

  public feedSynthetic(syntheticX: number, syntheticY: number, syntheticZ: number) {
    if (!this.isActive) return;
    const now = Date.now();
    const mag = Math.sqrt(syntheticX * syntheticX + syntheticY * syntheticY + syntheticZ * syntheticZ);

    if (mag > this.peakValue) this.peakValue = mag;
    else this.peakValue *= 0.98;

    this.history.push({
      x: Number(syntheticX.toFixed(3)),
      y: Number(syntheticY.toFixed(3)),
      z: Number(syntheticZ.toFixed(3)),
      mag: Number(mag.toFixed(3)),
      timestamp: now,
    });

    if (this.history.length > this.maxHistoryLength) this.history.shift();

    const recent = this.history.slice(-40);
    const sumSquare = recent.reduce((sum, item) => sum + item.mag * item.mag, 0);
    const rmsAcceleration = recent.length > 0 ? Math.sqrt(sumSquare / recent.length) : 0;
    const assumedCenterFreq = 30.0;
    const velocityRmsMmS = Number(((rmsAcceleration / (2 * Math.PI * assumedCenterFreq)) * 1000).toFixed(2));
    const crestFactor = rmsAcceleration > 0.01 ? Number((this.peakValue / rmsAcceleration).toFixed(2)) : 1.0;

    let isoSeverity: VibrationMetrics["isoSeverity"];
    if (velocityRmsMmS > 4.5) {
      isoSeverity = {
        zone: "Zone D (Danger)",
        status: "Danger",
        color: "#ef4444",
        description: "Vibration severity exceeds ISO danger threshold. High risk of mechanical failure.",
      };
    } else if (velocityRmsMmS > 2.8) {
      isoSeverity = {
        zone: "Zone C (Alert)",
        status: "Alert",
        color: "#f59e0b",
        description: "Elevated vibration. Possible rotor imbalance or bearing degradation.",
      };
    } else if (velocityRmsMmS > 1.4) {
      isoSeverity = {
        zone: "Zone B (Acceptable)",
        status: "Acceptable",
        color: "#3b82f6",
        description: "Vibration within allowable operating envelope.",
      };
    } else {
      isoSeverity = {
        zone: "Zone A (Good)",
        status: "Good",
        color: "#22c55e",
        description: "Smooth vibration baseline. Optimal condition.",
      };
    }

    if (this.onDataCallback) {
      this.onDataCallback({
        isSupported: true,
        isActive: true,
        raw: {
          x: Number(syntheticX.toFixed(2)),
          y: Number(syntheticY.toFixed(2)),
          z: Number(syntheticZ.toFixed(2)),
          totalMagnitude: Number(mag.toFixed(2)),
        },
        peakMagnitude: Number(this.peakValue.toFixed(2)),
        rmsAcceleration: Number(rmsAcceleration.toFixed(2)),
        velocityRmsMmS,
        crestFactor,
        dominantFrequencyHz: 30,
        isoSeverity,
        historyWaveform: [...this.history],
      });
    }
  }

  public stop(): void {
    this.isActive = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("devicemotion", this.handleMotion);
    }
  }
}
