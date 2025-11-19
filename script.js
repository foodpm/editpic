// Tab 切换管理
class TabManager {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.bindEvents();
    }

    bindEvents() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    }

    switchTab(tabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
    }
}

// 插件 Icon 生成器
class IconGenerator {
    constructor() {
        this.originalImage = null;
        this.sizes = [16, 48, 128];
        this.canvases = {};
        this.contexts = {};

        this.initializeElements();
        this.bindEvents();
        this.initializeCanvases();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.iconPreviewSection = document.getElementById('iconPreviewSection');
        this.iconDownloadBtn = document.getElementById('iconDownloadBtn');
        this.iconResetBtn = document.getElementById('iconResetBtn');
    }

    initializeCanvases() {
        this.sizes.forEach(size => {
            this.canvases[size] = document.getElementById(`canvas${size}`);
            this.contexts[size] = this.canvases[size].getContext('2d');
            // 启用图像平滑以获得更好的缩放质量
            this.contexts[size].imageSmoothingEnabled = true;
            this.contexts[size].imageSmoothingQuality = 'high';
        });
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        this.iconDownloadBtn.addEventListener('click', () => this.downloadIcons());
        this.iconResetBtn.addEventListener('click', () => this.reset());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择有效的图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    loadImage(src) {
        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.generateIcons();
            this.iconPreviewSection.style.display = 'block';
            this.iconPreviewSection.scrollIntoView({ behavior: 'smooth' });
        };
        img.src = src;
    }

    generateIcons() {
        this.sizes.forEach(size => {
            const canvas = this.canvases[size];
            const ctx = this.contexts[size];

            // 清除画布
            ctx.clearRect(0, 0, size, size);

            // 绘制图片到指定尺寸
            ctx.drawImage(this.originalImage, 0, 0, size, size);
        });
    }

    async downloadIcons() {
        if (!this.originalImage) {
            alert('请先上传图片！');
            return;
        }

        this.iconDownloadBtn.classList.add('loading');
        this.iconDownloadBtn.disabled = true;
        this.iconDownloadBtn.textContent = '处理中...';

        try {
            const JSZip = await this.loadJSZip();
            const zip = new JSZip();

            // 为每个尺寸生成 PNG 文件
            for (const size of this.sizes) {
                const canvas = this.canvases[size];
                const blob = await new Promise(resolve =>
                    canvas.toBlob(resolve, 'image/png')
                );
                zip.file(`icon${size}.png`, blob);
            }

            // 生成并下载 ZIP 文件
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'plugin_icons.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.iconDownloadBtn.classList.remove('loading');
            this.iconDownloadBtn.disabled = false;
            this.iconDownloadBtn.textContent = '批量下载';

            alert('图标下载成功！');
        } catch (error) {
            console.error('下载失败:', error);
            alert('下载失败，请重试！');

            this.iconDownloadBtn.classList.remove('loading');
            this.iconDownloadBtn.disabled = false;
            this.iconDownloadBtn.textContent = '批量下载';
        }
    }

