const evoreplay = require('../src/index');

// 1. Initialize
evoreplay.init();

// 2. Run a "request"
async function main() {
    const runner = evoreplay.startRecording('req-test-1');

    await runner.run(async () => {
        console.log('--- Start Context ---');

        // Test Time Hook
        const now = Date.now();
        console.log(`Current Time: ${now}`);

        // Test Random Hook
        const rand = Math.random();
        console.log(`Random Value: ${rand}`);

        // Test Manual Decision
        evoreplay.captureDecision('is_lucky', () => {
            return rand > 0.5;
        });

        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 50));

        console.log('--- End Context ---');
    });

    // 3. Stop and inspect
    const artifact = await evoreplay.stopRecording();
    console.log('\nGenerated Artifact:');
    console.log(artifact);
}

main();
