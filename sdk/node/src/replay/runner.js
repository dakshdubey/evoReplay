/**
 * Replay Runner
 * Orchestrates the replay of an artifact.
 */
const { recorder } = require('../adapter/recorder');
const { init } = require('../index');

class ReplayRunner {
    constructor(artifact) {
        this.artifact = typeof artifact === 'string' ? JSON.parse(artifact) : artifact;
    }

    /**
     * Run the replay
     * @param {Function} entryPoint - The application function to re-execute
     */
    async run(entryPoint) {
        console.log('[EvoReplay] Starting Replay Session...');

        // 1. Initialize SDK (Hooks)
        init();

        // 2. Load Artifact
        recorder.loadArtifact(this.artifact);

        // 3. Execute
        try {
            console.log('[EvoReplay] Executing application logic in REPLAY mode.');
            await entryPoint();
        } catch (e) {
            console.error('[EvoReplay] Replay Execution Error:', e);
        }

        console.log('[EvoReplay] Replay Finished.');
    }
}

module.exports = { ReplayRunner };
