/**
 * Camera-Based Optical Fan & Motor Tachometer
 * Analyzes video stream frames from smartphone camera over a targeted Region of Interest (ROI).
 * Extracts optical luminance variance time-series and applies autocorrelation & Discrete Fourier Transform (DFT)
 * to detect blade pass frequency and compute rotational speed (RPM).
 * Also includes a Virtual Stroboscopic Synchronizer (strobe freeze frequency).
 */

export interface OpticalTachometerMetrics {
  isActive: boolean;
  calculatedRpm: number;        // Rotational speed in Revolutions Per Minute
  frequencyHz: number;          // Blade Pass Frequency (Hz)
  rotationalHz: number;         // Shaft Rotational Frequency (Hz)
  confidence: number;           // 0 - 100% confidence based on periodicity correlation
  bladeCount: number;           // Number of fan / impeller blades
  samplingFps: number;          // Current frame processing rate (fps)
  strobeFrequencyHz: number;    // Virtual Stroboscope Sync Frequency (Hz)
  isStrobeLocked: boolean;      // Whether strobe is locked with RPM
  luminanceHistory: number[];   // Rolling optical intensity signal
  dftSpectrum: { freq: number; power: number }[]; // DFT power spectrum
}

export class OpticalFanTachometer {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  
  public isActive: boolean = false;
  public bladeCount: number = 4;
  public strobeFrequencyHz: number = 30.0;
  public isStrobeActive: boolean = false;
  public hasTorch: boolean = false;
  public isTorchOn: boolean = false;

  private luminanceBuffer: number[] = [];
  private timestampBuffer: number[] = [];
  private readonly maxBufferSize: number = 128; // ~2-4 seconds of rolling video frame telemetry

  private lastFrameTime: number = 0;
  private measuredFps: number = 60;
  private onDataCallback: ((metrics: OpticalTachometerMetrics) => void) | null = null;

  constructor() {}

  public async startCamera(
    videoEl: HTMLVideoElement,
    onData: (metrics: OpticalTachometerMetrics) => void,
    preferredFacingMode: "environment" | "user" = "environment"
  ): Promise<boolean> {
    if (this.isActive) return true;

    try {
      this.videoElement = videoEl;
      this.canvasElement = document.createElement("canvas");
      this.canvasElement.width = 160;
      this.canvasElement.height = 120;
      this.canvasCtx = this.canvasElement.getContext("2d", { willReadFrequently: true });

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: preferredFacingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 60, min: 30 },
        },
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();

