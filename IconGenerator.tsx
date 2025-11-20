import React, { useState, useCallback } from 'react';
import { Download, RefreshCw, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { readFileAsDataURL, loadImage, resizeImageToBlob, resizeImageToDataURL, generateZip, downloadBlob } from './imageUtils';
import { useLanguage } from './LanguageContext';

export const IconGenerator: React.FC = () => {
  const { t } = useLanguage();
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(async (file: File) => {
    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);
      setOriginalImage(img);

      const sizes = [16, 48, 128];
      const newPreviews = sizes.map(size => ({
        size,
        url: resizeImageToDataURL(img, size, size)
      }));
      setPreviews(newPreviews);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try another file.");
    }
  }, []);

  const handleDownload = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const files = await Promise.all(previews.map(async (preview) => {
        const blob = await resizeImageToBlob(originalImage, preview.size, preview.size);
        return { name: `icon${preview.size}.png`, blob };
      }));
      
      const zipBlob = await generateZip(files);
      downloadBlob(zipBlob, 'plugin_icons.zip');
    } catch (error) {
      console.error(error);
      alert("Failed to create zip file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setPreviews([]);
  };

  if (!originalImage) {
    return (
      <div className="animate-fade-in-up">
        <UploadZone 
          onFileSelect={(files) => processImage(files[0])}
          label={t.iconGen.label}
          subLabel={t.iconGen.subLabel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/50 rounded-3xl p-6 border border-white/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-600 shadow-inner">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{t.iconGen.previewTitle}</h3>
            <p className="text-slate-500 font-medium">{t.iconGen.previewDesc}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={reset}
            className="flex-1 md:flex-none px-5 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow"
          >
            {t.common.reset}
          </button>
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200 hover:translate-y-[-2px] hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:transform-none"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t.common.downloadAll}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {previews.map((preview) => (
          <div key={preview.size} className="group relative bg-white rounded-[2rem] p-2 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 border border-slate-100">
             <div className="bg-slate-50 rounded-[1.5rem] aspect-square flex items-center justify-center relative overflow-hidden border border-slate-100 group-hover:border-indigo-100 transition-colors">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <img 
                 src={preview.url} 
                 alt={`${preview.size}x${preview.size}`}
                 style={{ width: preview.size, height: preview.size }}
                 className="image-pixelated shadow-xl group-hover:scale-110 transition-transform duration-500 ease-out"
               />
             </div>
             <div className="p-4 text-center">
                <div className="text-lg font-bold text-slate-800">{preview.size} x {preview.size}</div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">icon{preview.size}.png</div>
             </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .image-pixelated {
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
};