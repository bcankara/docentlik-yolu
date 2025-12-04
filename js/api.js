/**
 * API.JS - Backend API İletişimi
 */

const API = {
    baseUrl: 'api.php',

    async request(action, data = null, method = 'GET') {
        const url = method === 'GET' && !data
            ? `${this.baseUrl}?action=${action}`
            : this.baseUrl + (method === 'GET' ? `?action=${action}` : '');

        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (data && method === 'POST') {
            options.body = JSON.stringify({ ...data, action });
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
        const url = area ? `${this.baseUrl}?action=get_criteria&area=${area}` : `${this.baseUrl}?action=get_criteria`;
        const response = await fetch(url);
        return response.json();
    },

    // Progress
    async getProgress() {
        return this.request('get_progress');
    },

    async saveProgress(data) {
        return this.request('save_progress', data, 'POST');
    },

    async reset() {
        return this.request('reset', null, 'POST');
    }
};

window.API = API;
