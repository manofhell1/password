// Password Generator Script
class PasswordGenerator {
    constructor() {
        this.settings = {
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: false,
            length: 8
        };

        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.updateSettingsUI();
    }

    // Load settings from localStorage (using in-memory storage for this demo)
    loadSettings() {
        try {
            const saved = localStorage.getItem('passwordSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            // Use default settings if localStorage fails
        }
    }

    // Save settings to localStorage (using in-memory storage for this demo)
    saveSettings() {
        try {
            localStorage.setItem('passwordSettings', JSON.stringify(this.settings));
        } catch (e) {
            // Handle localStorage not available
        }
    }

    // Update UI based on current settings
    updateSettingsUI() {
        document.getElementById('uppercase').checked = this.settings.uppercase;
        document.getElementById('lowercase').checked = this.settings.lowercase;
        document.getElementById('numbers').checked = this.settings.numbers;
        document.getElementById('symbols').checked = this.settings.symbols;
        document.getElementById('length').value = this.settings.length;
    }

    // Bind all event listeners
    bindEvents() {
        // Settings changes
        ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                this.settings[id] = e.target.checked;
                this.saveSettings();
                this.generatePasswordIfFormValid();
            });
        });

        // Length change
        document.getElementById('length').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 4 && value <= 50) {
                this.settings.length = value;
                this.saveSettings();
                this.generatePasswordIfFormValid();
            }
        });

        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.resetSettings();
        });

        // Copy button
        document.getElementById('copy').addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Real-time validation
        document.getElementById('website').addEventListener('input', () => {
            this.validateWebsite();
            this.generatePasswordIfFormValid();
        });

        document.getElementById('username').addEventListener('input', () => {
            this.validateUsername();
            this.generatePasswordIfFormValid();
        });

        document.getElementById('masterpassword').addEventListener('input', () => {
            this.validateMasterPassword();
            this.generatePasswordIfFormValid();
        });

        document.getElementById('phrase').addEventListener('input', () => {
            this.validatePhrase();
            this.generatePasswordIfFormValid();
        });
    }

    // Validate website field
    validateWebsite() {
        const website = document.getElementById('website').value;
        const websiteField = document.getElementById('website');
        const errorDiv = document.getElementById('websiteError');

        // Only alphabets, numbers, and spaces allowed
        const validPattern = /^[A-Za-z0-9\s]*$/;

        if (!website.trim()) {
            this.setFieldError(websiteField, errorDiv, 'Website name is required');
            return false;
        }

        if (!validPattern.test(website)) {
            this.setFieldError(websiteField, errorDiv, 'Only letters, numbers, and spaces are allowed');
            return false;
        }

        this.clearFieldError(websiteField, errorDiv);
        return true;
    }

    // Validate username field (optional)
    validateUsername() {
        const username = document.getElementById('username').value;
        const usernameField = document.getElementById('username');
        const errorDiv = document.getElementById('usernameError');

        // Only letters, numbers, dashes, underscores, and dots allowed
        const validPattern = /^[A-Za-z0-9._-]*$/;

        // Username is optional - if empty, it's valid
        if (!username.trim()) {
            this.clearFieldError(usernameField, errorDiv);
            return true;
        }

        if (!validPattern.test(username)) {
            this.setFieldError(usernameField, errorDiv, 'Only letters, numbers, dashes, underscores, and dots are allowed');
            return false;
        }

        this.clearFieldError(usernameField, errorDiv);
        return true;
    }

    // Validate master password field
    validateMasterPassword() {
        const password = document.getElementById('masterpassword').value;
        const passwordField = document.getElementById('masterpassword');
        const errorDiv = document.getElementById('masterpasswordError');

        if (!password) {
            this.setFieldError(passwordField, errorDiv, 'Master password is required');
            return false;
        }

        if (password.includes(' ')) {
            this.setFieldError(passwordField, errorDiv, 'No spaces allowed');
            return false;
        }

        if (password.length < 8) {
            this.setFieldError(passwordField, errorDiv, 'Must be at least 8 characters long');
            return false;
        }

        if (password.length > 50) {
            this.setFieldError(passwordField, errorDiv, 'Must be 50 characters or less');
            return false;
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);

        if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
            this.setFieldError(passwordField, errorDiv, 'Must include uppercase, lowercase, numbers, and symbols');
            return false;
        }

        this.clearFieldError(passwordField, errorDiv);
        return true;
    }

    // Validate phrase field (optional)
    validatePhrase() {
        const phrase = document.getElementById('phrase').value;
        const phraseField = document.getElementById('phrase');
        const errorDiv = document.getElementById('phraseError');

        // Only alphabets, numbers, and spaces allowed
        const validPattern = /^[A-Za-z0-9\s]*$/;

        // Phrase is optional - if empty, it's valid
        if (!phrase.trim()) {
            this.clearFieldError(phraseField, errorDiv);
            return true;
        }

        if (!validPattern.test(phrase)) {
            this.setFieldError(phraseField, errorDiv, 'Only letters, numbers, and spaces are allowed');
            return false;
        }

        this.clearFieldError(phraseField, errorDiv);
        return true;
    }

    // Set field error state
    setFieldError(field, errorDiv, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // Clear field error state
    clearFieldError(field, errorDiv) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }

    // Check if all fields are valid
    isFormValid() {
        return this.validateWebsite() && this.validateUsername() && this.validateMasterPassword() && this.validatePhrase();
    }

    // Generate password if form is valid
    generatePasswordIfFormValid() {
        if (this.isFormValid()) {
            this.generatePassword();
        } else {
            document.getElementById('password').value = '';
        }
    }

    // Generate password using SHA-256
    async generatePassword() {
        if (!this.isFormValid()) {
            return;
        }

        // Get and process inputs
        const website = document.getElementById('website').value.replace(/\s+/g, '').toLowerCase();
        const username = document.getElementById('username').value.toLowerCase() || '';
        const masterPassword = document.getElementById('masterpassword').value;
        const phrase = document.getElementById('phrase').value.replace(/\s+/g, '').toLowerCase() || '';

        // Combine inputs for hashing (including username and phrase if provided)
        const combined = website + username + masterPassword + phrase;

        try {
            // Generate SHA-256 hash
            const encoder = new TextEncoder();
            const data = encoder.encode(combined);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Generate password from hash
            const password = this.createPasswordFromHash(hashHex);
            document.getElementById('password').value = password;

        } catch (error) {
            console.error('Error generating password:', error);
            document.getElementById('password').value = 'Error generating password';
        }
    }

    // Create password from hash based on settings
    createPasswordFromHash(hash) {
        const chars = this.getCharacterSet();
        if (chars.length === 0) {
            return 'Invalid settings';
        }

        let password = '';
        const requiredChars = this.getRequiredChars();

        // Ensure at least one character from each selected type
        let hashIndex = 0;
        for (const charSet of requiredChars) {
            if (password.length < this.settings.length) {
                const charIndex = parseInt(hash.substr(hashIndex % hash.length, 2), 16) % charSet.length;
                password += charSet[charIndex];
                hashIndex += 2;
            }
        }

        // Fill remaining positions
        while (password.length < this.settings.length) {
            const charIndex = parseInt(hash.substr(hashIndex % hash.length, 2), 16) % chars.length;
            password += chars[charIndex];
            hashIndex += 2;
        }

        // Shuffle password using hash
        return this.shuffleString(password, hash);
    }

    // Get character set based on settings
    getCharacterSet() {
        let chars = '';
        if (this.settings.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (this.settings.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (this.settings.numbers) chars += '0123456789';
        if (this.settings.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        return chars;
    }

    // Get required character sets for ensuring at least one of each type
    getRequiredChars() {
        const sets = [];
        if (this.settings.uppercase) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if (this.settings.lowercase) sets.push('abcdefghijklmnopqrstuvwxyz');
        if (this.settings.numbers) sets.push('0123456789');
        if (this.settings.symbols) sets.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
        return sets;
    }

    // Shuffle string using hash for deterministic randomness
    shuffleString(str, hash) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const hashIndex = (i * 2) % hash.length;
            const j = parseInt(hash.substr(hashIndex, 2), 16) % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    // Reset settings to default
    resetSettings() {
        this.settings = {
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: false,
            length: 8
        };
        this.saveSettings();
        this.updateSettingsUI();
        this.generatePasswordIfFormValid();
    }

    // Copy password to clipboard
    async copyToClipboard() {
        const passwordField = document.getElementById('password');
        const copyButton = document.getElementById('copy');

        if (!passwordField.value) {
            return;
        }

        try {
            await navigator.clipboard.writeText(passwordField.value);

            // Visual feedback
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            `;
            copyButton.classList.add('btn-success');
            copyButton.classList.remove('btn-primary');

            setTimeout(() => {
                copyButton.innerHTML = originalHTML;
                copyButton.classList.remove('btn-success');
                copyButton.classList.add('btn-primary');
            }, 2000);

        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            passwordField.select();
            document.execCommand('copy');
        }
    }
}

// Initialize the password generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});