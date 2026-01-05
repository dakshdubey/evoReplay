/**
 * Hook: Random
 * Uses recorder.intercept()
 */
const { recorder } = require('../recorder');
const { SignalType } = require('../../signals/definitions');

const originalRandom = Math.random;

function instrumentRandom() {
    Math.random = function () {
        return recorder.intercept(SignalType.RANDOM, () => originalRandom.call(Math));
    };
}

module.exports = { instrumentRandom };
