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

    async generateImage(prompt, ratio = "1:1") {
        const key = this.getApiKey();
        if (!key) {
            throw new Error("API Key missing! Pehle 'Set API Key' button par click karke key dalein.");
        }

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
            throw new Error(err.error || `AI Request Failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
}
