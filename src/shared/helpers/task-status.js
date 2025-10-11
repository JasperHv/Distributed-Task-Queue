// src/shared/helpers/task-status.js

/**
 * Task statuses:
 * - submitted: Client created, not yet seen by coordinator
 * - pending: Coordinator received, ready to assign
 * - running: Worker is processing
 * - completed: Successfully finished
 * - failed: Error occurred
 */
export const TaskStatus = {
  SUBMITTED: 'submitted',
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};