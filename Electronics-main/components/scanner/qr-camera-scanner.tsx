'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Barcode,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  HelpCircle,
  Eye,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  FileCheck,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { DEMO_BARCODE_SAMPLES, type DemoBarcodeSample, generateQRCodeDataUrl } from '@/lib/product-assets';
import { decodeBarcodeFromImage } from '@/lib/barcode-decoder';

export interface ScanResult {
  success: boolean;
  code: string;
  productName?: string;
  sku?: string;
  cartQuantity?: number;
  message?: string;
}

interface QrCameraScannerProps {
  onScan: (code: string) => ScanResult | Promise<ScanResult> | void;
  isScanning?: boolean;
  autoAddToCart?: boolean;
  onAutoAddToCartChange?: (enabled: boolean) => void;
}

/**
 * Native Web Audio API sound synthesizer for instant POS scanner feedback
 */
function playScanAudio(type: 'success' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio initialization restrictions
  }
}

export function QrCameraScanner({
  onScan,
  isScanning = false,
  autoAddToCart = true,
  onAutoAddToCartChange,
}: QrCameraScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [scanFlash, setScanFlash] = useState<'success' | 'error' | null>(null);
  const [isReadyToScan, setIsReadyToScan] = useState(true);

  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [decodedQrUrl, setDecodedQrUrl] = useState<string | null>(null);
  const [decodeStrategy, setDecodeStrategy] = useState<string | null>(null);
  const [copiedDecoded, setCopiedDecoded] = useState(false);

  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScannedRef = useRef<{ code: string; timestamp: number } | null>(null);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize html5-qrcode dynamically to support Next.js SSR
  useEffect(() => {
    let mounted = true;

    async function initCameraList() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const devices = await Html5Qrcode.getCameras();
        if (mounted && devices && devices.length > 0) {
          setAvailableCameras(devices);
          // Prefer back/environment camera if available
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      } catch (err: any) {
        // Camera access might be blocked or unavailable
        console.warn('Camera device enumeration:', err?.message || err);
      }
    }

    if (activeTab === 'camera') {
      initCameraList();
    }

    return () => {
      mounted = false;
      stopCameraScanner();
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, [activeTab]);

  // Start live camera scanning
  const startCameraScanner = async (cameraId?: string) => {
    setCameraError(null);
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      // Explicitly support all 1D & 2D formats so real product barcodes work
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.AZTEC,
        Html5QrcodeSupportedFormats.CODABAR,
      ];

      const scanner = new Html5Qrcode('qr-reader-viewport', {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = scanner;

      const deviceIdToUse = cameraId || selectedCameraId;
      const cameraConfig = deviceIdToUse ? { deviceId: { exact: deviceIdToUse } } : { facingMode: 'environment' };

      await scanner.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = Math.min(Math.floor(viewfinderWidth * 0.88), 340);
            const height = Math.min(Math.floor(viewfinderHeight * 0.65), 220);
            return { width: Math.max(width, 220), height: Math.max(height, 140) };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onCameraFrameDecoded(decodedText);
        },
        (errorMessage) => {
          // Frame by frame decode failure (normal when no QR code in view)
        }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        err?.message || 'Unable to access camera. Please allow webcam permissions or use Manual / Image Scan.'
      );
      setCameraActive(false);
    }
  };

  // Stop camera scanner
  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  // Cooldown filter for camera frames to prevent rapid-fire triggers
  const onCameraFrameDecoded = (decodedText: string) => {
    const trimmed = decodedText.trim();
    if (!trimmed) return;

    const now = Date.now();
    const last = lastScannedRef.current;
    if (last) {
      const isSameCode = last.code.toLowerCase() === trimmed.toLowerCase();
      // 1.8s cooldown if same barcode (prevents 15fps flooding, allows intentional rescan)
      // 600ms cooldown if different barcode (allows rapid continuous scanning of different items)
      const requiredCooldown = isSameCode ? 1800 : 600;
      if (now - last.timestamp < requiredCooldown) {
        return;
      }
    }

    lastScannedRef.current = { code: trimmed, timestamp: now };
    setIsReadyToScan(false);

    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }
    cooldownTimeoutRef.current = setTimeout(() => {
      setIsReadyToScan(true);
    }, 1800);

    handleSuccessfulScan(trimmed);
  };

  // Handle successful scan from any source
  const handleSuccessfulScan = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLastScannedCode(trimmed);

    try {
      const result = await Promise.resolve(onScan(trimmed));
      const scanRes: ScanResult =
        result && typeof result === 'object' && 'success' in result
          ? (result as ScanResult)
          : { success: true, code: trimmed };

      setLastScanResult(scanRes);

      if (scanRes.success) {
        playScanAudio('success');
        setScanFlash('success');
      } else {
        playScanAudio('error');
        setScanFlash('error');
      }

      setTimeout(() => {
        setScanFlash(null);
      }, 1200);
    } catch (e) {
      console.error('Scan handling error:', e);
    }
  };

  const resetCooldown = () => {
    lastScannedRef.current = null;
    setIsReadyToScan(true);
  };

  // Handle Image File Upload Scan (Barcode / QR Code image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files?.[0];
    } else if (e.target.files) {
      file = e.target.files[0];
    }
    if (!file) return;

    setIsProcessingFile(true);
    setCameraError(null);
    setDecodedQrUrl(null);
    setDecodeStrategy(null);

    // Create a local thumbnail preview
    const previewUrl = URL.createObjectURL(file);
    setUploadedImagePreview(previewUrl);

    try {
      const result = await decodeBarcodeFromImage(file, 'qr-reader-viewport-hidden');
      if (result && result.code) {
        setDecodeStrategy(result.strategy);
        handleSuccessfulScan(result.code);
        // Automatically generate a scannable QR Code for the decoded barcode
        const qrUrl = await generateQRCodeDataUrl(result.code, { width: 140, margin: 1 });
        setDecodedQrUrl(qrUrl);
      }
    } catch (err: any) {
      console.warn('Scan file error:', err);
      setCameraError(
        err?.message || 'No readable barcode or QR code detected. Please ensure the barcode is clear, or type the code manually below.'
      );
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyDecoded = () => {
    if (!lastScannedCode) return;
    navigator.clipboard.writeText(lastScannedCode);
    setCopiedDecoded(true);
    setTimeout(() => setCopiedDecoded(false), 2000);
  };

  const handleDownloadDecodedQr = () => {
    if (!decodedQrUrl || !lastScannedCode) return;
    const a = document.createElement('a');
    a.href = decodedQrUrl;
    a.download = `qr-${lastScannedCode.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    handleSuccessfulScan(trimmed);
    setManualCode('');
  };

  return (
    <Card className="border border-border/80 shadow-md bg-card/90 backdrop-blur-sm overflow-hidden">
      {/* Offscreen container for file scan with valid dimensions for canvas/decoding */}
      <div
        id="qr-reader-viewport-hidden"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '600px',
          height: '600px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Tabs for scanning modes */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          stopCameraScanner();
          setActiveTab(val as any);
        }}
        className="w-full"
      >
        <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Barcode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">QR & Barcode Scanner</h3>
              <p className="text-[11px] text-muted-foreground">Scan physical barcode with live camera, upload image, or enter SKU</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-Add to Cart Toggle Switch */}
            {onAutoAddToCartChange && (
              <div className="flex items-center gap-1.5 bg-background border border-border/80 px-2.5 py-1 rounded-md shadow-2xs">
                <Switch
                  id="auto-add-cart-toggle"
                  checked={autoAddToCart}
                  onCheckedChange={onAutoAddToCartChange}
                  className="scale-75"
                />
                <label
                  htmlFor="auto-add-cart-toggle"
                  className="text-[11px] font-medium text-foreground cursor-pointer select-none flex items-center gap-1"
                  title="When active, scanning a barcode adds the product directly to your sale cart, or increments quantity on rescan"
                >
                  <ShoppingCart className="h-3 w-3 text-primary" /> Auto-Add to Cart
                </label>
              </div>
            )}

            <TabsList className="bg-muted border border-border h-9 p-1 gap-0.5">
              <TabsTrigger
                value="camera"
                className="text-xs gap-1.5 h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
              >
                <Camera className="h-3.5 w-3.5" /> Live Camera
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="text-xs gap-1.5 h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
              >
                <Upload className="h-3.5 w-3.5" /> Upload Barcode / QR
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="text-xs gap-1.5 h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
              >
                <Barcode className="h-3.5 w-3.5" /> Manual SKU
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* 1. CAMERA TAB */}
        <TabsContent value="camera" className="p-4 m-0 space-y-3">
          {/* Camera viewport with flash indicator */}
          <div
            className={`mx-auto max-w-[420px] rounded-xl overflow-hidden border-2 bg-black shadow-inner relative transition-all duration-300 ${
              scanFlash === 'success'
                ? 'border-emerald-500 ring-4 ring-emerald-500/40'
                : scanFlash === 'error'
                ? 'border-destructive ring-4 ring-destructive/40'
                : 'border-border'
            }`}
            style={{ minHeight: '300px' }}
          >
            {/* Visual Flash Banner overlay */}
            {scanFlash === 'success' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="h-3.5 w-3.5" /> Barcode Scanned!
              </div>
            )}
            {scanFlash === 'error' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                <AlertCircle className="h-3.5 w-3.5" /> Invalid Barcode!
              </div>
            )}

            {/* html5-qrcode mounts inside this div */}
            <div
              id="qr-reader-viewport"
              className="w-full"
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Start scanner prompt shown when not yet active */}
          {!cameraActive && (
            <div className="mx-auto max-w-[420px] flex flex-col items-center justify-center gap-3 py-4 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary animate-pulse">
                <Camera className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Camera Scanner Ready</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Point your camera at any QR code or barcode (EAN, UPC, Code128)
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => startCameraScanner()}
                className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
              >
                <Zap className="h-4 w-4" /> Start Scanner
              </Button>
            </div>
          )}

          {/* Camera controls */}
          <div className="flex items-center justify-between gap-2 max-w-[420px] mx-auto">
            {availableCameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (cameraActive) {
                    startCameraScanner(e.target.value);
                  }
                }}
                className="text-xs bg-muted border border-border rounded-md px-2.5 py-1.5 text-foreground max-w-[200px] truncate"
              >
                {availableCameras.map((cam: { id: string; label: string }) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {cameraActive && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    isReadyToScan ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isReadyToScan ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isReadyToScan ? 'Scanner Ready' : 'Processing...'}
                </span>
              )}

              {cameraActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopCameraScanner}
                  className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Stop Camera
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startCameraScanner()}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reconnect Camera
                </Button>
              )}
            </div>
          </div>

          {cameraError && (
            <div className="flex items-center gap-2 p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20 max-w-[420px] mx-auto">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
        </TabsContent>

        {/* 2. UPLOAD BARCODE / QR TAB */}
        <TabsContent value="upload" className="p-4 m-0 space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {!decodedQrUrl && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 max-w-[420px] mx-auto flex flex-col items-center justify-center space-y-3"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Upload Barcode or QR Code Image</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Drop a product label photo, barcode sticker, or QR screenshot here (PNG, JPG, WebP)
                </p>
              </div>
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs pointer-events-none">
                <ImageIcon className="h-3.5 w-3.5" /> Select Image File
              </Button>
              {isProcessingFile && (
                <p className="text-xs text-primary font-medium animate-pulse flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Decoding barcode & translating to QR...
                </p>
              )}
            </div>
          )}

          {/* When an image has been uploaded & decoded */}
          {decodedQrUrl && lastScannedCode && (
            <div className="max-w-[420px] mx-auto space-y-3">
              <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Barcode Decoded & Converted to QR!</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {decodeStrategy && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-medium">
                        {decodeStrategy}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30 font-bold">
                      Identified
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border">
                  <div className="p-1 bg-white rounded border border-border shadow-xs shrink-0">
                    <img
                      src={decodedQrUrl}
                      alt={`QR Code for ${lastScannedCode}`}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Decoded Content / SKU:
                    </span>
                    <div className="font-mono-code font-bold text-sm text-foreground truncate">
                      {lastScannedCode}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyDecoded}
                        className="h-6 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {copiedDecoded ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                        {copiedDecoded ? 'Copied' : 'Copy'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadDecodedQr}
                        className="h-6 text-[11px] px-2 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Download className="h-3 w-3" /> Download QR
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-muted-foreground">
                    ⚡ Product matching this code has been selected below.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDecodedQrUrl(null);
                      setUploadedImagePreview(null);
                      setCameraError(null);
                      setDecodeStrategy(null);
                    }}
                    className="text-xs h-7 px-2.5"
                  >
                    Scan Another Image
                  </Button>
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="max-w-[420px] mx-auto space-y-3">
              <div className="flex items-start gap-2.5 p-3 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Unable to Auto-Detect Barcode</p>
                  <p className="text-[11px] text-destructive/90">{cameraError}</p>
                </div>
              </div>

              {uploadedImagePreview && (
                <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded preview"
                      className="w-16 h-16 object-cover rounded-lg border border-border shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">Type or Paste Code Directly:</p>
                      <p className="text-[11px] text-muted-foreground">Read the code printed under the barcode in your photo</p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!manualCode.trim()) return;
                      handleSuccessfulScan(manualCode);
                      generateQRCodeDataUrl(manualCode.trim(), { width: 140, margin: 1 }).then((qr) => {
                        setDecodedQrUrl(qr);
                        setDecodeStrategy('Manual Confirmed');
                        setCameraError(null);
                      });
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. SAM-TV-55-C4K"
                      className="text-xs h-8 font-mono-code"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="h-8 text-xs px-3 shrink-0">
                      Apply SKU
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCameraError(null);
                        setUploadedImagePreview(null);
                        fileInputRef.current?.click();
                      }}
                      className="h-8 text-xs px-2 shrink-0"
                    >
                      Retry
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* 3. MANUAL INPUT TAB */}
        <TabsContent value="manual" className="p-4 m-0 space-y-3">
          <form onSubmit={handleManualSubmit} className="max-w-[420px] mx-auto space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5 text-primary" /> Enter Product SKU, Serial No., or IMEI
              </label>
              <div className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. SAM-TV-55-C4K or SAM55KLA003"
                  className="font-mono-code text-sm h-10"
                  autoFocus
                />
                <Button type="submit" className="h-10 px-5 gap-1.5 shrink-0">
                  <Zap className="h-4 w-4" /> Scan
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Hardware barcode scanner guns can scan directly into this active input field.
              </p>
            </div>
          </form>
        </TabsContent>

        {/* Scanned Status Feedback Banner (Valid vs Invalid Barcode) */}
        {lastScanResult ? (
          lastScanResult.success ? (
            /* VALID BARCODE BANNER */
            <div className="bg-emerald-500/10 border-t border-emerald-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-foreground animate-in-fade">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {lastScanResult.productName || 'Product Identified'}
                    </span>
                    <span className="font-mono-code text-[11px] text-muted-foreground">
                      ({lastScanResult.code})
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {lastScanResult.message || (lastScanResult.cartQuantity ? `In Cart: ${lastScanResult.cartQuantity} unit(s)` : 'Product details displayed below')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {typeof lastScanResult.cartQuantity === 'number' && lastScanResult.cartQuantity > 0 ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5">
                    Qty in Cart: {lastScanResult.cartQuantity}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    Identified
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetCooldown}
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                  title="Rescan now"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Rescan
                </Button>
              </div>
            </div>
          ) : (
            /* INVALID BARCODE BANNER */
            <div className="bg-destructive/10 border-t-2 border-destructive/40 px-4 py-2.5 flex items-center justify-between text-xs text-destructive animate-in-fade">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-6 w-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-destructive">Invalid Barcode:</span>
                    <span className="font-mono-code font-bold underline bg-destructive/10 px-1 rounded">
                      {lastScanResult.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-destructive/90 mt-0.5">
                    {lastScanResult.message || 'Not registered to any product in inventory.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider">
                  Invalid Barcode
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetCooldown}
                  className="h-6 px-2 text-[10px] border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                </Button>
              </div>
            </div>
          )
        ) : lastScannedCode ? (
          <div className="bg-muted/40 border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              <span>Last Scanned:</span>
              <span className="font-mono-code font-semibold">{lastScannedCode}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetCooldown}
              className="h-6 px-2 text-[10px]"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Rescan
            </Button>
          </div>
        ) : null}

        {/* Quick-Demo Sample Barcode Chips */}
        <div className="border-t border-border/60 bg-muted/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Quick-Scan Demo Barcodes (1-Click Test)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DEMO_BARCODE_SAMPLES.map((sample) => {
              const isInvalid = sample.code === 'INVALID-BARCODE-999';
              return (
                <button
                  key={sample.code}
                  onClick={() => handleSuccessfulScan(sample.code)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all text-left shadow-xs ${
                    isInvalid
                      ? 'bg-destructive/10 border-destructive/40 hover:bg-destructive/20 text-destructive'
                      : 'bg-background border-border/80 hover:border-primary/60 hover:bg-primary/5 text-foreground'
                  }`}
                  title={`Click to simulate scanning: ${sample.code}`}
                >
                  <Barcode className="h-3 w-3 shrink-0 transition-colors" />
                  <span className="font-mono-code text-[11px] font-semibold">{sample.code}</span>
                  <span className="text-[10px] opacity-75">({sample.badge})</span>
                </button>
              );
            })}
          </div>
        </div>
      </Tabs>
    </Card>
  );
}

