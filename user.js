/**
 * UserData Manager - Centralized localStorage
 * All features use this. Load this file FIRST.
 */

const UserData = {
    get(key) {
        const data = JSON.parse(localStorage.getItem('healingSpace_v2') || '{}');
        return data[key];
    },
    
    set(key, value) {
        const data = JSON.parse(localStorage.getItem('healingSpace_v2') || '{}');
        data[key] = value;
        localStorage.setItem('healingSpace_v2', JSON.stringify(data));
    },
    
    addToArray(key, item) {
        const arr = this.get(key) || [];
        arr.unshift({...item, id: Date.now(), created: new Date().toISOString()});
        if (arr.length > 100) arr.pop(); // Keep last 100
        this.set(key, arr);
    },
    
    removeFromArray(key, id) {
        let arr = this.get(key) || [];
        arr = arr.filter(item => item.id !== id);
        this.set(key, arr);
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};
