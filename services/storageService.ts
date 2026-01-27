
// Centralized Data Management for Sync
const KEYS = {
    APPOINTMENTS: 'urogenius_appointments',
    QUICK_NOTE: 'urogenius_quick_note',
    USER_PROFILE: 'urogenius_user_profile',
    SETTINGS: 'urogenius_settings'
};

export const StorageService = {
    // --- Generic Getters/Setters ---
    getItem: (key: string) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error(`Error getting ${key}`, e);
            return null;
        }
    },

    setItem: (key: string, data: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            // Trigger a custom event for cross-component updates
            window.dispatchEvent(new Event('storage-update'));
        } catch (e) {
            console.error(`Error setting ${key}`, e);
        }
    },

    // --- Specific Data Access ---
    getAppointments: () => StorageService.getItem(KEYS.APPOINTMENTS) || [],
    saveAppointments: (apps: any[]) => StorageService.setItem(KEYS.APPOINTMENTS, apps),

    getQuickNote: () => {
        try {
             return localStorage.getItem(KEYS.QUICK_NOTE) || '';
        } catch { return ''; }
    },
    saveQuickNote: (note: string) => localStorage.setItem(KEYS.QUICK_NOTE, note),

    // --- Cloud Sync / Backup Features ---
    
    // Generates a full JSON dump of the application state
    exportBackup: () => {
        const data = {
            appointments: StorageService.getAppointments(),
            quickNote: StorageService.getQuickNote(),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        return btoa(JSON.stringify(data)); // Simple Base64 encoding
    },

    // Restores application state from a backup string
    importBackup: (backupString: string) => {
        try {
            const json = atob(backupString);
            const data = JSON.parse(json);
            
            if (data.appointments) StorageService.saveAppointments(data.appointments);
            if (data.quickNote) StorageService.saveQuickNote(data.quickNote);
            
            return { success: true, timestamp: data.timestamp };
        } catch (e) {
            return { success: false, error: e };
        }
    },
    
    // Clear all data (Logout/Reset)
    clearAll: () => {
        localStorage.removeItem(KEYS.APPOINTMENTS);
        localStorage.removeItem(KEYS.QUICK_NOTE);
        // We usually keep user profile for convenience, but strictly speaking:
        // localStorage.removeItem(KEYS.USER_PROFILE);
    }
};
