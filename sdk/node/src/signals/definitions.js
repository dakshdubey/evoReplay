/**
 * Signal Type Definitions
 * Matches the binary spec in API_SPECIFICATION.md
 */

const SignalType = {
    // Control Flow
    BRANCH: 1,      // 0x01
    SWITCH: 2,      // 0x02
    EXCEPTION: 3,   // 0x03

    // Determinism
    TIME: 4,        // 0x04
    RANDOM: 5,      // 0x05

    // I/O & Context
    IO_READ: 6,     // 0x06
    CTX_START: 7,   // 0x07
    CTX_END: 8,     // 0x08
    DECISION: 9     // 0x09 - Manual Capture
};

module.exports = { SignalType };
