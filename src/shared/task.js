// src/shared/task.js
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from './helpers/task-status.js';

/**
 * Validates task input parameters before creation
 */
export function validateTaskInput({ type, payload, dependencies = [] }) {
    if (!type || typeof type !== 'string') throw new Error('Task must have a valid type (string)');
    if (payload === undefined || payload === null) throw new Error('Task must have payload');
    if (!Array.isArray(dependencies)) throw new Error('Task dependencies must be an array');
    
    return true;
}

/**
 * Creates a new task object
 */
export function createTask({ type, payload, dependencies = [] }) {
    // Validate input before creating task
    validateTaskInput({ type, payload, dependencies });
    
    return {
        task_id: uuidv4(),
        type,
        payload,
        dependencies,
        vector_clock: null,
        status: TaskStatus.SUBMITTED,
        assigned_to: null,
        created_at: Date.now(),
        completed_at: null,
        result: null,
        error: null
    };
}
