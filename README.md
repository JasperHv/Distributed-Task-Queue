# Distributed-Task-Queue
This repo is about this task queue project that I am making to help my knowledge of Distributed Systems as taught in the Fundamentals of Software Systems master course I am following.

# Project Overview
This project implements a distributed task queue with:

- Coordinator: Assigns tasks to workers via message queue
- Workers: Process tasks independently and concurrently
- RabbitMQ: Message broker for reliable task distribution
- Redis: Distributed state storage (to be implemented)
## Phase 1 - Basic Message Passing

### Architecture
```txt
Coordinator → RabbitMQ Queue → [Worker-1, Worker-2, Worker-3]
```

Currently I have a basic message passing system implementation with:

#### Coordinator
- Connects to RabbitMQ using AMQP protocol
- Sends 10 sequential messages through a durable queue
- Uses centralized configuration from `src/shared/config.js`

#### Worker(s)
- Three worker instances connect to the same RabbitMQ queue
- Each worker receives and processes messages from the shared queue
- Workers acknowledge message processing after completion

### Message Distribution Pattern

The current system demonstrates **round-robin distribution** but **no ordering guarantees**:

**Coordinator sends (in order):**
```
[coordinator] Sent: 'Message 1'
[coordinator] Sent: 'Message 2'
[coordinator] Sent: 'Message 3'
[coordinator] Sent: 'Message 4'
[coordinator] Sent: 'Message 5'
[coordinator] Sent: 'Message 6'
[coordinator] Sent: 'Message 7'
[coordinator] Sent: 'Message 8'
[coordinator] Sent: 'Message 9'
[coordinator] Sent: 'Message 10'
```

**Workers receive (distributed but processed out of order):**
```
worker-1: Received: Message 1
worker-2: Received: Message 2
worker-3: Received: Message 3
worker-1: Received: Message 4
worker-2: Received: Message 5
worker-3: Received: Message 6
worker-1: Received: Message 7
worker-2: Received: Message 8
worker-3: Received: Message 9
worker-1: Received: Message 10
```

### Key Observations
1. **Round-Robin Distribution**: Messages are fairly distributed across available workers
2. **No Causal Ordering**: Processing completion happens out-of-order due to:
- Varying worker processing speeds
- Network latency differences
- Concurrent execution
3. **No Dependency Handling**: System cannot handle tasks that depend on other tasks completing first

## Roadmap

### Phase 2: Task Structure & Execution (Next)

- Define task schema with metadata
- Implement different task types (compute, I/O, sleep)
- Add task result storage in Redis
- Build REST API for task submission

### Phase 3: Vector Clocks & Causal Ordering

- Implement vector clock mechanism (Lecture 2 concepts)
- Add task dependency tracking
- Ensure dependent tasks execute in correct order
- Handle causality violations

### Phase 4: Leader Election

- Implement coordinator leader election using Redis
- Handle coordinator failures
- Automatic failover to backup coordinator

### Phase 5: Fault Tolerance

- Worker heartbeat mechanism
- Detect and handle worker failures
- Task reassignment on worker crash
- Idempotent task execution

## (planned) Project Structure
distributed-task-queue/
├── src/
│   ├── coordinator/     # Task assignment logic
│   ├── worker/          # Task execution logic
│   ├── client/          # REST API for task submission
│   └── shared/          # Shared config, utilities
├── docker-compose.yml   # Infrastructure setup
├── Dockerfile           # Node.js container
├── package.json         # Dependencies

## Course Concepts Demonstrated
* Distributed Communication