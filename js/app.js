document.addEventListener('DOMContentLoaded', () => {
    const studio = new CanvasStudio('mainCanvas', 'maskCanvas');
    const ai = new AIService();

    // Elements
    const tabs = document.querySelectorAll('.tool-tab');
    const panels = document.querySelectorAll('.tab-content');
    const fileInput = document.getElementById('fileInput');
    const emptyDropzone = document.getElementById('emptyDropzone');
    const loader = document.getElementById('studioLoader');

    // API Key Modal Elements
    const keyBtn = document.getElementById('btnApiKey');
    const keyModal = document.getElementById('apiKeyModal');
    const apiInputVal = document.getElementById('apiInputVal');
    const btnSaveKey = document.getElementById('btnSaveKey');
    const btnCloseModal = document.getElementById('btnCloseModal');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active', 'text-indigo-400'));
            tab.classList.add('active', 'text-indigo-400');
            panels.forEach(p => p.classList.add('hidden'));
            document.getElementById(`panel-${tab.dataset.tab}`).classList.remove('hidden');

            const maskCanvas = document.getElementById('maskCanvas');
            maskCanvas.style.pointerEvents = (tab.dataset.tab === 'edit') ? 'auto' : 'none';
        });
    });

    // File Upload Handler
    const handleFiles = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => studio.loadImage(e.target.result);
        reader.readAsDataURL(file);
    };

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files[0]));
    emptyDropzone.addEventListener('dragover', (e) => e.preventDefault());
    emptyDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files[0]);
    });

    // Modal Triggers
    const updateKeyStatus = () => {
        const statusText = document.getElementById('keyStatusText');
        if (ai.hasKey()) {
            statusText.innerText = 'Key Connected';
            statusText.classList.add('text-green-400');
        } else {
            statusText.innerText = 'Set API Key';
            statusText.classList.remove('text-green-400');
        }
    };

    keyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        apiInputVal.value = ai.getApiKey();
        keyModal.classList.remove('hidden');
        keyModal.classList.add('flex');
    });

    btnCloseModal.addEventListener('click', () => {
        keyModal.classList.add('hidden');
        keyModal.classList.remove('flex');
    });

    btnSaveKey.addEventListener('click', () => {
        const token = apiInputVal.value.trim();
        if (token) {
            ai.setApiKey(token);
            updateKeyStatus();
        }
        keyModal.classList.add('hidden');
        keyModal.classList.remove('flex');
    });

    updateKeyStatus();

    // Generation Trigger
    document.getElementById('btnRunGenerate').addEventListener('click', async () => {
        const prompt = document.getElementById('genPrompt').value.trim();
        if (!prompt) return alert('Kripya pehle prompt likhein!');

        loader.classList.remove('hidden');
        try {
            const imageUrl = await ai.generateImage(prompt);
            studio.loadImage(imageUrl);
        } catch (err) {
            alert(err.message);
        } finally {
            loader.classList.add('hidden');
        }
    });

    // Filters Controller
    document.getElementById('filterBrightness').addEventListener('input', (e) => {
        document.getElementById('valBrightness').innerText = `${e.target.value}%`;
        studio.setFilter('brightness', e.target.value);
    });

    document.getElementById('filterContrast').addEventListener('input', (e) => {
        document.getElementById('valContrast').innerText = `${e.target.value}%`;
        studio.setFilter('contrast', e.target.value);
    });

    document.getElementById('btnResetAdjust').addEventListener('click', () => {
        document.getElementById('filterBrightness').value = 100;
        document.getElementById('filterContrast').value = 100;
        document.getElementById('valBrightness').innerText = '100%';
        document.getElementById('valContrast').innerText = '100%';
        studio.setFilter('brightness', 100);
        studio.setFilter('contrast', 100);
    });

    // Download / Export Image
    document.getElementById('btnExport').addEventListener('click', () => {
        const dataUrl = studio.exportImage();
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `pixora-${Date.now()}.png`;
        a.click();
    });
});
            
