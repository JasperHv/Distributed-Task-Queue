// test-redis.js

import { getRedisClient, closeRedisClient } from '../src/shared/redis-client.js';

async function testRedis() {
    try {
        console.log('Testing Redis connection...');
        
        const redis = await getRedisClient();
        console.log('✓ Connected');
        
        // Test basic operations
        await redis.set('test:key', 'hello world');
        console.log('✓ SET successful');
        
        const value = await redis.get('test:key');
        console.log(`✓ GET successful: ${value}`);
        
        // Test hash operations (for your tasks)
        await redis.hSet('test:task:1', {
            status: 'completed',
            result: '42',
            worker: 'test-worker'
        });
        console.log('✓ HSET successful');
        
        const task = await redis.hGetAll('test:task:1');
        console.log('✓ HGETALL successful:', task);
        
        // Cleanup
        await redis.del('test:key');
        await redis.del('test:task:1');
        console.log('✓ Cleanup successful');
        
        await closeRedisClient();
        console.log('✓ Connection closed');
        
        console.log('\n🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testRedis();
