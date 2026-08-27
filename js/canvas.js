class CanvasStudio {
    constructor(mainCanvasId, maskCanvasId) {
        this.canvas = document.getElementById(mainCanvasId);
        this.ctx = this.canvas.getContext('2d');
        this.maskCanvas = document.getElementById(maskCanvasId);
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.image = null;
        
        this.filters = { brightness: 100, contrast: 100, saturation: 100, blur: 0 };
        this.isDrawing = false;
        this.brushSize = 25;

        this.initEvents();
    }

    loadImage(src) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            this.image = img;
            this.resize(img.naturalWidth, img.naturalHeight);
            this.render();
            this.clearMask();
            document.getElementById('emptyDropzone').classList.add('hidden');
            document.getElementById('canvasWrapper').classList.remove('hidden');
        };
        img.src = src;
    }

    resize(width, height) {
        const maxWidth = 900;
        const maxHeight = 600;
        let scale = Math.min(maxWidth / width, maxHeight / height, 1);

        this.canvas.width = Math.round(width * scale);
        this.canvas.height = Math.round(height * scale);
        this.maskCanvas.width = this.canvas.width;
        this.maskCanvas.height = this.canvas.height;
    }

    render() {
        if (!this.image) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.filter = `brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%) saturate(${this.filters.saturation}%) blur(${this.filters.blur}px)`;
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }

    setFilter(key, val) {
        this.filters[key] = val;
        this.render();
    }

    clearMask() {
        this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    }

    initEvents() {
        const getPos = (e) => {
            const rect = this.maskCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (this.maskCanvas.width / rect.width),
                y: (clientY - rect.top) * (this.maskCanvas.height / rect.height)
            };
        };

        const startDraw = (e) => {
            this.isDrawing = true;
            const pos = getPos(e);
            this.maskCtx.beginPath();
            this.maskCtx.moveTo(pos.x, pos.y);
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

        // Mobile Touch Support
        this.maskCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
        this.maskCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e); }, { passive: false });
        this.maskCanvas.addEventListener('touchend', stopDraw);
    }

    draw(e) {
        if (!this.isDrawing) return;
        const rect = this.maskCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left) * (this.maskCanvas.width / rect.width);
        const y = (clientY - rect.top) * (this.maskCanvas.height / rect.height);

        this.maskCtx.lineWidth = this.brushSize;
        this.maskCtx.lineCap = 'round';
        this.maskCtx.lineJoin = 'round';
        this.maskCtx.strokeStyle = 'rgba(239, 68, 68, 0.85)';

        this.maskCtx.lineTo(x, y);
        this.maskCtx.stroke();
    }

    exportImage(type = 'image/png') {
        return this.canvas.toDataURL(type);
    }
}
