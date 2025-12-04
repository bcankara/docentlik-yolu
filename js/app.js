/**
 * APP.JS - Ana Uygulama Başlatıcı
 */

const App = {
    deferredPrompt: null,

    async init() {
        // Modülleri başlat
        UI.init();
        Auth.init();
        Modal.init();

        // Effects
        if (window.Effects) Effects.init();

        // PWA
        this.initPWA();

        // Auth kontrol
        await Auth.checkAuth();

        // Alanları yükle
        await this.loadAreas();

        // İlk alan seçimi
        if (State.areas.length > 0 && !State.isLoggedIn && !State.isVisitorMode) {
            // Login bekle
        } else {
            await this.loadData();
        }
    },

    async loadAreas() {
        const result = await API.getAreas();
        if (result.success && result.data && result.data.alanlar) {
            State.areas = result.data.alanlar;
            UI.renderAreaList();
        }
    },

    async loadData() {
        // Kriterleri yükle
        const criteriaResult = await API.getCriteria(State.selectedArea);
        if (criteriaResult.success) {
            State.criteriaData = criteriaResult.data;
            State.initializeTasks();
            UI.updateAreaName();
            UI.renderQuestCards();
        }

        // İlerlemeyi yükle
        const progressResult = await API.getProgress();
        if (progressResult.success) {
            State.loadSavedData(progressResult.data);
        }

        UI.updateAll();
        UI.renderAchievements();
    },

    async selectArea(areaId) {
        // Ziyaretçi modunda API çağırmadan lokal olarak değiştir
        if (State.isVisitorMode) {
            State.selectedArea = areaId;
            UI.hideAreaSelection();
            await this.loadData();
        } else {
            // Login modunda backend'e kaydet
            const result = await API.selectArea(areaId);
            if (result.success) {
                State.selectedArea = areaId;
                UI.hideAreaSelection();
                await this.loadData();
            }
        }
    },

    async save() {
        if (State.isVisitorMode) return;

        const result = await API.saveProgress(State.getDataForSave());
        if (result.success) {
            UI.showSaveIndicator();
        }
    },

    async reset() {
        if (!confirm('Tüm ilerleme sıfırlanacak. Emin misiniz?')) return;

        if (!State.isVisitorMode) {
            await API.reset();
        }

        State.reset();
        UI.renderQuestCards();
        UI.updateAll();
        UI.showSaveIndicator();
    },

    // PWA
    initPWA() {
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('SW registration failed:', err);
            });
        }

        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('install-prompt').style.display = 'flex';
        });
    },

    async installPWA() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            document.getElementById('install-prompt').style.display = 'none';
        }
        this.deferredPrompt = null;
    },

    dismissInstall() {
        document.getElementById('install-prompt').style.display = 'none';
    }
};

// Global fonksiyonlar
window.resetProgress = () => App.reset();
window.installPWA = () => App.installPWA();
window.dismissInstall = () => App.dismissInstall();

// Başlat
document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
