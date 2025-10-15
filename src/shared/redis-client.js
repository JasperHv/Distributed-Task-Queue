// src/shared/redis-client.js

import { createClient } from 'redis';
import config from './config.js';

let client = null;

export async function getRedisClient() {
    if (client) {
        return client;
    }
  
    client = createClient({
        url: config.redisUrl
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
    

    await client.connect();    
    return client;
}

export async function closeRedisClient() {
    if (client) {
        await client.quit();
        client = null;
        console.log('[Redis] Connection closed');
    }
}