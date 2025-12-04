/**
 * STATE.JS - Uygulama Durum Yönetimi
 */

const State = {
    // Kullanıcı durumu
    isLoggedIn: false,
    isVisitorMode: false,
    isViewOnlyMode: false,
    selectedArea: 'muhendislik',

    // Veri
    criteriaData: null,
    areas: [],
    tasks: [],
    achievements: [],
    unlockedAchievements: [],

    // Hesaplanmış değerler
    totalPoints: 0,
    postDocPoints: 0,
    completedTasks: 0,
    allRequirementsMet: false,

    // Başarımlar tanımı
    achievementDefs: [
        { id: 'first-step', name: 'İlk Adım', icon: '👣', condition: (s) => s.totalPoints >= 10 },
        { id: 'quarter', name: '25 Puan', icon: '🌟', condition: (s) => s.totalPoints >= 25 },
        { id: 'halfway', name: 'Yarı Yol', icon: '🚀', condition: (s) => s.totalPoints >= 50 },
        { id: 'almost', name: 'Neredeyse', icon: '🔥', condition: (s) => s.totalPoints >= 90 },
        { id: 'target', name: 'Hedef!', icon: '🎯', condition: (s) => s.totalPoints >= 100 },
        { id: 'publisher', name: 'Yayıncı', icon: '📚', condition: (s) => s.completedTasks >= 5 },
        { id: 'all-reqs', name: 'Tam Donanım', icon: '🛡️', condition: (s) => s.allRequirementsMet }
    ],

    // İkonlar
    questIcons: {
        '1': '📚', '2': '🇹🇷', '3': '🎓', '4': '📖', '5': '🔗',
        '6': '👨‍🏫', '7': '🔬', '8': '🎤', '9': '🏫', '10': '💡',
        '11': '🏆', '12': '✏️', '13': '⭐'
    },

    // Task'ları hazırla
    initializeTasks() {
        this.tasks = [];
        if (!this.criteriaData || !this.criteriaData.kriterler) return;

        this.criteriaData.kriterler.forEach(madde => {
            madde.alt_kategoriler.forEach(kriter => {
                // Yazar sayısına göre puan hesaplama varsa
                const hasPuanHesaplama = kriter.puan_hesaplama && kriter.puan_hesaplama.tek_yazar;

                this.tasks.push({
                    id: kriter.kriter_kodu,
                    name: kriter.kriter_adi,
                    points: kriter.puan,
                    puanHesaplama: kriter.puan_hesaplama || null,
                    maddeNo: madde.madde_no,
                    postDoc: madde.doktora_sonrasi_mi,
                    maxPoints: madde.maksimum_puan,
                    checkbox: kriter.puan >= 20 && !kriter.kriter_adi.includes('Makale'),
                    count: 0,
                    checked: false,
                    // Yazar bazlı sistem için yayın listesi
                    publications: hasPuanHesaplama ? [] : null
                });
            });
        });
    },

    // Puanları hesapla
    calculatePoints() {
        let total = 0;
        let postDoc = 0;
        let completed = 0;

        const maddePoints = {};

        this.tasks.forEach(task => {
            let taskPoints = 0;

            // Yayın listesi varsa (yazar bazlı sistem)
            if (task.publications && task.publications.length > 0) {
                task.publications.forEach(pub => {
                    taskPoints += this.calculatePublicationPoints(task, pub);
                });
                completed++;
            } else if (task.checkbox) {
                if (task.checked) { taskPoints = task.points; completed++; }
            } else {
                taskPoints = task.count * task.points;
                if (task.count > 0) completed++;
            }

            if (!maddePoints[task.maddeNo]) {
                maddePoints[task.maddeNo] = { total: 0, postDoc: task.postDoc, maxPoints: task.maxPoints };
            }
            maddePoints[task.maddeNo].total += taskPoints;
        });

        Object.keys(maddePoints).forEach(maddeNo => {
            let mp = maddePoints[maddeNo];
            let effectivePoints = mp.maxPoints ? Math.min(mp.total, mp.maxPoints) : mp.total;
            total += effectivePoints;
            if (mp.postDoc) postDoc += effectivePoints;
        });

        this.totalPoints = total;
        this.postDocPoints = postDoc;
        this.completedTasks = completed;

        this.checkRequirements();
        this.checkAchievements();
    },

    // Tek bir yayın için puan hesapla
    calculatePublicationPoints(task, pub) {
        if (!task.puanHesaplama) return task.points;

        const ph = task.puanHesaplama;

        switch (pub.type) {
            case 'tek_yazar': return ph.tek_yazar || task.points;
            case 'iki_yazar_baslica': return ph.iki_yazar_baslica || task.points * 0.8;
            case 'iki_yazar_ikinci': return ph.iki_yazar_ikinci || task.points * 0.5;
            case 'cok_yazar_baslica': return ph.cok_yazar_baslica || task.points * 0.5;
            case 'cok_yazar_diger':
                const baslicaPuan = ph.cok_yazar_baslica || task.points * 0.5;
                const kalanPuan = task.points - baslicaPuan;
                return kalanPuan / (pub.authorCount || 3);
            default: return task.points;
        }
    },

    checkRequirements() {
        this.allRequirementsMet = this.totalPoints >= 100 && this.postDocPoints >= 90;
    },

    checkAchievements() {
        this.achievementDefs.forEach(ach => {
            if (!this.unlockedAchievements.includes(ach.id) && ach.condition(this)) {
                this.unlockedAchievements.push(ach.id);
            }
        });
    },

    // Task güncelle
    updateTask(taskId, changes) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, changes);
            this.calculatePoints();
            return true;
        }
        return false;
    },

    // Kayıtlı veriyi yükle
    loadSavedData(data) {
        // Önce her şeyi sıfırla
        this.tasks.forEach(task => {
            task.count = 0;
            task.checked = false;
            task.publications = task.puanHesaplama ? [] : null;
        });

        // Sonra gelen veriyi yükle
        if (data.tasks && data.tasks.length > 0) {
            data.tasks.forEach(savedTask => {
                const task = this.tasks.find(t => t.id === savedTask.id);
                if (task) {
                    task.count = savedTask.count || 0;
                    task.checked = savedTask.checked || false;
                    // Publications varsa yükle
                    if (savedTask.publications && task.publications !== null) {
                        task.publications = savedTask.publications;
                    }
                }
            });
        }
        this.unlockedAchievements = data.achievements || [];
        this.calculatePoints();
    },

    // Sıfırla
    reset() {
        this.tasks.forEach(task => {
            task.count = 0;
            task.checked = false;
            task.publications = task.puanHesaplama ? [] : null;
        });
        this.totalPoints = 0;
        this.postDocPoints = 0;
        this.completedTasks = 0;
        this.allRequirementsMet = false;
        this.unlockedAchievements = [];
        this.calculatePoints();
    },

    // Kayıt için veri hazırla
    getDataForSave() {
        return {
            tasks: this.tasks.map(t => ({
                id: t.id,
                count: t.count,
                checked: t.checked,
                publications: t.publications || null
            })),
            achievements: this.unlockedAchievements,
            total_points: this.totalPoints,
            post_doc_points: this.postDocPoints
        };
    },

    // Sıfırla
    reset() {
        this.tasks.forEach(task => {
            task.count = 0;
            task.checked = false;
        });
        this.unlockedAchievements = [];
        this.calculatePoints();
    }
};

// Global'e aktar
window.State = State;
