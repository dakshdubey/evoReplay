const evoreplay = require('../src/index');
const assert = require('assert');

// Simple test runner
async function runTest() {
    console.log('Test: Determinism Check');

    const ctxId = 'test-det-1';
    let recordedRandom = 0;

    // 1. Record
    const runner = evoreplay.startRecording(ctxId);
    await runner.run(() => {
        recordedRandom = Math.random();
    });
    const artifact = await evoreplay.stopRecording();
    const artifactObj = JSON.parse(artifact);

    assert.ok(artifactObj.signals.length > 0, "Artifact should have signals");

    // 2. Replay (Simulation)
    // In a real test, we would run a separate process.
    // Here we inspect the artifact to ensure the random value was captured.

    const randomSignal = artifactObj.signals.find(s => s.type === 5); // RANDOM
    assert.strictEqual(randomSignal.val, recordedRandom, "Recorded random value matches execution");

    console.log('PASS');
}

runTest().catch(e => {
    console.error('FAIL', e);
    process.exit(1);
});
