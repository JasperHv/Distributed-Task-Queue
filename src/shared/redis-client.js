// src/shared/redis-client.js

import { createClient } from 'redis';
import config from './config.js';

let client = null;
const maxRetries = 5;
const retryDelay = 1000; // Initial delay in ms

export async function getRedisClient() {
    if (client && client.isOpen) {
        return client;
    }
  
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
    });

    await client.connect();    
    return client;
}

export async function closeRedisClient() {
    if (client) {
        try {
            if (client.isOpen) {
                await client.quit();
            }
            console.log('[Redis] Connection closed gracefully');
        } catch (error) {
            console.error(`[Redis] Error during close: ${error.message}`);
            client.disconnect();
        } finally {
            client = null;
        }
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