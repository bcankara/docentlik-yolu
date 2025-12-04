/**
 * API.JS - Backend API İletişimi
 */

const API = {
    baseUrl: 'api.php',

    async request(action, data = null, method = 'GET') {
        // Action her zaman URL'de olmalı
        const url = `${this.baseUrl}?action=${action}`;

        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (data && method === 'POST') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: 'Bağlantı hatası' };
        }
    },

    // Auth
    async login(username, password) {
        return this.request('login', { username, password }, 'POST');
    },

    async logout() {
        return this.request('logout', null, 'POST');
    },

    async checkAuth() {
        return this.request('check_auth');
    },

    // Areas
    async getAreas() {
        return this.request('get_areas');
    },

    async selectArea(area) {
        return this.request('select_area', { area }, 'POST');
    },

    // Criteria
    async getCriteria(area = null) {
        const validArea = area || 'muhendislik';
        const url = `${this.baseUrl}?action=get_criteria&area=${validArea}`;
        const response = await fetch(url);
        return response.json();
    },

    // Progress
    async getProgress(viewOnly = false) {
        const url = viewOnly
            ? `${this.baseUrl}?action=get_progress&view_only=true`
            : `${this.baseUrl}?action=get_progress`;
        const response = await fetch(url);
        return response.json();
    },

    async saveProgress(data) {
        return this.request('save_progress', data, 'POST');
    },

    async reset() {
        return this.request('reset', null, 'POST');
    }
};

window.API = API;
