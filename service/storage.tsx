import { MMKV } from "react-native-mmkv";

// Create a new instance of MMKV storage
const storage = new MMKV();

export const mmkvStorage = {
    /**
     
     * @param {string} key - The key to store the value against
     * @param {any} value - The value to store (handles string  , number, boolean, and objects)
     */
    setItem: (key: string, value: any): void => {
        if (typeof value === 'string') {
            storage.set(key, value);
        } else if (typeof value === 'number') {
            storage.set(key, value);
        } else if (typeof value === 'boolean') {
            storage.set(key, value);
        } else if (typeof value === 'object') {
            storage.set(key, JSON.stringify(value)); // Convert objects to JSON strings
        } else {
            console.error('Unsupported data type');
        }
    },

    /**
     * Retrieve a value from MMKV storage and automatically parse it
     * @param {string} key - The key for the value to retrieve
     * @returns {any} - The value stored against the key (string, number, boolean, object)
     */
    getItem: (key: string): any | null => {
        // Try to retrieve as a string first
        const stringValue = storage.getString(key);
        if (stringValue !== undefined) {
            try {
                // Try to parse it as JSON (for objects)
                return JSON.parse(stringValue);
            } catch {
                return stringValue; // If not JSON, return as string
            }
        }

        // Try to retrieve as a number
        const numberValue = storage.getNumber(key);
        if (numberValue !== undefined) {
            return numberValue;
        }

        // Try to retrieve as a boolean
        const booleanValue = storage.getBoolean(key);
        if (booleanValue !== undefined) {
            return booleanValue;
        }

        return null; // If nothing is found, return null
    },

    /**
     * Remove a value from MMKV storage
     * @param {string} key - The key for the value to remove
     */
    removeItem: (key: string): void => {
        storage.delete(key);
    }
};
