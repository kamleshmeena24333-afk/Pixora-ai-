class CanvasStudio {
    constructor(mainCanvasId, maskCanvasId) {
        this.canvas = document.getElementById(mainCanvasId);
        this.ctx = this.canvas.getContext('2d');
        this.maskCanvas = document.getElementById(maskCanvasId);
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.image = null;
        
        this.filters = { brightness: 100, contrast: 100 };
        this.isDrawing = false;
        this.brushSize = 30;

        this.initEvents();
    }

    loadImage(src) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            this.image = img;
            this.resize(img.naturalWidth, img.naturalHeight);
            this.render();
            document.getElementById('emptyDropzone').classList.add('hidden');
            document.getElementById('canvasWrapper').classList.remove('hidden');
        };
        img.src = src;
    }

    resize(width, height) {
        const maxWidth = 1024;
        const maxHeight = 768;
        let scale = Math.min(maxWidth / width, maxHeight / height, 1);

        this.canvas.width = width * scale;
        this.canvas.height = height * scale;
        this.maskCanvas.width = this.canvas.width;
        this.maskCanvas.height = this.canvas.height;
    }

    render() {
        if (!this.image) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%)`;
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }

    setFilter(key, val) {
        this.filters[key] = val;
        this.render();
    }

    initEvents() {
        const startDraw = (e) => {
            this.isDrawing = true;
            this.draw(e);
        };
        const stopDraw = () => {
            this.isDrawing = false;
            this.maskCtx.beginPath();
        };

        this.maskCanvas.addEventListener('mousedown', startDraw);
        this.maskCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.maskCanvas.addEventListener('mouseup', stopDraw);
        this.maskCanvas.addEventListener('mouseleave', stopDraw);
    }

    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.maskCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.maskCtx.lineWidth = this.brushSize;
        this.maskCtx.lineCap = 'round';
        this.maskCtx.strokeStyle = 'rgba(239, 68, 68, 0.7)';

        this.maskCtx.lineTo(x, y);
        this.maskCtx.stroke();
        this.maskCtx.beginPath();
        this.maskCtx.moveTo(x, y);
    }

    exportImage(type = 'image/png') {
        return this.canvas.toDataURL(type);
    }
}
