// src/shared/task.js
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from './helpers/task-status.js';

/**
 * Creates a new task object
 */
export function createTask({ type, payload, dependencies = [] }) {
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

/**
 * Validates task structure
 */
export function validateTask(task) {
    if (!task.task_id) throw new Error('Task must have task_id');
    if (!task.type) throw new Error('Task must have type');
    if (!task.payload) throw new Error('Task must have payload');
    if (!Array.isArray(task.dependencies)) throw new Error('Task dependencies must be an array');
    if (!Object.values(TaskStatus).includes(task.status)) throw new Error('Invalid task status');

    return true;
}