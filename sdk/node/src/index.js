/**
 * EvoReplay Node.js SDK - Public API (Production Grade)
 */
const { recorder, EvoRecorder } = require('./adapter/recorder');
const { instrumentTime } = require('./adapter/hooks/time');
const { instrumentRandom } = require('./adapter/hooks/random');
const { SignalType } = require('./signals/definitions');

const EvoReplay = {
    /**
     * Initialize the SDK (Production Mode)
     * @param {Object} config
     */
    init: (config = {}) => {
        // Default to strict privacy and production mode
        const mode = config.mode || 'production';
        const privacy = config.privacy || 'strict';

        console.log(`[EvoReplay] Initializing in ${mode} mode (Privacy: ${privacy})`);

        // In production, we default to enabled.
        instrumentTime();
        instrumentRandom();
    },

    /**
     * Start a recording session manually
     * @param {string} contextId
     */
    startRecording: (contextId = 'default') => {
        recorder.start();
        return {
            run: (fn) => recorder.run(contextId, fn)
        };
    },

    /**
     * Stop recording and flush artifact
     * @returns {Promise<string>}
     */
    stopRecording: async () => {
        const artifact = recorder.stop();
        return artifact;
    },

    /**
     * Capture a manual decision point
     * @param {string} label 
     * @param {Function} fn 
     */
    captureDecision: (label, fn) => {
        const ctx = EvoRecorder.getContext();
        const result = fn();

        if (ctx && ctx.recording) {
            recorder.record({
                type: SignalType.DECISION,
                label,
                val: result
            });
        }
        return result;
    },

    SignalType
};

module.exports = { EvoReplay };