      // Check for torch capability on rear camera
      const track = this.mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as unknown as { torch?: boolean }) : {};
      this.hasTorch = Boolean(capabilities?.torch);

      this.onDataCallback = onData;
      this.isActive = true;
      this.luminanceBuffer = [];
      this.timestampBuffer = [];
      this.lastFrameTime = performance.now();

      this.processVideoLoop();
      return true;
    } catch (err) {
      console.error("Optical tachometer camera access error:", err);
      this.stop();
      throw err;
    }
  }

  public async toggleTorch(turnOn?: boolean): Promise<boolean> {
    if (!this.mediaStream || !this.hasTorch) return false;
    const track = this.mediaStream.getVideoTracks()[0];
    const newState = turnOn !== undefined ? turnOn : !this.isTorchOn;

    try {
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: newState }],
      });
      this.isTorchOn = newState;
      return this.isTorchOn;
    } catch (err) {
      console.warn("Could not toggle torch:", err);
      return false;
    }
  }

  public setBladeCount(count: number): void {
    this.bladeCount = Math.max(1, Math.min(24, count));
  }

  public setStrobeFrequency(hz: number): void {
    this.strobeFrequencyHz = Math.max(1, Math.min(300, hz));
  }

  private processVideoLoop = () => {
    if (!this.isActive || !this.videoElement || !this.canvasCtx || !this.canvasElement) {
      return;
    }

    const now = performance.now();
    const dt = now - this.lastFrameTime;
    this.lastFrameTime = now;
    if (dt > 0) {
      this.measuredFps = 0.9 * this.measuredFps + 0.1 * (1000 / dt);
    }

    if (this.videoElement.readyState >= 2) {
      // Draw center ROI (Region of Interest) for optical sampling
      const vw = this.canvasElement.width;
      const vh = this.canvasElement.height;
      this.canvasCtx.drawImage(this.videoElement, 0, 0, vw, vh);

      // Extract average luminance from central 40x40 ROI box
      const roiSize = 40;
      const rx = Math.floor((vw - roiSize) / 2);
      const ry = Math.floor((vh - roiSize) / 2);
      const frameData = this.canvasCtx.getImageData(rx, ry, roiSize, roiSize);
      const pixels = frameData.data;

      let totalLum = 0;
      const pixelCount = pixels.length / 4;
      for (let i = 0; i < pixels.length; i += 4) {
        // Standard Rec. 601 luma formula
        const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        totalLum += lum;
      }
      const avgLum = totalLum / pixelCount;

      this.luminanceBuffer.push(avgLum);
      this.timestampBuffer.push(now);

      if (this.luminanceBuffer.length > this.maxBufferSize) {
        this.luminanceBuffer.shift();
        this.timestampBuffer.shift();
      }

      // Compute Periodic Autocorrelation & Discrete Fourier Transform
      const { calculatedRpm, frequencyHz, rotationalHz, confidence, dftSpectrum } = this.analyzeSignal();

      // Check if virtual strobe frequency matches rotational Hz (within 5%)
      const isStrobeLocked = Math.abs(this.strobeFrequencyHz - rotationalHz) < (rotationalHz * 0.05 + 0.5);

      const metrics: OpticalTachometerMetrics = {
        isActive: true,
        calculatedRpm,
        frequencyHz,
        rotationalHz,
        confidence,
        bladeCount: this.bladeCount,
        samplingFps: Math.round(this.measuredFps),
        strobeFrequencyHz: Number(this.strobeFrequencyHz.toFixed(1)),
        isStrobeLocked,
        luminanceHistory: [...this.luminanceBuffer],
        dftSpectrum,
      };

      if (this.onDataCallback) {
        this.onDataCallback(metrics);
      }
    }

    this.animFrameId = requestAnimationFrame(this.processVideoLoop);
  };

  /**
   * Performs signal processing on rolling optical variance buffer
   */
  private analyzeSignal(): {
    calculatedRpm: number;
    frequencyHz: number;
    rotationalHz: number;
    confidence: number;
    dftSpectrum: { freq: number; power: number }[];
  } {
    const N = this.luminanceBuffer.length;
    if (N < 32) {
      return { calculatedRpm: 0, frequencyHz: 0, rotationalHz: 0, confidence: 0, dftSpectrum: [] };
    }

    // 1. Remove DC mean offset & normalize
    const mean = this.luminanceBuffer.reduce((a, b) => a + b, 0) / N;
    const normalized = this.luminanceBuffer.map((x) => x - mean);

    const totalDurationSec = (this.timestampBuffer[N - 1] - this.timestampBuffer[0]) / 1000;
    const effectiveFs = totalDurationSec > 0 ? (N - 1) / totalDurationSec : 30;

    // 2. Compute Autocorrelation to find fundamental periodicity
    let maxCorr = 0;
    let bestLag = 0;
    const minLag = 2; // Upper frequency bound (Fs / 2)
    const maxLag = Math.floor(N / 2);

    for (let lag = minLag; lag < maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < N - lag; i++) {
        sum += normalized[i] * normalized[i + lag];
      }
      if (sum > maxCorr) {
        maxCorr = sum;
        bestLag = lag;
      }
    }

    // 3. Compute Discrete Fourier Transform (DFT) for frequency spectrum (0 to 60 Hz)
    const dftSpectrum: { freq: number; power: number }[] = [];
    let maxPower = -Infinity;
    let dftPeakFreq = 0;

    const maxFreq = Math.min(60, effectiveFs / 2);
    const freqSteps = 60;
    for (let fi = 1; fi <= freqSteps; fi++) {
      const f = (fi / freqSteps) * maxFreq;
      let real = 0;
      let imag = 0;

      for (let n = 0; n < N; n++) {
        const t = (this.timestampBuffer[n] - this.timestampBuffer[0]) / 1000;
        const angle = 2 * Math.PI * f * t;
        real += normalized[n] * Math.cos(angle);
        imag -= normalized[n] * Math.sin(angle);
      }

      const power = Math.sqrt(real * real + imag * imag);
      dftSpectrum.push({ freq: Number(f.toFixed(1)), power: Number(power.toFixed(1)) });

      if (power > maxPower) {
        maxPower = power;
        dftPeakFreq = f;
      }
    }

    // Determine Blade Pass Frequency from Autocorrelation and DFT
    let bladePassHz = dftPeakFreq;
    if (bestLag > 0) {
      const autocorrHz = effectiveFs / bestLag;
      if (Math.abs(autocorrHz - dftPeakFreq) < 5) {
        bladePassHz = (autocorrHz + dftPeakFreq) / 2;
      }
    }

    // Shaft Rotational Speed: RPM = (Hz * 60) / bladeCount
    const rotationalHz = Number((bladePassHz / this.bladeCount).toFixed(2));
    const calculatedRpm = Math.round(rotationalHz * 60);

    // Estimate confidence based on autocorrelation peak sharpness
    const baselineVariance = normalized.reduce((acc, v) => acc + v * v, 0) + 1e-6;
    const normCorr = Math.min(1.0, maxCorr / baselineVariance);
    const confidence = Math.max(0, Math.min(99, Math.round(normCorr * 100)));

    return {
      calculatedRpm: confidence > 20 ? calculatedRpm : 0,
      frequencyHz: Number(bladePassHz.toFixed(1)),
      rotationalHz,
      confidence,
      dftSpectrum,
    };
  }

  public feedSynthetic(targetRpm: number, bladeCount: number = 4) {
    if (!this.isActive) return;
    this.bladeCount = bladeCount;
    const now = performance.now();
    const rotHz = targetRpm / 60;
    const bpfHz = rotHz * bladeCount;

    // Generate sinusoidal luminance variance + noise
    const t = now / 1000;
    const lum = 128 + 30 * Math.sin(2 * Math.PI * bpfHz * t) + (Math.random() - 0.5) * 5;

    this.luminanceBuffer.push(lum);
    this.timestampBuffer.push(now);
    if (this.luminanceBuffer.length > this.maxBufferSize) {
      this.luminanceBuffer.shift();
      this.timestampBuffer.shift();
    }

    const { calculatedRpm, frequencyHz, rotationalHz, confidence, dftSpectrum } = this.analyzeSignal();
    const isStrobeLocked = Math.abs(this.strobeFrequencyHz - rotationalHz) < 1.0;

    if (this.onDataCallback) {
      this.onDataCallback({
        isActive: true,
        calculatedRpm: calculatedRpm || targetRpm,
        frequencyHz: frequencyHz || Number(bpfHz.toFixed(1)),
        rotationalHz: rotationalHz || Number(rotHz.toFixed(1)),
        confidence: Math.max(85, confidence),
        bladeCount: this.bladeCount,
        samplingFps: 60,
        strobeFrequencyHz: Number(this.strobeFrequencyHz.toFixed(1)),
        isStrobeLocked,
        luminanceHistory: [...this.luminanceBuffer],
        dftSpectrum,
      });
    }
  }

  public stop(): void {
    this.isActive = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.isTorchOn) {
      this.toggleTorch(false).catch(() => {});
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.canvasCtx = null;
    this.canvasElement = null;
  }
}
