import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  onCapture: (base64Img: string) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera access is not supported on this browser or device.');
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera Access Error:', err);
        // Fallback to basic user camera if environment fails
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          currentStream = fallbackStream;
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr: any) {
          setError('Unable to access camera. Please allow camera permissions in your browser settings.');
        }
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      onCapture(dataUrl);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-stone-900 flex justify-between items-center border-b border-stone-800">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Camera className="w-5 h-5 text-terracotta-500" />
            <span>Live Craft Camera</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-stone-800 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Container */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-red-400 flex flex-col items-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-xl font-bold transition-all"
              >
                Close Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Grid overlay for framing saree/craft photo */}
              <div className="absolute inset-0 border-2 border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-white/10" />
                <div className="border-r border-white/10" />
                <div />
              </div>
            </>
          )}
        </div>

        {/* Controls Bar */}
        {!error && (
          <div className="p-5 bg-stone-900 flex justify-around items-center border-t border-stone-800">
            <button
              type="button"
              onClick={toggleCamera}
              className="p-3 bg-stone-800 text-stone-300 hover:text-white rounded-full transition-all hover:scale-105 cursor-pointer"
              title="Switch Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={handleSnap}
              disabled={capturing}
              className="w-16 h-16 bg-gradient-to-r from-terracotta-500 to-amber-500 hover:from-terracotta-600 hover:to-amber-600 rounded-full flex items-center justify-center p-1.5 shadow-lg transform active:scale-95 transition-all cursor-pointer"
              title="Snap Photo"
            >
              <div className="w-full h-full border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-full" />
              </div>
            </button>

            <div className="w-11" /> {/* Spacer for symmetry */}
          </div>
        )}
      </div>
    </div>
  );
};
