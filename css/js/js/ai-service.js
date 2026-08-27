class AIService {
    constructor() {
        this.storageKey = 'pixora_api_token';
    }

    getApiKey() {
        return localStorage.getItem(this.storageKey) || '';
    }

    setApiKey(key) {
        localStorage.setItem(this.storageKey, key.trim());
    }

    hasKey() {
        return !!this.getApiKey();
    }

    async generateImage(prompt) {
        const key = this.getApiKey();
        if (!key) throw new Error("Please set your Hugging Face API key first!");

        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: {
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `AI error: ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    async editImage(baseImageBlob, prompt) {
        const key = this.getApiKey();
        if (!key) throw new Error("Please set your Hugging Face API key first!");

        // InstructPix2Pix pipeline
        const response = await fetch(
            "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
            {
                headers: {
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    image: baseImageBlob
                }),
            }
        );

        if (!response.ok) {
            // Fallback to SD-Inpaint or notify
            return await this.generateImage(prompt);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
}
