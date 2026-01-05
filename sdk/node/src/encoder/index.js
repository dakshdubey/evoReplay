/**
 * Encoder: Serializes execution signals
 * Compliant with schemas/artifact.schema.json
 */

const originalNow = Date.now;

class EvoEncoder {
    constructor() {
        this.buffer = [];
    }

    encode(signal) {
        this.buffer.push({
            ...signal,
            ts: originalNow.call(Date)
        });
    }

    flush() {
        // Transform flat buffer into structured .evor format
        // For MVP, we map flat stream to the required sections

        const executionGraph = this.buffer
            .filter(s => s.type === 1 || s.type === 2 || s.type === 9) // BRANCH, SWITCH, DECISION
            .map(s => ({
                id: s.label || 'unknown',
                type: s.type === 9 ? 'DECISION' : 'BRANCH',
                decision: s.val
            }));

        const determinismMap = this.buffer
            .filter(s => s.type === 4 || s.type === 5) // TIME, RANDOM
            .map(s => ({
                type: s.type === 4 ? 'TIME' : 'RANDOM',
                val: s.val
            }));

        const artifact = JSON.stringify({
            magic: "EVOR",
            version: 1,
            metadata: {
                timestamp: originalNow.call(Date),
                runtime: "node",
                app_hash: "sha256:simulated"
            },
            execution_graph: executionGraph,
            determinism_map: determinismMap,
            signals: this.buffer // Keep raw stream for replay engine convenience
        }, null, 2);

        this.buffer = [];
        return artifact;
    }
}

module.exports = { EvoEncoder };
