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