
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { processImageOCR } from '../hooks/useRecipes';
import { toast } from 'sonner';

interface OCRScannerProps {
  onScanComplete: (data: any) => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onScanComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file to get URL
      const formData = new FormData();
      formData.append('file', file);
      
      // For demo, we'll just use the local file as URL via object URL
      const imageUrl = URL.createObjectURL(file);
      
      // Process with OCR
      const result = await processImageOCR(imageUrl);
      onScanComplete(result);
      toast.success('Recipe extracted successfully!');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to extract recipe from image');
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      } else {
        toast.error('Camera not supported on this device');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && isCameraActive) {
      try {
        setIsProcessing(true);
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        const imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else throw new Error('Could not create image blob');
          }, 'image/jpeg', 0.95);
        });
        
        // Create preview
        setPreviewImage(canvas.toDataURL('image/jpeg'));
        
        // Stop camera after capture
        stopCamera();
        
        // Process with OCR using object URL
        const imageUrl = URL.createObjectURL(imageBlob);
        const result = await processImageOCR(imageUrl);
        onScanComplete(result);
        toast.success('Recipe extracted successfully!');
      } catch (error) {
        console.error('Capture error:', error);
        toast.error('Failed to process captured image');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const clearPreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={toggleCamera}
          className="p-3 bg-carnivore-muted rounded-lg text-carnivore-secondary hover:text-carnivore-primary transition-colors flex items-center"
          disabled={isProcessing}
        >
          <Camera className="h-5 w-5 mr-2" />
          {isCameraActive ? 'Stop Camera' : 'Take Photo'}
        </button>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-carnivore-muted rounded-lg text-carnivore-secondary hover:text-carnivore-primary transition-colors flex items-center"
          disabled={isProcessing || isCameraActive}
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Image
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      {isCameraActive && (
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            autoPlay 
            playsInline 
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isProcessing}
              className="p-3 bg-white rounded-full text-carnivore-primary hover:bg-carnivore-primary hover:text-white transition-colors"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
      
      {previewImage && (
        <div className="relative w-full h-64 bg-carnivore-muted rounded-lg">
          <img 
            src={previewImage} 
            alt="Preview" 
            className="w-full h-full object-contain rounded-lg" 
          />
          <button
            type="button"
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-carnivore-background/80 rounded-full text-carnivore-primary hover:bg-carnivore-background transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {isProcessing && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 text-carnivore-primary animate-spin" />
          <span className="ml-2 text-carnivore-secondary">Processing image...</span>
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
