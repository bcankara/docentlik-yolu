/**
 * UI.JS - Kullanıcı Arayüzü Render
 */

const UI = {
    elements: {},

    init() {
        this.elements = {
            areaName: document.getElementById('area-name'),
            totalPoints: document.getElementById('total-points'),
            postDocPoints: document.getElementById('post-doc-points'),
            completedTasks: document.getElementById('completed-tasks'),
            progressBar: document.getElementById('progress-bar'),
            progressPercent: document.getElementById('progress-percent'),
            levelText: document.getElementById('level-text'),
            totalPointsCard: document.getElementById('total-points-card'),
            questGrid: document.getElementById('quest-grid'),
            requirementsList: document.getElementById('requirements-list'),
            achievementsGrid: document.getElementById('achievements-grid'),
            areaOverlay: document.getElementById('area-overlay'),
            areaList: document.getElementById('area-list')
        };
    },

    updateAll() {
        this.updateStats();
        this.updateProgress();
        this.updateLevel();
        this.updateRequirements();
        this.updateQuestCards();
        this.renderAchievements();
    },

    updateStats() {
        const { totalPoints, postDocPoints, completedTasks, totalPointsCard } = this.elements;

        if (totalPoints) totalPoints.textContent = Math.round(State.totalPoints * 10) / 10;
        if (postDocPoints) postDocPoints.textContent = Math.round(State.postDocPoints * 10) / 10;
        if (completedTasks) completedTasks.textContent = State.completedTasks;

        if (totalPointsCard) {
            totalPointsCard.classList.toggle('success', State.totalPoints >= 100);
        }
    },

    updateProgress() {
        const percent = Math.min((State.totalPoints / 100) * 100, 100);

        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = percent + '%';
        }
        if (this.elements.progressPercent) {
            this.elements.progressPercent.textContent = Math.round(percent) + '%';
        }

        // Trigger effects
        if (window.Effects) {
            Effects.updateProgress(percent);
        }
    },

    updateLevel() {
        let level = 'Araştırmacı';
        if (State.totalPoints >= 100 && State.allRequirementsMet) level = 'DOÇENTLİK HAZIR! ���';
        else if (State.totalPoints >= 80) level = 'Kıdemli Araştırmacı';
        else if (State.totalPoints >= 50) level = 'Deneyimli';
        else if (State.totalPoints >= 25) level = 'Gelişen';
        else if (State.totalPoints >= 10) level = 'Başlangıç';

        if (this.elements.levelText) {
            this.elements.levelText.textContent = 'Seviye: ' + level;
        }
    },

    updateRequirements() {
        const list = this.elements.requirementsList;
        if (!list) return;

        const requirements = [
            { text: 'Toplam en az 100 puan', met: State.totalPoints >= 100 },
            { text: 'Doktora sonrası en az 90 puan', met: State.postDocPoints >= 90 }
        ];

        list.innerHTML = requirements.map(req => `
            <div class="req-item ${req.met ? 'complete' : ''}">
                <span class="icon">${req.met ? '✅' : '❌'}</span>
                <span>${req.text}</span>
            </div>
        `).join('');
    },

    renderQuestCards() {
        const grid = this.elements.questGrid;
        if (!grid || !State.criteriaData) return;

        grid.innerHTML = State.criteriaData.kriterler.map(madde => `
            <div class="quest-card" data-madde-no="${madde.madde_no}" onclick="Modal.open('${madde.madde_no}')">
                <div class="quest-header">
                    <div class="quest-info">
                        <span class="quest-icon">${State.questIcons[madde.madde_no] || '���'}</span>
                        <div>
                            <div class="quest-title">${madde.kategori}</div>
                            <div class="quest-subtitle">Madde ${madde.madde_no} ${madde.maksimum_puan ? '• Maks. ' + madde.maksimum_puan + 'p' : ''}</div>
                        </div>
                    </div>
                    <div class="quest-points">
                        <div class="quest-current">0</div>
                        <div class="quest-max">${madde.maksimum_puan ? 'maks. ' + madde.maksimum_puan : '∞'} puan</div>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateQuestCards();
    },

    updateQuestCards() {
        if (!State.criteriaData) return;

        document.querySelectorAll('.quest-card').forEach(card => {
            const maddeNo = card.dataset.maddeNo;
            const madde = State.criteriaData.kriterler.find(m => m.madde_no === maddeNo);

            let questTotal = 0;
            State.tasks.filter(t => t.maddeNo === maddeNo).forEach(task => {
                // Yayın listesi varsa (yazar bazlı sistem)
                if (task.publications && task.publications.length > 0) {
                    task.publications.forEach(pub => {
                        questTotal += State.calculatePublicationPoints(task, pub);
                    });
                } else if (task.checkbox) {
                    if (task.checked) questTotal += task.points;
                } else {
                    questTotal += task.count * task.points;
                }
            });

            if (madde && madde.maksimum_puan) {
                questTotal = Math.min(questTotal, madde.maksimum_puan);
            }

            const currentEl = card.querySelector('.quest-current');
            if (currentEl) currentEl.textContent = Math.round(questTotal * 10) / 10;

            // Kart stilini güncelle (puan varsa completed)
            card.classList.toggle('has-points', questTotal > 0);
        });
    },

    renderAchievements() {
        const grid = this.elements.achievementsGrid;
        if (!grid) return;

        grid.innerHTML = State.achievementDefs.map(ach => {
            const unlocked = State.unlockedAchievements.includes(ach.id);
            return `
                <div class="achievement ${unlocked ? 'unlocked' : ''}">
                    <div class="achievement-icon">${ach.icon}</div>
                    <div class="achievement-name">${ach.name}</div>
                </div>
            `;
        }).join('');
    },

    renderAreaList() {
        const list = this.elements.areaList;
        if (!list || !State.areas.length) return;

        list.innerHTML = State.areas.map(area => `
            <div class="area-item" onclick="App.selectArea('${area.id}')">
                <span class="icon">${area.icon}</span>
                <span class="name">${area.adi}</span>
            </div>
        `).join('');
    },

    showAreaSelection() {
        if (this.elements.areaOverlay) {
            this.elements.areaOverlay.classList.add('active');
        }
    },

    hideAreaSelection() {
        if (this.elements.areaOverlay) {
            this.elements.areaOverlay.classList.remove('active');
        }
    },

    updateAreaName() {
        const area = State.areas.find(a => a.id === State.selectedArea);
        if (this.elements.areaName && area) {
            this.elements.areaName.textContent = area.adi;
        }
    },

    showSaveIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 1500);
        }
    }
};

window.UI = UI;
window.showAreaSelection = () => UI.showAreaSelection();
window.closeAreaOnOverlay = (e) => {
    if (e.target.id === 'area-overlay') UI.hideAreaSelection();
};
