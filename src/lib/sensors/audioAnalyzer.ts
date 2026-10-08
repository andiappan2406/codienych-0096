/**
 * Web Audio API Acoustic Frequency & Machine Sound Analyzer
 * Extracts real-time FFT frequency spectrum, peak harmonics, RMS decibels,
 * and high-frequency bearing noise signatures from device microphone.
 */

export interface AudioAnalysisMetrics {
  isListening: boolean;
  peakFrequency: number;       // Fundamental frequency in Hz
  harmonics: number[];         // 1X, 2X, 3X harmonic peaks in Hz
  decibels: number;            // dB SPL approximation (-100 to 0)
  spectralCentroid: number;    // Center of gravity of spectrum in Hz
  bearingBandEnergy: number;   // High-frequency energy (2.5kHz - 5kHz) 0-100
  lowFreqEnergy: number;       // Low-frequency rumble (20Hz - 200Hz) 0-100
  cavitationNoiseRatio: number;// Ratio indicating fluid turbulence/cavitation
  acousticSeverity: "NORMAL" | "ELEVATED" | "CRITICAL";
  detectedAcousticFault: string;
}

export class MachineAudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private fftDataArray: Uint8Array | null = null;
  private floatFftDataArray: Float32Array | null = null;
  private onDataCallback: ((metrics: AudioAnalysisMetrics, rawFft: Uint8Array) => void) | null = null;

  public isRunning: boolean = false;

  constructor() {}

  public async startListening(
    onData: (metrics: AudioAnalysisMetrics, rawFft: Uint8Array) => void
  ): Promise<boolean> {
    if (this.isRunning) return true;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
      this.sourceNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.fftDataArray = new Uint8Array(bufferLength);
      this.floatFftDataArray = new Float32Array(bufferLength);
      this.onDataCallback = onData;
      this.isRunning = true;

      this.processLoop();
      return true;
    } catch (err) {
      console.error("Failed to start audio analysis:", err);
      this.stop();
      throw err;
    }
  }

  private processLoop = () => {
    if (!this.isRunning || !this.analyser || !this.fftDataArray || !this.floatFftDataArray || !this.audioCtx) {
      return;
    }

    this.analyser.getByteFrequencyData(this.fftDataArray as any);
    this.analyser.getFloatFrequencyData(this.floatFftDataArray as any);

    const sampleRate = this.audioCtx.sampleRate;
    const binCount = this.analyser.frequencyBinCount;
    const nyquist = sampleRate / 2;
    const hzPerBin = nyquist / binCount;

    // 1. Calculate Peak Frequency
    let maxVal = -Infinity;
    let peakBin = 0;
    let sumVal = 0;
    let weightedSum = 0;

    // Energy bands
    let lowFreqEnergySum = 0;
    let lowFreqCount = 0;
    let bearingBandEnergySum = 0;
    let bearingBandCount = 0;

    for (let i = 2; i < binCount; i++) { // Skip DC offset (bins 0-1)
      const val = this.fftDataArray[i];
      const freq = i * hzPerBin;

      sumVal += val;
      weightedSum += val * freq;

      if (val > maxVal) {
        maxVal = val;
        peakBin = i;
      }

      // Low frequency rumble (20Hz - 200Hz)
      if (freq >= 20 && freq <= 200) {
        lowFreqEnergySum += val;
        lowFreqCount++;
      }

      // Bearing high-frequency fault band (2.5kHz - 6kHz)
      if (freq >= 2500 && freq <= 6000) {
        bearingBandEnergySum += val;
        bearingBandCount++;
      }
    }

    const peakFrequency = Math.round(peakBin * hzPerBin);
    const spectralCentroid = sumVal > 0 ? Math.round(weightedSum / sumVal) : 0;
    const lowFreqEnergy = lowFreqCount > 0 ? Math.min(100, Math.round((lowFreqEnergySum / lowFreqCount / 255) * 100)) : 0;
    const bearingBandEnergy = bearingBandCount > 0 ? Math.min(100, Math.round((bearingBandEnergySum / bearingBandCount / 255) * 100)) : 0;

    // Approximate RMS Decibels from float frequency data
    let dbSum = 0;
    for (let i = 0; i < binCount; i++) {
      const db = this.floatFftDataArray[i];
      if (db > -100) {
        dbSum += Math.pow(10, db / 10);
      }
    }
    const decibels = Math.max(-90, Math.min(0, Math.round(10 * Math.log10(dbSum / binCount + 1e-12))));

    // Detect 1X, 2X, 3X Harmonics
    const harmonics: number[] = [];
    if (peakFrequency > 10) {
      harmonics.push(peakFrequency);
      const h2 = peakFrequency * 2;
      const h3 = peakFrequency * 3;
      if (h2 < nyquist) harmonics.push(h2);
      if (h3 < nyquist) harmonics.push(h3);
    }

    // Acoustic Cavitation / Fluid Turbulence Ratio
    const cavitationNoiseRatio = Math.min(1.0, Number((bearingBandEnergy / (lowFreqEnergy + 1e-3)).toFixed(2)));

    // Acoustic Severity & Fault Classification
    let acousticSeverity: "NORMAL" | "ELEVATED" | "CRITICAL" = "NORMAL";
    let detectedAcousticFault = "Acoustic spectrum within nominal machine profile";

    if (bearingBandEnergy > 60 || decibels > -15) {
      acousticSeverity = "CRITICAL";
      if (bearingBandEnergy > 60 && lowFreqEnergy > 40) {
        detectedAcousticFault = "Severe High-Frequency Bearing Friction & Mechanical Chattering";
      } else if (bearingBandEnergy > 60) {
        detectedAcousticFault = "Bearing Outer Race Deterioration (Ultrasonic Emission Spike)";
      } else {
        detectedAcousticFault = "Excessive Acoustic Load & Severe Unbalance Noise";
      }
    } else if (bearingBandEnergy > 35 || lowFreqEnergy > 55 || cavitationNoiseRatio > 0.7) {
      acousticSeverity = "ELEVATED";
      if (cavitationNoiseRatio > 0.7 && lowFreqEnergy > 30) {
        detectedAcousticFault = "Hydraulic Turbulence / Incipient Pump Cavitation Noise";
      } else if (lowFreqEnergy > 55) {
        detectedAcousticFault = "Structural Resonant Hum & Motor 2X Slip Harmonics";
      } else {
        detectedAcousticFault = "Incipient Bearing Lubrication Deficit";
      }
    }

    const metrics: AudioAnalysisMetrics = {
      isListening: true,
      peakFrequency,
      harmonics,
      decibels,
      spectralCentroid,
      bearingBandEnergy,
      lowFreqEnergy,
      cavitationNoiseRatio,
      acousticSeverity,
      detectedAcousticFault,
    };

    if (this.onDataCallback) {
      this.onDataCallback(metrics, this.fftDataArray);
    }

    this.animationFrameId = requestAnimationFrame(this.processLoop);
  };

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}
