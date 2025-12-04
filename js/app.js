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
        if (State.areas.length > 0 && !State.isLoggedIn && !State.isVisitorMode && !State.isViewOnlyMode) {
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

    async loadData(viewOnly = false) {
        // Kriterleri yükle
        const criteriaResult = await API.getCriteria(State.selectedArea);
        if (criteriaResult.success) {
            State.criteriaData = criteriaResult.data;
            State.initializeTasks();
            UI.updateAreaName();
            UI.renderQuestCards();
        }

        // İlerlemeyi yükle
        const shouldLoadProgress = viewOnly || State.isLoggedIn || State.isViewOnlyMode;
        if (shouldLoadProgress) {
            const progressResult = await API.getProgress(viewOnly || State.isViewOnlyMode);
            if (progressResult.success) {
                State.loadSavedData(progressResult.data);
            }
        }

        UI.updateAll();
        UI.renderAchievements();
    },

    async selectArea(areaId) {
        // Ziyaretçi veya view-only modunda API çağırmadan lokal olarak değiştir
        if (State.isVisitorMode || State.isViewOnlyMode) {
            State.selectedArea = areaId;
            UI.hideAreaSelection();
            await this.loadData(State.isViewOnlyMode);
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
        // View-only veya visitor modunda kaydetme
        if (State.isVisitorMode || State.isViewOnlyMode) return;

        const result = await API.saveProgress(State.getDataForSave());
        if (result.success) {
            UI.showSaveIndicator();
        }
    },

    async reset() {
        // View-only modda sıfırlama yok
        if (State.isViewOnlyMode) return;

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

        // Install prompt (Android/Chrome)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('install-prompt').style.display = 'flex';
        });

        // iOS Detection
        const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

        if (isIos && !isInStandaloneMode) {
            // iOS için özel bir bildirim veya ipucu gösterilebilir
            // Şimdilik sadece konsola yazalım, kullanıcı arayüzünü karıştırmayalım
            console.log('iOS PWA: Ana ekrana eklemek için Paylaş > Ana Ekrana Ekle');
        }
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
