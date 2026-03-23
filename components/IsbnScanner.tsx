'use client';

import { useEffect, useRef, useState } from 'react';

interface IsbnScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export default function IsbnScanner({ onScan, onClose }: IsbnScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannedRef = useRef(false);
  const stopControlRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unmounted = false;

    async function startScanner() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!unmounted) setReady(true);

        // Usa BarcodeDetector nativo se disponibile (Chrome/Android), altrimenti @zxing/browser
        if ('BarcodeDetector' in window) {
          startNativeDetector();
        } else {
          await startZxingDetector();
        }
      } catch {
        if (!unmounted) setError('Accesso alla fotocamera negato. Controlla le impostazioni del browser.');
      }
    }

    function startNativeDetector() {
      // @ts-expect-error – BarcodeDetector not in TS lib yet
      const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8'] });

      async function detect() {
        if (unmounted || scannedRef.current) return;
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && !scannedRef.current) {
              scannedRef.current = true;
              onScan(barcodes[0].rawValue);
              return;
            }
          } catch {
            // ignora errori singoli frame
          }
        }
        if (!scannedRef.current && !unmounted) requestAnimationFrame(detect);
      }
      detect();
    }

    async function startZxingDetector() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (unmounted || !videoRef.current) return;

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoElement(
          videoRef.current,
          (result, err) => {
            if (unmounted || scannedRef.current) return;
            if (result) {
              scannedRef.current = true;
              controls.stop();
              onScan(result.getText());
            }
            void err; // errori tra frame sono normali
          }
        );
        stopControlRef.current = controls;
      } catch {
        if (!unmounted) setError('Scanner non disponibile su questo dispositivo.');
      }
    }

    startScanner();

    return () => {
      unmounted = true;
      scannedRef.current = true;
      stopControlRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Video */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Mirino */}
        {ready && !error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-72 h-44">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-sm" />
              <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-[#4ade80] opacity-80 animate-pulse" />
            </div>
          </div>
        )}

        {/* Stato di caricamento */}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div className="bg-[#162b1d] px-6 pt-6 pb-10 flex flex-col items-center gap-4">
        {error ? (
          <>
            <span className="material-symbols-outlined text-[#ffdad6] text-4xl">no_photography</span>
            <p className="text-[#ffdad6] text-sm text-center">{error}</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[#95ad9a] text-3xl">barcode_scanner</span>
            <p className="text-white text-sm font-semibold">Inquadra il barcode ISBN</p>
            <p className="text-[#95ad9a] text-xs text-center">
              Punta la fotocamera verso il codice a barre sul retro del libro
            </p>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
