/**
 * Adapter: Recorder & Replay Engine
 * unified entry point for signal interception.
 */
const { AsyncLocalStorage } = require('async_hooks');
const { EvoEncoder } = require('../encoder/index');
const { SignalType } = require('../signals/definitions');

const storage = new AsyncLocalStorage();

class EvoRecorder {
    constructor() {
        this.encoder = new EvoEncoder();
        this.mode = 'IDLE'; // IDLE, RECORDING, REPLAYING
        this.replayQueue = [];
        this.currentIndex = 0;
    }

    start() {
        this.mode = 'RECORDING';
        this.encoder = new EvoEncoder(); // Reset
    }

    loadArtifact(artifact) {
        this.mode = 'REPLAYING';
        this.replayQueue = artifact.signals;
        this.currentIndex = 0;
    }

    stop() {
        const artifact = this.encoder.flush();
        this.mode = 'IDLE';
        return artifact;
    }

    /**
     * Universal hook for Determinism
     * @param {number} type SignalType
     * @param {Function} generatorFn Original function to get value (only called in Record/Idle mode)
     */
    intercept(type, generatorFn) {
        if (this.mode === 'IDLE') return generatorFn();

        const store = storage.getStore();
        // In Replay, we might want to respect context, but for MVP we assume single-threaded replay

        if (this.mode === 'RECORDING') {
            const val = generatorFn();
            // Only record if we are in a context OR if it's a global determinism event we care about implicitly
            // specific logic: if store.recording is true
            if (store && store.recording) {
                this.encoded({ type, val, ctx: store.id });
            }
            return val;
        }

        if (this.mode === 'REPLAYING') {
            // Simple linear replay
            // Skip non-determinism signals that don't match current type (filtering)
            // But strictly for this MVP, we assume 1:1 match
            /* 
               Robustness Note: In production, we'd skip signals from other contexts.
               Here we assume single-context replay.
            */
            const signal = this.replayQueue[this.currentIndex];

            if (!signal) {
                console.warn(`[Replay] End of stream reached, generating new value.`);
                return generatorFn();
            }

            if (signal.type === type) {
                this.currentIndex++;
                return signal.val;
            }

            // If type mismatch, it might be a signal we didn't record or a divergence.
            // For MVP: Pass through if mismatch (assume un-instrumented call) or crash?
            // Let's return generatorFn() if it's not the signal we expect, assuming interleaved noise.
            // But wait, if we call Time() and next signal is Random(), we should not consume Random().
            // We should return generatorFn().

            return generatorFn();
        }
    }

    // Internal
    encoded(signal) {
        this.encoder.encode(signal);
    }

    run(contextId, fn) {
        const store = {
            id: contextId,
            recording: this.mode === 'RECORDING'
        };

        return storage.run(store, () => {
            if (this.mode === 'RECORDING') {
                this.encoded({ type: SignalType.CTX_START, ctx: contextId });
            }
            try {
                return fn();
            } finally {
                if (this.mode === 'RECORDING') {
                    this.encoded({ type: SignalType.CTX_END, ctx: contextId });
                }
            }
        });
    }
}

const globalRecorder = new EvoRecorder();

module.exports = {
    EvoRecorder,
    recorder: globalRecorder
};
