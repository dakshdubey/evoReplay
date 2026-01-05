#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ReplayRunner } = require('../replay/runner');

const cmd = process.argv[2];
const arg1 = process.argv[3];

async function main() {
    if (cmd === 'run') {
        if (!arg1) {
            console.error('Usage: evoreplay run <artifact.evor>');
            process.exit(1);
        }

        const artifactPath = path.resolve(arg1);
        const artifactContent = fs.readFileSync(artifactPath, 'utf-8');

        // For this demo, we assume the user provides an entrypoint script
        // In production, the artifact would specify the entrypoint or container
        const entryScript = process.argv[4];
        if (!entryScript) {
            console.error('Usage: evoreplay run <artifact.evor> <entry-script.js>');
            process.exit(1);
        }

        console.log(`Loading artifact: ${arg1}`);
        console.log(`Loading entrypoint: ${entryScript}`);

        const runner = new ReplayRunner(artifactContent);

        // Dynamically require the entry script
        // This script should export a 'main' or 'app' function, or just run.
        // If it just runs, we might need to intercept it differently.
        // For this SDK, let's assume it exports a function 'reproduce'.

        const targetModule = require(path.resolve(entryScript));
        if (typeof targetModule.reproduce !== 'function') {
            console.error('Error: Entry script must export `reproduce` function.');
            process.exit(1);
        }

        await runner.run(targetModule.reproduce);
    } else {
        console.log('EvoReplay CLI');
        console.log('Commands: run');
    }
}

main();
