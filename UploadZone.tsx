import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Sparkles } from 'lucide-react';

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
        rounded-[2rem] p-16 text-center transition-all duration-500 ease-out
        border-3 border-dashed
        ${isDragOver 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' 
          : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-slate-100'
        }
      `}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        onChange={handleFileInput}
        accept="image/*"
        multiple={multiple}
      />
      
      <div className="flex flex-col items-center justify-center space-y-6 pointer-events-none relative z-10">
        <div className={`
          relative p-6 rounded-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-3
          ${isDragOver ? 'bg-indigo-500 text-white rotate-0 shadow-lg shadow-indigo-300' : 'bg-white text-indigo-500 shadow-md shadow-slate-100 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-200'}
        `}>
          {multiple ? <FileImage className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
          {isDragOver && <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />}
        </div>
        
        <div className="space-y-2 max-w-xs mx-auto">
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
            {label}
          </h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            {subLabel}
          </p>
        </div>
      </div>
    </div>
  );
};