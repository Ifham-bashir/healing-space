/**
 * User Data Manager
 * Handles all localStorage operations with namespacing
 */

const UserData = {
    namespace: 'healingSpace',
    
    // Get full storage object
    getAll() {
        const data = localStorage.getItem(this.namespace);
        return data ? JSON.parse(data) : {};
    },
    
    // Save entire object
    saveAll(data) {
        localStorage.setItem(this.namespace, JSON.stringify(data));
    },
    
    // Get specific key
    get(key) {
        const data = this.getAll();
        return data[key];
    },
    
    // Save specific key
    save(key, value) {
        const data = this.getAll();
        data[key] = value;
        this.saveAll(data);
    },
    
    // Add to array
    addToArray(key, item) {
        const data = this.getAll();
        if (!data[key]) data[key] = [];
        data[key].unshift(item);
        // Keep only last 100 items to prevent storage issues
        if (data[key].length > 100) data[key] = data[key].slice(0, 100);
        this.saveAll(data);
    },
    
    // Remove from array by ID
    removeFromArray(key, id) {
        const data = this.getAll();
        if (data[key]) {
            data[key] = data[key].filter(item => item.id !== id);
            this.saveAll(data);
        }
    },
    
    // Export all data
    exportAll() {
        return this.getAll();
    },
    
    // Generate ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
