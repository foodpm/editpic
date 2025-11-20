import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'zh';

const translations = {
  en: {
    title: "Image Resizer Pro",
    subtitle: "Professional tools to generate plugin icons or batch resize images while maintaining quality.",
    tabs: {
      icon: "Icon Generator",
      batch: "Batch Resize"
    },
    common: {
      upload: "Upload Image",
      dragDrop: "Drag & drop or click to browse",
      processing: "Processing...",
      download: "Download",
      downloadAll: "Download All",
      reset: "Reset",
      width: "Width",
      height: "Height",
      pixels: "px",
      remove: "Remove",
      addMore: "Add More",
      footer: "Processed locally in your browser.",
      settings: "Output Settings",
      maintainRatio: "Maintain Aspect Ratio",
      selectedImages: "Selected Images",
      widthLabel: "Width (PX)",
      heightLabel: "Height (PX)"
    },
    iconGen: {
      label: "Upload Icon Source",
      subLabel: "Generates 16x16, 48x48, and 128x128 PNGs",
      previewTitle: "Icon Preview",
      previewDesc: "Ready for download"
    },
    batch: {
      uploadLabel: "Batch Upload",
      uploadSubLabel: "Drop multiple images here (JPG, PNG, GIF)",
      widthPlaceholder: "e.g. 1024",
      resizeAndDownload: "Resize & Download",
      invalidDimensions: "Please enter valid dimensions.",
      processingFailed: "Batch processing failed."
    }
  },
  zh: {
    title: "图片处理大师",
    subtitle: "专业的插件图标生成与批量图片缩放工具，保持高质量输出。",
    tabs: {
      icon: "图标生成器",
      batch: "批量缩放"
    },
    common: {
      upload: "上传图片",
      dragDrop: "拖拽或点击选择文件",
      processing: "处理中...",
      download: "下载",
      downloadAll: "全部下载",
      reset: "重置",
      width: "宽度",
      height: "高度",
      pixels: "像素",
      remove: "移除",
      addMore: "添加更多",
      footer: "所有图片仅在本地浏览器处理，安全高效。",
      settings: "输出设置",
      maintainRatio: "保持纵横比",
      selectedImages: "已选图片",
      widthLabel: "宽度 (PX)",
      heightLabel: "高度 (PX)"
    },
    iconGen: {
      label: "上传图标原图",
      subLabel: "自动生成 16x16, 48x48, 128x128 PNG 图标",
      previewTitle: "图标预览",
      previewDesc: "准备下载"
    },
    batch: {
      uploadLabel: "批量上传",
      uploadSubLabel: "拖拽多张图片到此处 (JPG, PNG, GIF)",
      widthPlaceholder: "例如 1024",
      resizeAndDownload: "缩放并下载",
      invalidDimensions: "请输入有效的尺寸数值。",
      processingFailed: "批量处理失败。"
    }
  }
};

type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      setLanguage('zh');
    }
  }, []);

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};