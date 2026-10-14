/**
 * Robust Multi-Strategy Barcode & QR Code Decoder
 * 
 * Supports:
 * - 1D Barcodes: Code 128, Code 39, Code 93, EAN-13, EAN-8, UPC-A, UPC-E, ITF, Codabar
 * - 2D Codes: QR Code, Data Matrix, Aztec
 * 
 * Decoding Pipeline:
 * 1. Native Browser BarcodeDetector API (fastest, hardware-accelerated, Chromium native)
 * 2. Html5Qrcode with all 1D & 2D formats enabled (showImage=false)
 * 3. Canvas Preprocessing (downscales high-res 4K smartphone photos to ~1000px)
 * 4. Canvas 90-degree Rotation Preprocessing (handles vertical orientation)
 */

export interface DecodeResult {
  code: string;
  format?: string;
  strategy: string;
  durationMs: number;
}

/**
 * Report scanner events to Next.js terminal telemetry
 */
export async function logScannerTelemetry(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: any
) {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        source: 'SCANNER',
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    // Silent fallback
  }
}

/**
 * Strategy 1: Native BarcodeDetector (Chrome, Edge, Chromium Android)
 */
async function tryNativeBarcodeDetector(file: File): Promise<{ code: string; format: string } | null> {
  if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
    return null;
  }

  try {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    const supportedFormats: string[] = await BarcodeDetectorClass.getSupportedFormats();
    const detector = new BarcodeDetectorClass({ formats: supportedFormats });

    const imageBitmap = await createImageBitmap(file);
    const results = await detector.detect(imageBitmap);

    if (results && results.length > 0 && results[0].rawValue) {
      return {
        code: results[0].rawValue.trim(),
        format: results[0].format || 'barcode',
      };
    }
  } catch (err: any) {
    console.warn('Native BarcodeDetector pass:', err?.message || err);
  }

  return null;
}

/**
 * Strategy 2: Html5Qrcode with all 1D & 2D formats enabled
 */
async function tryHtml5Qrcode(file: File, containerId = 'qr-reader-viewport-hidden'): Promise<{ code: string; format: string } | null> {
  try {
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

    // Enable all common barcode and 2D formats
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

    const scanner = new Html5Qrcode(containerId, {
      formatsToSupport,
      verbose: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    });

    try {
      // showImage = false prevents attempting to mount hidden DOM image
      const decoded = await scanner.scanFile(file, false);
      if (decoded && decoded.trim()) {
        return {
          code: decoded.trim(),
          format: 'html5-qrcode',
        };
      }
    } finally {
      try {
        scanner.clear();
      } catch (e) {
        // ignore
      }
    }
  } catch (err: any) {
    // Scan failed for this file
  }

  return null;
}

/**
 * Helper: Convert an image file to an offscreen canvas with optional scaling and rotation
 */
function processImageToCanvas(
  file: File,
  maxDimension = 1200,
  rotateDegrees = 0
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Scale down if image is huge (phone camera 12-48MP photos)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      if (rotateDegrees === 90 || rotateDegrees === 270) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      if (rotateDegrees === 90) {
        ctx.translate(height, 0);
        ctx.rotate((90 * Math.PI) / 180);
      } else if (rotateDegrees === 180) {
        ctx.translate(width, height);
        ctx.rotate((180 * Math.PI) / 180);
      } else if (rotateDegrees === 270) {
        ctx.translate(0, width);
        ctx.rotate((270 * Math.PI) / 180);
      }

      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}

/**
 * Master Decode Function: Executes multi-pass detection with telemetry logging
 */
