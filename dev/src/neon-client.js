// Neon Database Client for Browser
// Load from CDN since ES6 imports don't work in browser without bundler

// Global state to track when client is ready
window.neonClientReady = false;
window.neonClientPromise = null;

// Function to get the client (with retry logic)
window.getNeonClient = function() {
    if (window.neonClient && window.neonClientReady) {
        return window.neonClient;
    }
    
    // If not ready, wait for it
    if (window.neonClientPromise) {
        return window.neonClientPromise;
    }
    
    // Create a promise that resolves when client is ready
    window.neonClientPromise = new Promise((resolve, reject) => {
        const checkClient = () => {
            if (window.neonClient && window.neonClientReady) {
                resolve(window.neonClient);
            } else if (window.neonClientLoadTimeout) {
                reject(new Error('Neon client failed to load within timeout'));
            } else {
                setTimeout(checkClient, 100);
            }
        };
        checkClient();
    });
    
    return window.neonClientPromise;
};

// Load the Neon client from CDN
const script = document.createElement('script');
script.src = 'https://unpkg.com/@neondatabase/serverless@1.0.1/dist/index.umd.js';
script.onload = function() {
    // Once loaded, set up the client
    if (window.NeonDatabase) {
        window.neonClient = window.NeonDatabase.neon;
        window.neon = window.NeonDatabase.neon;
        window.neonClientReady = true;
        console.log('✅ [NEON] Client loaded from CDN and exported to window.neonClient and window.neon');
    } else {
        console.error('❌ [NEON] Failed to load Neon client from CDN');
    }
};
script.onerror = function() {
    console.error('❌ [NEON] Failed to load Neon client script from CDN');
};

// Set a timeout for loading
window.neonClientLoadTimeout = setTimeout(() => {
    if (!window.neonClientReady) {
        console.error('❌ [NEON] Client load timeout - falling back to mock client');
        // Fallback mock client for development
        window.neonClient = {
            query: async () => {
                console.warn('⚠️ [NEON] Using mock client - database not available');
                return { rows: [] };
            }
        };
        window.neon = window.neonClient;
        window.neonClientReady = true;
    }
}, 5000); // 5 second timeout

document.head.appendChild(script);

// Fallback: try to use existing global if already loaded
if (window.NeonDatabase && window.NeonDatabase.neon) {
    window.neonClient = window.NeonDatabase.neon;
    window.neon = window.NeonDatabase.neon;
    window.neonClientReady = true;
    console.log('✅ [NEON] Client already available, exported to window.neonClient and window.neon');
}
