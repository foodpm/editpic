import React, { useState, useEffect, useCallback } from 'react';
import { Download, Settings2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { readFileAsDataURL, loadImage, resizeImageToBlob, generateZip, downloadBlob } from './imageUtils';
import { useLanguage } from './LanguageContext';

interface ImageItem {
  id: string;
  file: File;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
}

export const BatchResizer: React.FC = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [keepRatio, setKeepRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedW = localStorage.getItem('batchWidth');
    const savedH = localStorage.getItem('batchHeight');
    if (savedW) setWidth(parseInt(savedW));
    if (savedH) setHeight(parseInt(savedH));
  }, []);

  const handleFilesSelect = async (files: File[]) => {
    const newImages: ImageItem[] = [];
    
    for (const file of files) {
      try {
        const url = await readFileAsDataURL(file);
        const img = await loadImage(url);
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          originalWidth: img.width,
          originalHeight: img.height,
          previewUrl: url
        });
      } catch (e) {
        console.error("Skipped invalid image", file.name);
      }
    }
    
    // Auto-set dimensions based on first image if not set
    if (newImages.length > 0 && width === '' && height === '') {
       setWidth(newImages[0].originalWidth);
       setHeight(newImages[0].originalHeight);
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const handleDimensionChange = (type: 'width' | 'height', value: string) => {
    const val = parseInt(value);
    
    if (isNaN(val)) {
        if (type === 'width') setWidth('');
        if (type === 'height') setHeight('');
        return;
    }

    if (type === 'width') {
        setWidth(val);
        localStorage.setItem('batchWidth', val.toString());
        if (keepRatio && images.length > 0 && height !== '') {
            const ratio = images[0].originalHeight / images[0].originalWidth;
            setHeight(Math.round(val * ratio));
        }
    } else {
        setHeight(val);
        localStorage.setItem('batchHeight', val.toString());
        if (keepRatio && images.length > 0 && width !== '') {
            const ratio = images[0].originalWidth / images[0].originalHeight;
            setWidth(Math.round(val * ratio));
        }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleBatchDownload = async () => {
    const w = Number(width);
    const h = Number(height);

    if (!w || !h || w <= 0 || h <= 0) {
      alert(t.batch.invalidDimensions);
      return;
    }

    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      const processedFiles = await Promise.all(images.map(async (item) => {
        const img = await loadImage(item.previewUrl);
        
        let targetW = w;
        let targetH = h;

        // Recalculate per image if keeping ratio to avoid distortion
        if (keepRatio) {
            const ratio = item.originalHeight / item.originalWidth;
            targetH = Math.round(targetW * ratio);
        }

        const blob = await resizeImageToBlob(img, targetW, targetH);
        const namePart = item.file.name.substring(0, item.file.name.lastIndexOf('.'));
        return {
            name: `${namePart}_${targetW}x${targetH}.jpg`,
            blob
        };
      }));

      const zip = await generateZip(processedFiles);
      downloadBlob(zip, `batch_resized_${w}x${keepRatio ? 'auto' : h}.zip`);
    } catch (error) {
      console.error(error);
      alert(t.batch.processingFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h3>{t.common.settings}</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.common.widthLabel}</label>
                    <input 
                        type="number" 
                        value={width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        placeholder={t.batch.widthPlaceholder}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.common.heightLabel}</label>
                    <input 
                        type="number" 
                        value={height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        placeholder={t.batch.widthPlaceholder}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono"
                    />
                </div>
            </div>
            
            <div className="flex items-center h-[46px]">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${keepRatio ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                        {keepRatio && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden"
                        checked={keepRatio}
                        onChange={(e) => setKeepRatio(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{t.common.maintainRatio}</span>
                </label>
            </div>
        </div>
      </div>

      {/* Upload & List */}
      {images.length === 0 ? (
        <UploadZone 
            multiple 
            onFileSelect={handleFilesSelect} 
            label={t.batch.uploadLabel}
            subLabel={t.batch.uploadSubLabel}
        />
      ) : (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-slate-600 font-medium">{t.common.selectedImages} <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-bold text-slate-800">{images.length}</span></h3>
                <div className="flex gap-3">
                    <label className="cursor-pointer px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t.common.addMore}
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))} />
                    </label>
                    <button
                        onClick={handleBatchDownload}
                        disabled={isProcessing || !width || !height}
                        className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isProcessing ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                        <Download className="w-4 h-4" />
                        )}
                        {t.batch.resizeAndDownload}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                    <div key={img.id} className="group relative bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <button 
                            onClick={() => removeImage(img.id)}
                            className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all z-10"
                            title={t.common.remove}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden mb-3 relative">
                            <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-700 truncate" title={img.file.name}>{img.file.name}</p>
                            <p className="text-[10px] text-slate-400">{img.originalWidth} × {img.originalHeight}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};