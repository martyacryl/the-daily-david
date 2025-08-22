// Neon Database Client for Browser
import { neon } from '@neondatabase/serverless';

// Export the neon function for use in the browser
window.neonClient = neon;

// Also export it as a global function for backward compatibility
window.neon = neon;

console.log('✅ [NEON] Client loaded and exported to window.neonClient and window.neon');
