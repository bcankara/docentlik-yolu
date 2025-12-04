/**
 * MODAL.JS - Modal İşlemleri
 */

const Modal = {
    overlay: null,
    currentMaddeNo: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');

        // ESC tuşu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open(maddeNo) {
        if (!State.criteriaData) return;

        const madde = State.criteriaData.kriterler.find(m => m.madde_no === maddeNo);
        if (!madde) return;

        this.currentMaddeNo = maddeNo;

        // Header
        document.getElementById('modal-icon').textContent = State.questIcons[maddeNo] || '📋';
        document.getElementById('modal-title').textContent = madde.kategori;
        document.getElementById('modal-subtitle').textContent = `Madde ${maddeNo} • ${madde.aciklama || ''}`;

        // Body
        this.renderBody(madde);

        // Show
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    renderBody(madde) {
        const body = document.getElementById('modal-body');

        // Kategori puanı
        let categoryPoints = this.calculateCategoryPoints(madde.madde_no);
        if (madde.maksimum_puan) categoryPoints = Math.min(categoryPoints, madde.maksimum_puan);

        let html = `
            <div class="modal-points-display">
                <div class="modal-points-label">Bu Kategoriden Puan</div>
                <div class="modal-points-value" id="category-points">${Math.round(categoryPoints * 10) / 10}</div>
                <div class="modal-points-max">${madde.maksimum_puan ? 'Maksimum: ' + madde.maksimum_puan + ' puan' : 'Sınırsız'}</div>
            </div>
            <div class="task-group"><div class="task-group-title">Kriterler</div>
        `;

        madde.alt_kategoriler.forEach(kriter => {
            const task = State.tasks.find(t => t.id === kriter.kriter_kodu);
            if (!task) return;

            const isCompleted = task.checkbox ? task.checked : task.count > 0;

            if (task.checkbox) {
                html += `
                    <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}" onclick="Modal.toggleCheckbox('${task.id}')">
                        <div class="task-checkbox"></div>
                        <div class="task-content">
                            <div class="task-name">${kriter.kriter_adi}</div>
                            <div class="task-meta">
                                <span class="task-points">+${kriter.puan} puan</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                        <div class="task-content">
                            <div class="task-name">${kriter.kriter_adi}</div>
                            <div class="task-meta">
                                <span class="task-points">+${kriter.puan} p/adet</span>
                            </div>
                        </div>
                        <div class="task-counter">
                            <button class="counter-btn" onclick="Modal.updateCounter('${task.id}', -1)">−</button>
                            <span class="counter-value">${task.count}</span>
                            <button class="counter-btn" onclick="Modal.updateCounter('${task.id}', 1)">+</button>
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';

        // Zorunlu şart
        if (madde.madde_ozel_sart) {
            html += `
                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 170, 0, 0.1); border: 1px solid var(--warning); border-radius: 8px;">
                    <div style="color: var(--warning); font-weight: 600; margin-bottom: 5px;">⚠️ Zorunlu Şart</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${madde.madde_ozel_sart.aciklama}</div>
                </div>
            `;
        }

        body.innerHTML = html;
    },

    calculateCategoryPoints(maddeNo) {
        let total = 0;
        State.tasks.filter(t => t.maddeNo === maddeNo).forEach(task => {
            total += task.checkbox ? (task.checked ? task.points : 0) : task.count * task.points;
        });
        return total;
    },

    toggleCheckbox(taskId) {
        const task = State.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.checked = !task.checked;

        const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskEl) {
            taskEl.classList.toggle('completed', task.checked);
            if (task.checked) {
                taskEl.classList.add('just-completed');
                setTimeout(() => taskEl.classList.remove('just-completed'), 600);
            }
        }

        this.afterUpdate();
    },

    updateCounter(taskId, delta) {
        const task = State.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.count = Math.max(0, task.count + delta);

        const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskEl) {
            taskEl.querySelector('.counter-value').textContent = task.count;
            taskEl.classList.toggle('completed', task.count > 0);
            if (delta > 0 && task.count > 0) {
                taskEl.classList.add('just-completed');
                setTimeout(() => taskEl.classList.remove('just-completed'), 600);
            }
        }

        this.afterUpdate();
    },

    afterUpdate() {
        State.calculatePoints();
        this.updateCategoryPoints();
        UI.updateAll();
        App.save();
    },

    updateCategoryPoints() {
        const madde = State.criteriaData.kriterler.find(m => m.madde_no === this.currentMaddeNo);
        if (!madde) return;

        let points = this.calculateCategoryPoints(this.currentMaddeNo);
        if (madde.maksimum_puan) points = Math.min(points, madde.maksimum_puan);

        const el = document.getElementById('category-points');
        if (el) el.textContent = Math.round(points * 10) / 10;
    },

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.currentMaddeNo = null;
    }
};

window.Modal = Modal;
window.closeModal = () => Modal.close();
window.closeModalOnOverlay = (e) => {
    if (e.target === Modal.overlay) Modal.close();
};
