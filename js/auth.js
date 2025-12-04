/**
 * AUTH.JS - Kimlik Doğrulama Modülü
 */

const Auth = {
    init() {
        this.loginOverlay = document.getElementById('login-overlay');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.visitorBadge = document.getElementById('visitor-badge');
        this.logoutBtn = document.getElementById('btn-logout');

        this.bindEvents();
    },

    bindEvents() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    },

    async checkAuth() {
        const result = await API.checkAuth();
        if (result.success) {
            State.isLoggedIn = result.logged_in;
            State.selectedArea = result.selected_area || 'muhendislik';

            if (!State.isLoggedIn && !State.isVisitorMode) {
                this.showLogin();
            } else {
                this.hideLogin();
                this.updateUI();
            }
        }
        return State.isLoggedIn;
    },

    async handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        this.loginError.textContent = '';

        const result = await API.login(username, password);

        if (result.success) {
            State.isLoggedIn = true;
            State.isVisitorMode = false;
            this.hideLogin();
            this.updateUI();
            App.loadData();
        } else {
            this.loginError.textContent = result.error || 'Giriş başarısız';
        }
    },

    async logout() {
        await API.logout();
        State.isLoggedIn = false;
        State.isVisitorMode = false;
        State.reset();
        this.showLogin();
        UI.updateAll();
    },

    enterVisitorMode() {
        State.isVisitorMode = true;
        State.isLoggedIn = false;
        this.hideLogin();
        this.updateUI();
        App.loadData();
    },

    showLogin() {
        if (this.loginOverlay) {
            this.loginOverlay.classList.add('active');
        }
    },

    hideLogin() {
        if (this.loginOverlay) {
            this.loginOverlay.classList.remove('active');
        }
    },

    updateUI() {
        // Visitor badge
        if (this.visitorBadge) {
            this.visitorBadge.style.display = State.isVisitorMode ? 'inline-block' : 'none';
        }

        // Logout button text
        if (this.logoutBtn) {
            this.logoutBtn.textContent = State.isVisitorMode ? '🔐 Giriş Yap' : '🚪 Çıkış';
            this.logoutBtn.onclick = State.isVisitorMode ? () => this.showLogin() : () => this.logout();
        }
    }
};

// Global fonksiyonlar
window.enterVisitorMode = () => Auth.enterVisitorMode();
window.logout = () => Auth.logout();

window.Auth = Auth;
