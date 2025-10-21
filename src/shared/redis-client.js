// src/shared/redis-client.js

import { createClient } from 'redis';
import config from './config.js';

// Module-level state
let client = null;
let connectionPromise = null;
let isClosing = false;

// Track whether shutdown handlers have been registered (singleton pattern)
let shutdownHandlersRegistered = false;

// Configuration constants
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000;    // 30 seconds
const CONNECTION_TIMEOUT = 10000;  // 10 seconds
const ALERT_AFTER_RETRIES = 5;     // Log loudly after this many retries

/**
 * Core connection function - handles the actual Redis connection logic
 * @returns {Promise<RedisClient>} Connected Redis client
 */
async function connectToRedis() {
    try {
        console.log(`[Redis] Connecting to ${config.redisUrl}...`);
        
        // Create client instance
        const newClient = createClient({
            url: config.redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    const delay = Math.min(
                        INITIAL_RETRY_DELAY * Math.pow(2, retries), 
                        MAX_RETRY_DELAY
                    );
                    
                    // Log prominently if retrying many times
                    if (retries > ALERT_AFTER_RETRIES) {
                        console.error(
                            `[Redis] ⚠️  Still retrying after ${retries} attempts ` +
                            `(next attempt in ${delay}ms)`
                        );
                    } else {
                        console.log(`[Redis] Retry ${retries} in ${delay}ms`);
                    }
                    
                    // Always return a delay - never give up on reconnection
                    return delay;
                }
            }
        });
        
        // Set up event handlers BEFORE connecting
        newClient.on('error', (err) => {
            console.error(`[Redis] Error: ${err.message}`);
            // In development, show stack trace for debugging
            if (config.nodeEnv === 'development') {
                console.error('[Redis] Stack trace:', err.stack);
            }
        });
        
        newClient.on('connect', () => {
            console.log(`[Redis] ✓ Connected to ${config.redisUrl}`);
        });
        
        newClient.on('ready', () => {
            console.log('[Redis] ✓ Client ready to accept commands');
        });
        
        newClient.on('reconnecting', () => {
            console.log('[Redis] ↻ Reconnecting...');
        });
        
        newClient.on('end', () => {
            console.log('[Redis] Connection ended');
        });

        // Connect with timeout protection
        const connectPromise = newClient.connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(
                () => reject(new Error(`Redis connection timeout after ${CONNECTION_TIMEOUT}ms`)), 
                CONNECTION_TIMEOUT
            )
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        
        // Verify connection is actually working
        const pingResult = await newClient.ping();
        console.log(`[Redis] ✓ Connection verified (ping: ${pingResult})`);
        
        return newClient;
        
    } catch (error) {
        console.error(`[Redis] ✗ Failed to connect: ${error.message}`);
        throw error;
    }
}

/**
 * Get Redis client instance (creates connection on first call, reuses thereafter)
 * Thread-safe: Multiple concurrent calls will wait for the same connection
 * Automatically registers shutdown handlers on first call
 * @returns {Promise<RedisClient>} Connected Redis client
 */
export async function getRedisClient() {
    // Ensure shutdown handlers are registered (idempotent)
    ensureShutdownHandlers();
    
    // Fast path: return existing connected client
    if (client && client.isOpen) {
        return client;
    }
    
    // Prevent connecting while shutting down
    if (isClosing) {
        throw new Error('Cannot connect to Redis: client is shutting down');
    }
    
    // If connection is in progress, wait for it
    if (connectionPromise) {
        console.log('[Redis] Connection in progress, waiting...');
        return connectionPromise;
    }
    
    // Start new connection
    connectionPromise = (async () => {
        try {
            client = await connectToRedis();
            return client;
        } catch (error) {
            // Clear client on failure so next call will retry
            client = null;
            throw error;
        } finally {
            // Clear promise so subsequent calls can try again
            connectionPromise = null;
        }
    })();
    
    return connectionPromise;
}

/**
 * Close Redis connection gracefully
 * Safe to call multiple times
 */
export async function closeRedisClient() {
    // Prevent concurrent close attempts
    if (isClosing) {
        console.log('[Redis] Close already in progress, waiting...');
        while (isClosing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }
    
    if (!client) {
        console.log('[Redis] No client to close');
        return;
    }
    
    isClosing = true;
    
    try {
        if (client.isOpen) {
            console.log('[Redis] Closing connection gracefully...');
            await client.quit(); // Graceful shutdown - waits for pending commands
            console.log('[Redis] ✓ Connection closed gracefully');
        } else {
            console.log('[Redis] Client already closed');
        }
    } catch (error) {
        console.error(`[Redis] Error during graceful close: ${error.message}`);
        
        // Force disconnect if graceful close fails
        try {
            await client.disconnect();
            console.log('[Redis] ✓ Connection force-closed');
        } catch (disconnectError) {
            console.error(`[Redis] ✗ Force disconnect failed: ${disconnectError.message}`);
        }
    } finally {
        client = null;
        connectionPromise = null;
        isClosing = false;
    }
}

/**
 * Check if Redis connection is healthy
 * @returns {Promise<boolean>} True if Redis is responding
 */
export async function isRedisHealthy() {
    try {
        if (!client || !client.isOpen) {
            return false;
        }
        await client.ping();
        return true;
    } catch (error) {
        console.error(`[Redis] Health check failed: ${error.message}`);
        return false;
    }
}

/**
 * Get Redis connection statistics
 * Useful for monitoring and debugging
 * @returns {Object} Connection stats
 */
export function getRedisStats() {
    return {
        isConnected: client?.isOpen || false,
        isConnecting: connectionPromise !== null,
        isClosing: isClosing,
        clientExists: client !== null
    };
}

/**
 * Internal function to ensure shutdown handlers are registered
 * Called automatically on first getRedisClient() call
 * Idempotent - safe to call multiple times
 */
function ensureShutdownHandlers() {
    if (shutdownHandlersRegistered) {
        return; // Already registered, skip
    }
    
    shutdownHandlersRegistered = true;
    
    const gracefulShutdown = async (signal) => {
        console.log(`\n[Redis] Received ${signal}, initiating graceful shutdown...`);
        try {
            await closeRedisClient();
            console.log('[Redis] ✓ Graceful shutdown complete');
        } catch (error) {
            console.error(`[Redis] ✗ Error during shutdown: ${error.message}`);
            process.exit(1);
        }
    };
    
    // Handle various termination signals
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
    process.once('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
    
    // Handle uncaught errors
    process.once('uncaughtException', async (error) => {
        console.error('[Redis] Uncaught exception:', error);
        await closeRedisClient();
        process.exit(1);
    });
    
    console.log('[Redis] Shutdown handlers registered automatically');
}

/**
 * Manual shutdown handler setup (optional - for explicit control)
 * Generally not needed since handlers auto-register on first connection
 */
export function setupRedisShutdownHandlers() {
    ensureShutdownHandlers();
}