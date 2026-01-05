/**
 * Hook: Time
 * Uses recorder.intercept()
 */
const { recorder } = require('../recorder');
const { SignalType } = require('../../signals/definitions');

const originalDate = global.Date;
const originalNow = global.Date.now;

function instrumentTime() {
    class InstrumentedDate extends originalDate {
        constructor(...args) {
            if (args.length === 0) {
                const val = recorder.intercept(SignalType.TIME, () => originalNow.call(originalDate));
                super(val);
            } else {
                super(...args);
            }
        }

        static now() {
            return recorder.intercept(SignalType.TIME, () => originalNow.call(originalDate));
        }
    }

    Object.getOwnPropertyNames(originalDate).forEach(key => {
        if (key !== 'now' && key !== 'prototype' && key !== 'length' && key !== 'name') {
            try { InstrumentedDate[key] = originalDate[key]; } catch (e) { }
        }
    });

    global.Date = InstrumentedDate;
}

module.exports = { instrumentTime };
