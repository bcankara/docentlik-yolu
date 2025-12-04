/**
 * AUTH.JS - Kimlik Doğrulama Modülü
 */

const Auth = {
    init() {
        this.loginOverlay = document.getElementById('login-overlay');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.visitorBadge = document.getElementById('visitor-badge');
        this.viewOnlyBadge = document.getElementById('view-only-badge');
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

            if (!State.isLoggedIn && !State.isVisitorMode && !State.isViewOnlyMode) {
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
            State.isViewOnlyMode = false;
            document.body.classList.remove('view-only-mode');
            this.hideLogin();
            this.updateUI();
            App.loadData();
        } else {
            this.loginError.textContent = result.error || 'Giriş başarısız';
        }
    },

    async logout() {
        await API.logout();
        window.location.reload();
    },

    enterVisitorMode() {
        State.reset();
        State.tasks = []; // Agresif sıfırlama - eski verilerin kalmadığından emin ol
        State.isVisitorMode = true;
        State.isViewOnlyMode = false;
        State.isLoggedIn = false;
        document.body.classList.remove('view-only-mode');
        this.hideLogin();
        this.updateUI();
        App.loadData();
    },

    async enterViewOnlyMode() {
        State.reset();
        State.isViewOnlyMode = true;
        State.isVisitorMode = false;
        State.isLoggedIn = false;
        document.body.classList.add('view-only-mode');
        this.hideLogin();
        this.updateUI();

        // Admin'in kayıtlı verisini yükle
        await App.loadData(true); // viewOnly = true
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

        // View-only badge
        if (this.viewOnlyBadge) {
            this.viewOnlyBadge.style.display = State.isViewOnlyMode ? 'inline-block' : 'none';
        }

        // Logout button
        if (this.logoutBtn) {
            if (State.isVisitorMode) {
                this.logoutBtn.innerHTML = '🚪 Çıkış';
                this.logoutBtn.className = 'btn-logout';
                this.logoutBtn.onclick = () => {
                    State.reset();
                    window.location.reload();
                };
            } else if (State.isViewOnlyMode) {
                this.logoutBtn.innerHTML = '👁️‍🗨️ Gözetlemekten Çık';
                this.logoutBtn.className = 'btn-logout btn-view-exit';
                this.logoutBtn.onclick = () => {
                    State.reset();
                    window.location.reload();
                };
            } else {
                this.logoutBtn.innerHTML = '🚪 Çıkış';
                this.logoutBtn.className = 'btn-logout';
                this.logoutBtn.onclick = () => this.logout();
            }
        }
    }
};

// Global fonksiyonlar
window.enterVisitorMode = () => Auth.enterVisitorMode();
window.enterViewOnlyMode = () => Auth.enterViewOnlyMode();
window.logout = () => Auth.logout();

window.Auth = Auth;
