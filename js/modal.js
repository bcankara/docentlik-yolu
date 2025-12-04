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

        // VIEW-ONLY MODDA CV TARZI GÖRÜNÜM
        if (State.isViewOnlyMode) {
            body.innerHTML = this.renderCVView(madde, categoryPoints);
            return;
        }

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

            const isCompleted = task.checkbox ? task.checked : (task.publications ? task.publications.length > 0 : task.count > 0);

            // Yazar bazlı puan hesaplama varsa (makaleler için)
            if (task.puanHesaplama && task.publications !== null) {
                html += this.renderAuthorBasedTask(task, kriter);
            } else if (task.checkbox) {
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

    // CV TARZI GÖRÜNÜM (View-only mod için)
    renderCVView(madde, categoryPoints) {
        let html = `
            <div class="cv-header">
                <div class="cv-category-points">
                    <span class="cv-points-value">${Math.round(categoryPoints * 10) / 10}</span>
                    <span class="cv-points-label">puan</span>
                </div>
                ${madde.maksimum_puan ? `<div class="cv-max-info">Maks: ${madde.maksimum_puan}p</div>` : ''}
            </div>
            
            <div class="cv-items">
        `;

        let hasItems = false;

        madde.alt_kategoriler.forEach(kriter => {
            const task = State.tasks.find(t => t.id === kriter.kriter_kodu);
            if (!task) return;

            let itemPoints = 0;
            let itemCount = 0;
            let itemDetails = '';

            // Yayın bazlı
            if (task.publications && task.publications.length > 0) {
                task.publications.forEach(pub => {
                    itemPoints += this.calculateSinglePublicationPoints(task, pub);
                });
                itemCount = task.publications.length;
                itemDetails = task.publications.map(pub => this.getAuthorTypeLabel(pub)).join(', ');
            }
            // Checkbox
            else if (task.checkbox && task.checked) {
                itemPoints = task.points;
                itemCount = 1;
                itemDetails = 'Tamamlandı';
            }
            // Sayaç
            else if (task.count > 0) {
                itemPoints = task.count * task.points;
                itemCount = task.count;
                itemDetails = `${task.count} adet`;
            }

            // Sadece puanı olanları göster
            if (itemPoints > 0) {
                hasItems = true;
                html += `
                    <div class="cv-item">
                        <div class="cv-item-info">
                            <div class="cv-item-name">${kriter.kriter_adi}</div>
                            <div class="cv-item-details">${itemDetails}</div>
                        </div>
                        <div class="cv-item-points">+${Math.round(itemPoints * 10) / 10}p</div>
                    </div>
                `;
            }
        });

        if (!hasItems) {
            html += `<div class="cv-empty">Bu kategoride henüz kayıt yok</div>`;
        }

        html += `</div>`;

        // Zorunlu şart
        if (madde.madde_ozel_sart) {
            html += `
                <div class="cv-requirement">
                    <span class="cv-req-icon">⚠️</span>
                    <span class="cv-req-text">${madde.madde_ozel_sart.aciklama}</span>
                </div>
            `;
        }

        return html;
    },

    // Yazar bazlı puan hesaplama için task render
    renderAuthorBasedTask(task, kriter) {
        const totalPoints = this.calculateTaskPoints(task);
        const pubCount = task.publications ? task.publications.length : 0;

        let html = `
            <div class="task-item author-task ${pubCount > 0 ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-content" style="width: 100%;">
                    <div class="task-header-row">
                        <div class="task-name">${kriter.kriter_adi}</div>
                        <div class="task-total-points">${Math.round(totalPoints * 10) / 10} puan</div>
                    </div>
                    <div class="task-meta">
                        <span class="task-points">Temel: ${kriter.puan} p</span>
                        <span class="pub-count">${pubCount} yayın</span>
                    </div>
        `;

        // Mevcut yayınları listele
        if (task.publications && task.publications.length > 0) {
            html += `<div class="publications-list">`;
            task.publications.forEach((pub, index) => {
                const pubPoints = this.calculateSinglePublicationPoints(task, pub);
                html += `
                    <div class="publication-item">
                        <div class="pub-info">
                            <span class="pub-number">#${index + 1}</span>
                            <span class="pub-details">${this.getAuthorTypeLabel(pub)} → ${Math.round(pubPoints * 10) / 10}p</span>
                        </div>
                        <button class="pub-remove" onclick="Modal.removePublication('${task.id}', ${index})">×</button>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Yeni yayın ekleme formu
        html += `
            <div class="add-publication-form" id="pub-form-${task.id}">
                <div class="pub-form-row">
                    <select id="author-count-${task.id}" class="author-select" onchange="Modal.updateAuthorOptions('${task.id}')">
                        <option value="1">Tek yazar</option>
                        <option value="2">2 yazar</option>
                        <option value="3">3+ yazar</option>
                    </select>
                    <select id="author-position-${task.id}" class="author-select">
                        <option value="baslica">Başlıca yazar</option>
                    </select>
                    <button class="add-pub-btn" onclick="Modal.addPublication('${task.id}')">+ Ekle</button>
                </div>
            </div>
        `;

        html += `</div></div>`;
        return html;
    },

    getAuthorTypeLabel(pub) {
        const labels = {
            'tek_yazar': 'Tek yazar',
            'iki_yazar_baslica': '2 yazar (başlıca)',
            'iki_yazar_ikinci': '2 yazar (ikinci)',
            'cok_yazar_baslica': '3+ yazar (başlıca)',
            'cok_yazar_diger': '3+ yazar (diğer)'
        };
        return labels[pub.type] || pub.type;
    },

    updateAuthorOptions(taskId) {
        const countEl = document.getElementById(`author-count-${taskId}`);
        const posEl = document.getElementById(`author-position-${taskId}`);
        if (!countEl || !posEl) return;

        const count = parseInt(countEl.value);

        if (count === 1) {
            posEl.innerHTML = `<option value="baslica">Başlıca yazar</option>`;
        } else if (count === 2) {
            posEl.innerHTML = `
                <option value="baslica">Başlıca yazar</option>
                <option value="ikinci">İkinci yazar</option>
            `;
        } else {
            posEl.innerHTML = `
                <option value="baslica">Başlıca yazar</option>
                <option value="diger">Diğer yazar</option>
            `;
        }
    },

    addPublication(taskId) {
        const task = State.tasks.find(t => t.id === taskId);
        if (!task || !task.publications) return;

        const countEl = document.getElementById(`author-count-${taskId}`);
        const posEl = document.getElementById(`author-position-${taskId}`);
        if (!countEl || !posEl) return;

        const count = parseInt(countEl.value);
        const position = posEl.value;

        // Yazar tipini belirle
        let authorType;
        if (count === 1) {
            authorType = 'tek_yazar';
        } else if (count === 2) {
            authorType = position === 'baslica' ? 'iki_yazar_baslica' : 'iki_yazar_ikinci';
        } else {
            authorType = position === 'baslica' ? 'cok_yazar_baslica' : 'cok_yazar_diger';
        }

        task.publications.push({
            type: authorType,
            authorCount: count,
            addedAt: Date.now()
        });

        // Modal'ı yeniden render et
        const madde = State.criteriaData.kriterler.find(m => m.madde_no === this.currentMaddeNo);
        if (madde) this.renderBody(madde);

        this.afterUpdate();
    },

    removePublication(taskId, index) {
        const task = State.tasks.find(t => t.id === taskId);
        if (!task || !task.publications) return;

        task.publications.splice(index, 1);

        // Modal'ı yeniden render et
        const madde = State.criteriaData.kriterler.find(m => m.madde_no === this.currentMaddeNo);
        if (madde) this.renderBody(madde);

        this.afterUpdate();
    },

    calculateSinglePublicationPoints(task, pub) {
        if (!task.puanHesaplama) return task.points;

        const ph = task.puanHesaplama;

        switch (pub.type) {
            case 'tek_yazar': return ph.tek_yazar || task.points;
            case 'iki_yazar_baslica': return ph.iki_yazar_baslica || task.points * 0.8;
            case 'iki_yazar_ikinci': return ph.iki_yazar_ikinci || task.points * 0.5;
            case 'cok_yazar_baslica': return ph.cok_yazar_baslica || task.points * 0.5;
            case 'cok_yazar_diger':
                // Kalan puan / yazar sayısı
                const baslicaPuan = ph.cok_yazar_baslica || task.points * 0.5;
                const kalanPuan = task.points - baslicaPuan;
                return kalanPuan / (pub.authorCount || 3);
            default: return task.points;
        }
    },

    calculateTaskPoints(task) {
        if (task.publications && task.publications.length > 0) {
            return task.publications.reduce((sum, pub) => sum + this.calculateSinglePublicationPoints(task, pub), 0);
        }
        return task.checkbox ? (task.checked ? task.points : 0) : task.count * task.points;
    },

    calculateCategoryPoints(maddeNo) {
        let total = 0;
        State.tasks.filter(t => t.maddeNo === maddeNo).forEach(task => {
            total += this.calculateTaskPoints(task);
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
