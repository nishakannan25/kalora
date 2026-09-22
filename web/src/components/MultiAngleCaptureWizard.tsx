import React, { useState } from 'react';
import { Camera, CheckCircle, ArrowRight, RefreshCw, X, Sparkles } from 'lucide-react';

interface MultiAngleCaptureWizardProps {
  onClose: () => void;
  onPhotosCaptured?: (photos: { front: string; detail: string; back: string }) => void;
}

export const MultiAngleCaptureWizard: React.FC<MultiAngleCaptureWizardProps> = ({
  onClose,
  onPhotosCaptured
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [photos, setPhotos] = useState<{ front?: string; detail?: string; back?: string }>({});

  const captureCurrentStep = (stepName: 'front' | 'detail' | 'back') => {
    // Simulate camera capture photo URL
    const mockUrl = `https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400`;
    setPhotos((prev) => ({ ...prev, [stepName]: mockUrl }));
    if (step < 3) {
      setStep((step + 1) as any);
    } else {
      setStep(4);
    }
  };

  const handleFinish = () => {
    if (onPhotosCaptured && photos.front && photos.detail && photos.back) {
      onPhotosCaptured({ front: photos.front, detail: photos.detail, back: photos.back });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2 text-terracotta-700 font-serif font-bold text-lg">
            <Camera className="w-5 h-5 text-gold-500" />
            <span>Multi-Angle Craft Capture Wizard</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between px-2 text-xs font-bold text-stone-500">
          <div className={`flex items-center space-x-1 ${step >= 1 ? 'text-terracotta-600' : ''}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>1. Front</span>
          </div>
          <div className={`flex items-center space-x-1 ${step >= 2 ? 'text-terracotta-600' : ''}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>2. Texture Detail</span>
          </div>
          <div className={`flex items-center space-x-1 ${step >= 3 ? 'text-terracotta-600' : ''}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>3. Back / Label</span>
          </div>
        </div>

        {/* Step 1: Front Photo */}
        {step === 1 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-terracotta-300 rounded-3xl flex flex-col items-center justify-center bg-terracotta-50/50 space-y-2">
              <Camera className="w-10 h-10 text-terracotta-600" />
              <span className="text-xs font-bold text-stone-700">Angle 1: Full Front View</span>
            </div>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Frame the entire product centered cleanly within the view.
            </p>
            <button
              onClick={() => captureCurrentStep('front')}
              className="bg-terracotta-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md"
            >
              📸 Capture Front View
            </button>
          </div>
        )}

        {/* Step 2: Texture Detail Photo */}
        {step === 2 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-amber-300 rounded-3xl flex flex-col items-center justify-center bg-amber-50/50 space-y-2">
              <Sparkles className="w-10 h-10 text-amber-600" />
              <span className="text-xs font-bold text-stone-700">Angle 2: Texture & Weave Detail</span>
            </div>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Hold camera close to capture the fabric weave, wood grain, or pottery glaze texture.
            </p>
            <button
              onClick={() => captureCurrentStep('detail')}
              className="bg-amber-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md"
            >
              📸 Capture Texture Detail
            </button>
          </div>
        )}

        {/* Step 3: Back / Label Photo */}
        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-300 rounded-3xl flex flex-col items-center justify-center bg-emerald-50/50 space-y-2">
              <Camera className="w-10 h-10 text-emerald-600" />
              <span className="text-xs font-bold text-stone-700">Angle 3: Back View & GI Tag</span>
            </div>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Capture the reverse side or craft hallmark/GI tag for authenticity verification.
            </p>
            <button
              onClick={() => captureCurrentStep('back')}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md"
            >
              📸 Capture Back / Hallmark
            </button>
          </div>
        )}

        {/* Step 4: Complete & Review */}
        {step === 4 && (
          <div className="text-center space-y-4 py-2">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-serif font-bold text-xl text-stone-900">3-Angle Capture Completed!</h3>
            <p className="text-xs text-stone-500">Your product photos are optimized for high catalog quality grade A.</p>
            
            <button
              onClick={handleFinish}
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold px-8 py-3 rounded-full text-xs shadow-lg inline-flex items-center space-x-2"
            >
              <span>Apply Photos to Craft Listing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