export async function decodeBarcodeFromImage(
  file: File,
  containerId = 'qr-reader-viewport-hidden'
): Promise<DecodeResult> {
  const startTime = performance.now();
  const fileName = file.name || 'uploaded_image';
  const fileSizeKb = Math.round(file.size / 1024);

  // Pass 1: Native BarcodeDetector (instant hardware decoding)
  const nativeRes = await tryNativeBarcodeDetector(file);
  if (nativeRes) {
    const duration = Math.round(performance.now() - startTime);
    logScannerTelemetry('info', `Decoded barcode "${nativeRes.code}" from "${fileName}" (${fileSizeKb}KB) via native BarcodeDetector (${duration}ms)`, {
      file: fileName,
      code: nativeRes.code,
      format: nativeRes.format,
      durationMs: duration,
      strategy: 'NativeBarcodeDetector',
    });
    return {
      code: nativeRes.code,
      format: nativeRes.format,
      strategy: 'Native BarcodeDetector',
      durationMs: duration,
    };
  }

  // Pass 2: Html5Qrcode with all 1D & 2D formats
  const html5Res = await tryHtml5Qrcode(file, containerId);
  if (html5Res) {
    const duration = Math.round(performance.now() - startTime);
    logScannerTelemetry('info', `Decoded barcode "${html5Res.code}" from "${fileName}" (${fileSizeKb}KB) via Html5Qrcode (${duration}ms)`, {
      file: fileName,
      code: html5Res.code,
      durationMs: duration,
      strategy: 'Html5Qrcode',
    });
    return {
      code: html5Res.code,
      format: html5Res.format,
      strategy: 'Html5Qrcode Multi-Format',
      durationMs: duration,
    };
  }

  // Pass 3: Downscale high-resolution image to 1000px and retry
  try {
    const downscaledBlob = await processImageToCanvas(file, 1000, 0);
    if (downscaledBlob) {
      const downscaledFile = new File([downscaledBlob], 'downscaled.png', { type: 'image/png' });

      // Retry native detector on resized
      const nativeRes2 = await tryNativeBarcodeDetector(downscaledFile);
      if (nativeRes2) {
        const duration = Math.round(performance.now() - startTime);
        logScannerTelemetry('info', `Decoded barcode "${nativeRes2.code}" via Canvas Resize Pass (${duration}ms)`);
        return {
          code: nativeRes2.code,
          format: nativeRes2.format,
          strategy: 'Canvas Resized + BarcodeDetector',
          durationMs: duration,
        };
      }

      // Retry html5-qrcode on resized
      const html5Res2 = await tryHtml5Qrcode(downscaledFile, containerId);
      if (html5Res2) {
        const duration = Math.round(performance.now() - startTime);
        logScannerTelemetry('info', `Decoded barcode "${html5Res2.code}" via Canvas Resize Pass (${duration}ms)`);
        return {
          code: html5Res2.code,
          format: html5Res2.format,
          strategy: 'Canvas Resized + Html5Qrcode',
          durationMs: duration,
        };
      }
    }
  } catch (err) {
    console.warn('Canvas resize pass error:', err);
  }

  // Pass 4: Try 90-degree rotation (common for smartphone photos taken vertically)
  try {
    const rotatedBlob = await processImageToCanvas(file, 1000, 90);
    if (rotatedBlob) {
      const rotatedFile = new File([rotatedBlob], 'rotated.png', { type: 'image/png' });
      const nativeRes3 = await tryNativeBarcodeDetector(rotatedFile);
      if (nativeRes3) {
        const duration = Math.round(performance.now() - startTime);
        logScannerTelemetry('info', `Decoded barcode "${nativeRes3.code}" via 90° Rotation Pass (${duration}ms)`);
        return {
          code: nativeRes3.code,
          format: nativeRes3.format,
          strategy: '90° Rotated + BarcodeDetector',
          durationMs: duration,
        };
      }

      const html5Res3 = await tryHtml5Qrcode(rotatedFile, containerId);
      if (html5Res3) {
        const duration = Math.round(performance.now() - startTime);
        logScannerTelemetry('info', `Decoded barcode "${html5Res3.code}" via 90° Rotation Pass (${duration}ms)`);
        return {
          code: html5Res3.code,
          format: html5Res3.format,
          strategy: '90° Rotated + Html5Qrcode',
          durationMs: duration,
        };
      }
    }
  } catch (err) {
    console.warn('Canvas rotation pass error:', err);
  }

  // All automated passes exhausted
  const duration = Math.round(performance.now() - startTime);
  logScannerTelemetry('warn', `No readable barcode/QR detected in "${fileName}" (${fileSizeKb}KB) after 4 passes (${duration}ms)`, {
    file: fileName,
    sizeKb: fileSizeKb,
    durationMs: duration,
  });

  throw new Error(
    'No readable barcode or QR code detected in the uploaded image. Please ensure the barcode is clear, unobstructed, and well-lit, or use manual entry below.'
  );
}
