import React, { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  subLabel?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFileSelect, 
  multiple = false,
  label = "Upload Image",
  subLabel = "Drag & drop or click to browse"
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFileSelect(multiple ? files : [files[0]]);
    }
  }, [onFileSelect, multiple]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      onFileSelect(multiple ? files : [files[0]]);
    }
  }, [onFileSelect, multiple]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ease-out
        ${isDragOver 
          ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01] shadow-lg shadow-indigo-100' 
          : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-md'
        }
      `}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleFileInput}
        accept="image/*"
        multiple={multiple}
      />
      
      <div className="flex flex-col items-center justify-center space-y-5 pointer-events-none">
        <div className={`
          p-5 rounded-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3
          ${isDragOver ? 'bg-indigo-100 text-indigo-600 rotate-6' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'}
        `}>
          {multiple ? <FileImage className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
            {label}
          </h3>
          <p className="text-sm text-slate-500">
            {subLabel}
          </p>
        </div>
      </div>
    </div>
  );
};