    loadJSZip() {
        return new Promise((resolve, reject) => {
            if (window.JSZip) {
                resolve(window.JSZip);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    reset() {
        this.iconPreviewSection.style.display = 'none';
        this.fileInput.value = '';
        this.originalImage = null;

        // 清空所有画布
        this.sizes.forEach(size => {
            const ctx = this.contexts[size];
            ctx.clearRect(0, 0, size, size);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 批量图片尺寸调整
class BatchImageResizer {
    constructor() {
        this.images = [];
        this.initializeElements();
        this.bindEvents();
        this.loadSavedSize();
    }

    initializeElements() {
        this.batchUploadArea = document.getElementById('batchUploadArea');
        this.batchFileInput = document.getElementById('batchFileInput');
        this.batchWidthInput = document.getElementById('batchWidth');
        this.batchHeightInput = document.getElementById('batchHeight');
        this.batchKeepRatioCheckbox = document.getElementById('batchKeepRatio');
        this.batchPreview = document.getElementById('batchPreview');
        this.previewGrid = document.getElementById('previewGrid');
        this.imageCount = document.getElementById('imageCount');
        this.batchDownloadBtn = document.getElementById('batchDownloadBtn');
    }

    bindEvents() {
        this.batchUploadArea.addEventListener('click', () => this.batchFileInput.click());
        this.batchFileInput.addEventListener('change', (e) => this.handleBatchFileSelect(e));

        this.batchUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.batchUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.batchUploadArea.addEventListener('drop', (e) => this.handleBatchDrop(e));

        this.batchWidthInput.addEventListener('input', () => {
            this.handleBatchWidthChange();
            this.saveSizeToLocal();
        });
        this.batchHeightInput.addEventListener('input', () => {
            this.handleBatchHeightChange();
            this.saveSizeToLocal();
        });

        this.batchDownloadBtn.addEventListener('click', () => this.batchDownload());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.batchUploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.batchUploadArea.classList.remove('dragover');
    }

    handleBatchDrop(e) {
        e.preventDefault();
        this.batchUploadArea.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        this.processBatchFiles(files);
    }

    handleBatchFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processBatchFiles(files);
    }

    processBatchFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            alert('请选择有效的图片文件！');
            return;
        }

        this.images = [];
        this.previewGrid.innerHTML = '';

        let loadedCount = 0;
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.images.push({
                        name: file.name,
                        image: img,
                        originalWidth: img.width,
                        originalHeight: img.height
                    });

                    this.addPreviewItem(file.name, e.target.result, img.width, img.height);

                    loadedCount++;
                    if (loadedCount === imageFiles.length) {
                        this.updateDisplay();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    addPreviewItem(name, src, width, height) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
            <img src="${src}" alt="${name}">
            <div class="preview-item-name">${name}</div>
            <div class="preview-item-info">${width} × ${height}</div>
        `;
        this.previewGrid.appendChild(item);
    }

    updateDisplay() {
        this.batchPreview.style.display = 'block';
        this.imageCount.textContent = this.images.length;
        this.batchPreview.scrollIntoView({ behavior: 'smooth' });
    }

    handleBatchWidthChange() {
        if (this.batchKeepRatioCheckbox.checked && this.batchWidthInput.value && this.images.length > 0) {
            const firstImage = this.images[0];
            const aspectRatio = firstImage.originalWidth / firstImage.originalHeight;
            const newWidth = parseInt(this.batchWidthInput.value);
            const newHeight = Math.round(newWidth / aspectRatio);
            this.batchHeightInput.value = newHeight;
        }
    }

    handleBatchHeightChange() {
        if (this.batchKeepRatioCheckbox.checked && this.batchHeightInput.value && this.images.length > 0) {
            const firstImage = this.images[0];
            const aspectRatio = firstImage.originalWidth / firstImage.originalHeight;
            const newHeight = parseInt(this.batchHeightInput.value);
            const newWidth = Math.round(newHeight * aspectRatio);
            this.batchWidthInput.value = newWidth;
        }
    }

    saveSizeToLocal() {
        const width = this.batchWidthInput.value;
        const height = this.batchHeightInput.value;
        if (width && height) {
            localStorage.setItem('batchResizeWidth', width);
            localStorage.setItem('batchResizeHeight', height);
        }
    }

    loadSavedSize() {
        const savedWidth = localStorage.getItem('batchResizeWidth');
        const savedHeight = localStorage.getItem('batchResizeHeight');
        if (savedWidth && savedHeight) {
            this.batchWidthInput.value = savedWidth;
            this.batchHeightInput.value = savedHeight;
        }
    }

    async batchDownload() {
        const targetWidth = parseInt(this.batchWidthInput.value);
        const targetHeight = parseInt(this.batchHeightInput.value);

        if (!targetWidth || !targetHeight || targetWidth <= 0 || targetHeight <= 0) {
            alert('请输入有效的目标尺寸！');
            return;
        }

        if (targetWidth > 5000 || targetHeight > 5000) {
            alert('尺寸过大！请输入小于5000像素的尺寸。');
            return;
        }

        if (this.images.length === 0) {
            alert('请先选择图片！');
            return;
        }

        this.batchDownloadBtn.classList.add('loading');
        this.batchDownloadBtn.disabled = true;
        this.batchDownloadBtn.textContent = '处理中...';

        // 使用动态导入 JSZip
        try {
            const JSZip = await this.loadJSZip();
            const zip = new JSZip();

            for (let i = 0; i < this.images.length; i++) {
                const item = this.images[i];
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let finalWidth = targetWidth;
                let finalHeight = targetHeight;

                if (this.batchKeepRatioCheckbox.checked) {
                    const aspectRatio = item.originalWidth / item.originalHeight;
                    finalHeight = Math.round(finalWidth / aspectRatio);
                }

                canvas.width = finalWidth;
                canvas.height = finalHeight;
                ctx.drawImage(item.image, 0, 0, finalWidth, finalHeight);

                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                const fileName = item.name.replace(/\.[^/.]+$/, '') + `_${finalWidth}x${finalHeight}.jpg`;
                zip.file(fileName, blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `resized_images_${targetWidth}x${targetHeight}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.batchDownloadBtn.classList.remove('loading');
            this.batchDownloadBtn.disabled = false;
            this.batchDownloadBtn.textContent = '批量下载';

            alert('批量下载成功！');
        } catch (error) {
            console.error('批量下载失败:', error);
            alert('批量下载失败，请重试！');

            this.batchDownloadBtn.classList.remove('loading');
            this.batchDownloadBtn.disabled = false;
            this.batchDownloadBtn.textContent = '批量下载';
        }
    }

    loadJSZip() {
        return new Promise((resolve, reject) => {
            if (window.JSZip) {
                resolve(window.JSZip);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new TabManager();
    new IconGenerator();
    new BatchImageResizer();
});

// 防止页面默认的拖拽行为
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
