class AuthService {
    constructor() {
        this.storageKey = 'pixora_user_session';
        this.user = this.getUser();
    }

    getUser() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : null;
    }

    loginWithGoogle(callback) {
        // Mock / Client OAuth popup for seamless Sign-In
        const name = prompt("Enter your Name or Gmail (or connect via Google Client ID):", this.user?.name || "Kamlesh Meena");
        if (name) {
            const userObj = {
                name: name,
                email: name.includes('@') ? name : `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
            };
            localStorage.setItem(this.storageKey, JSON.stringify(userObj));
            this.user = userObj;
            if (callback) callback(userObj);
        }
    }

    logout(callback) {
        localStorage.removeItem(this.storageKey);
        this.user = null;
        if (callback) callback();
    }

    isLoggedIn() {
        return !!this.user;
    }
}
