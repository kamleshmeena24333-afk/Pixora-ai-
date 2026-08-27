document.addEventListener('DOMContentLoaded', () => {
    const studio = new CanvasStudio('mainCanvas', 'maskCanvas');
    const ai = new AIService();
    const auth = new AuthService();

    // DOM Elements
    const tabs = document.querySelectorAll('.tool-tab');
    const panels = document.querySelectorAll('.tab-content');
    const fileInput = document.getElementById('fileInput');
    const emptyDropzone = document.getElementById('emptyDropzone');
    const loader = document.getElementById('studioLoader');

    // Auth Elements
    const btnLoginGoogle = document.getElementById('btnLoginGoogle');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const btnLogout = document.getElementById('btnLogout');

    const updateAuthUI = () => {
        if (auth.isLoggedIn()) {
            btnLoginGoogle.classList.add('hidden');
            userProfile.classList.remove('hidden');
            userProfile.classList.add('flex');
            userAvatar.src = auth.user.avatar;
        } else {
            btnLoginGoogle.classList.remove('hidden');
            userProfile.classList.add('hidden');
            userProfile.classList.remove('flex');
        }
    };

    btnLoginGoogle.addEventListener('click', () => {
        auth.loginWithGoogle(() => updateAuthUI());
    });

    btnLogout.addEventListener('click', () => {
        auth.logout(() => updateAuthUI());
    });

    updateAuthUI();

    // Modal Triggers
    const keyBtn = document.getElementById('btnApiKey');
    const keyModal = document.getElementById('apiKeyModal');
    const apiInputVal = document.getElementById('apiInputVal');
    const btnSaveKey = document.getElementById('btnSaveKey');
    const btnCloseModal = document.getElementById('btnCloseModal');

    const updateKeyStatus = () => {
        const statusText = document.getElementById('keyStatusText');
        if (ai.hasKey()) {
            statusText.innerText = 'Key Active';
            statusText.classList.add('text-green-400');
        } else {
            statusText.innerText = 'Set API Key';
            statusText.classList.remove('text-green-400');
        }
    };

    keyBtn.addEventListener('click', () => {
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

    // Ratio Selector
    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ratio-btn').forEach(b => {
                b.classList.remove('active', 'border-indigo-500', 'bg-indigo-500/20', 'text-indigo-300');
                b.classList.add('border-gray-700', 'bg-gray-800', 'text-gray-400');
            });
            this.classList.add('active', 'border-indigo-500', 'bg-indigo-500/20', 'text-indigo-300');
            this.classList.remove('border-gray-700', 'bg-gray-800', 'text-gray-400');
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

    // Generation Trigger
    document.getElementById('btnRunGenerate').addEventListener('click', async () => {
        let prompt = document.getElementById('genPrompt').value.trim();
        const style = document.getElementById('stylePreset').value;
        if (!prompt) return alert('Kripya pehle image prompt likhein!');
        
        prompt += style;

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

    // Inpainting / Edit Trigger
    document.getElementById('btnClearMask').addEventListener('click', () => studio.clearMask());
    
    document.getElementById('brushSize').addEventListener('input', (e) => {
        studio.brushSize = parseInt(e.target.value);
    });

    document.getElementById('btnRunEdit').addEventListener('click', async () => {
        const prompt = document.getElementById('editPrompt').value.trim();
        if (!prompt) return alert('Kripya AI edit instruction prompt dalein!');

        loader.classList.remove('hidden');
        try {
            const currentImg = studio.exportImage();
            const imageUrl = await ai.editImage(currentImg, prompt);
            studio.loadImage(imageUrl);
        } catch (err) {
            alert(err.message);
        } finally {
            loader.classList.add('hidden');
        }
    });

    // Filter Sliders
    const setupFilter = (id, key, unit) => {
        const input = document.getElementById(id);
        const valSpan = document.getElementById(`val${key}`);
        input.addEventListener('input', (e) => {
            valSpan.innerText = `${e.target.value}${unit}`;
            studio.setFilter(key.toLowerCase(), e.target.value);
        });
    };

    setupFilter('filterBrightness', 'Brightness', '%');
    setupFilter('filterContrast', 'Contrast', '%');
    setupFilter('filterSaturation', 'Saturation', '%');
    setupFilter('filterBlur', 'Blur', 'px');

    document.getElementById('btnResetAdjust').addEventListener('click', () => {
        ['Brightness', 'Contrast', 'Saturation'].forEach(k => {
            document.getElementById(`filter${k}`).value = 100;
            document.getElementById(`val${k}`).innerText = '100%';
            studio.setFilter(k.toLowerCase(), 100);
        });
        document.getElementById('filterBlur').value = 0;
        document.getElementById('valBlur').innerText = '0px';
        studio.setFilter('blur', 0);
    });

    // Export
    document.getElementById('btnExport').addEventListener('click', () => {
        const dataUrl = studio.exportImage();
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `pixora-studio-${Date.now()}.png`;
        a.click();
    });
});
