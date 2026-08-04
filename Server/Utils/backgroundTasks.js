/**
 * Resilient In-Memory Background Task Queue & Worker
 * 
 * Offloads non-critical, slow I/O operations (Cloudinary deletions, SMTP emails, etc.)
 * to background execution to ensure ultra-fast HTTP response times and zero user-facing latency.
 */

class BackgroundTaskManager {
    constructor(concurrency = 5) {
        this.queue = [];
        this.running = 0;
        this.concurrency = concurrency;
    }

    /**
     * Enqueue an async task to run in the background.
     * @param {string} taskName - Human-readable name of the task
     * @param {Function} taskFn - Async function to execute
     * @param {object} options - Optional config (maxRetries, retryDelayMs)
     */
    enqueue(taskName, taskFn, options = {}) {
        const { maxRetries = 2, retryDelayMs = 1500 } = options;

        this.queue.push({
            taskName,
            taskFn,
            retriesLeft: maxRetries,
            retryDelayMs,
            enqueuedAt: Date.now()
        });

        // Trigger worker processing on next tick
        setImmediate(() => this._processNext());
    }

    async _processNext() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        if (!task) return;

        this.running++;
        const startTime = Date.now();

        try {
            await task.taskFn();
            const duration = Date.now() - startTime;
            // Completed successfully
        } catch (err) {
            const duration = Date.now() - startTime;
            console.error(`[BackgroundTask] Task "${task.taskName}" failed after ${duration}ms:`, err.message);

            if (task.retriesLeft > 0) {
                task.retriesLeft--;
                console.log(`[BackgroundTask] Retrying "${task.taskName}" in ${task.retryDelayMs}ms (${task.retriesLeft} retries left)...`);
                setTimeout(() => {
                    this.queue.push(task);
                    this._processNext();
                }, task.retryDelayMs);
            }
        } finally {
            this.running--;
            this._processNext();
        }
    }
}

const backgroundQueue = new BackgroundTaskManager(5);

/**
 * Fire-and-forget background task runner
 * @param {string} taskName
 * @param {Function} asyncFn
 */
function runInBackground(taskName, asyncFn) {
    backgroundQueue.enqueue(taskName, asyncFn);
}

module.exports = {
    backgroundQueue,
    runInBackground
};
