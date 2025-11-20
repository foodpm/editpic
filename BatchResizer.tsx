import React, { useState, useEffect } from 'react';
import { Download, Settings2, Trash2, Plus, Check, Image as ImageIcon } from 'lucide-react';
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
        if (keepRatio) {
            const ratio = item.originalHeight / item.originalWidth;
            targetH = Math.round(targetW * ratio);
        }
        const blob = await resizeImageToBlob(img, targetW, targetH);
        const namePart = item.file.name.substring(0, item.file.name.lastIndexOf('.'));
        return { name: `${namePart}_${targetW}x${targetH}.jpg`, blob };
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
    <div className="animate-fade-in-up space-y-8">
      {/* Settings Panel */}
      <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-[2rem] border border-white p-8 shadow-lg shadow-indigo-100/20">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 text-white">
                <Settings2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t.common.settings}</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t.common.widthLabel}</label>
                    <input 
                        type="number" 
                        value={width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        placeholder="0"
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-xl font-bold text-slate-800"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t.common.heightLabel}</label>
                    <input 
                        type="number" 
                        value={height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        placeholder="0"
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-xl font-bold text-slate-800"
                    />
                </div>
            </div>
            
            <div className="flex items-end pb-1">
                <label className="flex items-center gap-4 cursor-pointer group select-none bg-white/80 px-6 py-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all w-full lg:w-auto">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${keepRatio ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-slate-50 group-hover:border-indigo-400'}`}>
                        {keepRatio && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden"
                        checked={keepRatio}
                        onChange={(e) => setKeepRatio(e.target.checked)}
                    />
                    <span className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{t.common.maintainRatio}</span>
                </label>
            </div>
        </div>
      </div>

      {/* Content Area */}
      {images.length === 0 ? (
        <UploadZone 
            multiple 
            onFileSelect={handleFilesSelect} 
            label={t.batch.uploadLabel}
            subLabel={t.batch.uploadSubLabel}
        />
      ) : (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 px-2">
                   <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">{images.length}</div>
                   <span className="font-bold text-slate-700">{t.common.selectedImages}</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <label className="cursor-pointer px-4 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 hover:shadow-sm border border-indigo-200/50 flex-1 sm:flex-none justify-center">
                        <Plus className="w-4 h-4" />
                        <span>{t.common.addMore}</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))} />
                    </label>
                    <button
                        onClick={handleBatchDownload}
                        disabled={isProcessing || !width || !height}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none"
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                    <div key={img.id} className="group relative bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <button 
                            onClick={() => removeImage(img.id)}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all z-10 scale-90 group-hover:scale-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden mb-3 relative border border-slate-50">
                            <img src={img.previewUrl} alt="" className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="px-1">
                            <p className="text-sm font-bold text-slate-700 truncate" title={img.file.name}>{img.file.name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5 bg-slate-50 inline-block px-1.5 py-0.5 rounded">{img.originalWidth} × {img.originalHeight}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};