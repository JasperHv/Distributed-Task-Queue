// src/shared/redis-client.js

import { createClient } from 'redis';
import config from './config.js';

let client = null;
let isConnecting = false;
let isClosing = false;
const maxRetries = 5;
const retryDelay = 1000; // Initial delay in ms

export async function getRedisClient() {
    // Return existing client if available and open
    if (client && client.isOpen) {
        return client;
    }
    
    // Prevent multiple concurrent connection attempts
    if (isConnecting) {
        // Wait for the current connection attempt to complete
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Check again after waiting
        if (client && client.isOpen) {
            return client;
        }
    }
    
    // Prevent connecting while closing
    if (isClosing) {
        throw new Error('Cannot connect while Redis client is closing');
    }
    
    isConnecting = true;
    
    try {
        client = createClient({
            url: config.redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > maxRetries) {
                        console.error(`[Redis] Max retries (${maxRetries}) exceeded, giving up`);
                        return false; // Stop retrying
                    }
                    const delay = Math.min(retryDelay * Math.pow(2, retries), 10000); // Exponential backoff, max 10s
                    console.log(`[Redis] Retry ${retries}/${maxRetries} in ${delay}ms`);
                    return delay;
                }
            }
        });
        
        client.on('error', (err) => {
            console.error(`[Redis Error] ${err.message}`);
            // Don't exit process on Redis errors in production
            if (config.nodeEnv === 'development') {
                console.error('[Redis] Stack trace:', err.stack);
            }
        });
        
        client.on('connect', () => {
            console.log(`[Redis] Connected to ${config.redisUrl}`);
        });
        
        client.on('reconnecting', () => {
            console.log('[Redis] Reconnecting...');
        });
        
        client.on('end', () => {
            console.log('[Redis] Connection ended');
            client = null;
            isConnecting = false;
            isClosing = false;
        });

        // Connect with timeout protection
        const connectPromise = client.connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Redis connection timeout')), 10000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        
        // Verify connection with ping
        await client.ping();
        console.log('[Redis] Connection verified with ping');
        
        return client;
        
    } catch (error) {
        console.error(`[Redis] Failed to connect: ${error.message}`);
        client = null;
        throw error;
    } finally {
        isConnecting = false;
    }
}

export async function closeRedisClient() {
    // Prevent multiple concurrent close attempts
    if (isClosing) {
        // Wait for current close to complete
        while (isClosing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }
    
    if (!client) {
        return; // Already closed or never opened
    }
    
    isClosing = true;
    
    try {
        if (client.isOpen) {
            await client.quit();
            console.log('[Redis] Connection closed gracefully');
        }
    } catch (error) {
        console.error(`[Redis] Error during close: ${error.message}`);
        // Force disconnect if quit fails
        try {
            client.disconnect();
            console.log('[Redis] Connection force disconnected');
        } catch (disconnectError) {
            console.error(`[Redis] Force disconnect failed: ${disconnectError.message}`);
        }
    } finally {
        client = null;
        isClosing = false;
    }
}

// Health check function
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

// Graceful shutdown handler
export function setupRedisShutdownHandlers() {
    const gracefulShutdown = async (signal) => {
        console.log(`[Redis] Received ${signal}, closing Redis connection...`);
        await closeRedisClient();
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGQUIT', gracefulShutdown);
}