import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui';
import { X } from 'lucide-react';

export default function CropModal({ 
  imageSrc, 
  onCropComplete, 
  onCancel 
}: { 
  imageSrc: string, 
  onCropComplete: (croppedFile: File) => void,
  onCancel: () => void 
}) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (imgRef.current && completedCrop) {
      try {
        const file = await getCroppedImg(imgRef.current, completedCrop);
        onCropComplete(file);
      } catch (e) {
        console.error("Cropping failed", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 w-full max-w-2xl text-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Crop Image (16:9)</h3>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-auto max-h-[60vh] flex justify-center bg-slate-900/5 dark:bg-black/50 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              alt="Crop target" 
              className="max-h-[50vh] object-contain cursor-crosshair"
              onLoad={(e) => {
                 const { width, height } = e.currentTarget;
                 const targetHeight = width * (9/16);
                 setCrop({
                    unit: '%',
                    width: 100,
                    height: (targetHeight / height) * 100,
                    x: 0,
                    y: (100 - ((targetHeight / height) * 100)) / 2
                 });
              }}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md">Apply Crop</Button>
        </div>
      </div>
    </div>
  );
}
