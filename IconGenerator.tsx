import React, { useState, useCallback } from 'react';
import { Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
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
      <div className="animate-fade-in">
        <UploadZone 
          onFileSelect={(files) => processImage(files[0])}
          label={t.iconGen.label}
          subLabel={t.iconGen.subLabel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{t.iconGen.previewTitle}</h3>
            <p className="text-sm text-slate-500">{t.iconGen.previewDesc}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={reset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            {t.common.reset}
          </button>
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {previews.map((preview) => (
          <div key={preview.size} className="group relative bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex-1 flex items-center justify-center min-h-[160px] w-full bg-[url('https://bg.siteorigin.com/blog/wp-content/uploads/2015/06/p6.png')] bg-slate-50 rounded-xl mb-4 overflow-hidden">
               <img 
                 src={preview.url} 
                 alt={`${preview.size}x${preview.size}`}
                 style={{ width: preview.size, height: preview.size }}
                 className="image-pixelated shadow-lg"
               />
            </div>
            <div className="text-center w-full">
              <div className="text-lg font-bold text-slate-800 tabular-nums">{preview.size} × {preview.size}</div>
              <div className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 py-1 px-2 rounded-full inline-block">icon{preview.size}.png</div>
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