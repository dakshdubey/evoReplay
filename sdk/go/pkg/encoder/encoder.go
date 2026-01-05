package encoder

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/evoreplay/go-sdk/pkg/signals"
)

// Encoder manages the signal buffer
type Encoder struct {
	mu      sync.Mutex
	buffer  []signals.Signal
}

// NewEncoder creates a new thread-safe encoder
func NewEncoder() *Encoder {
	return &Encoder{
		buffer: make([]signals.Signal, 0, 1024), // Pre-allocate
	}
}

// Encode appends a signal to the buffer
func (e *Encoder) Encode(sig signals.Signal) {
	// PII redaction would happen here
	sig.TS = time.Now().UnixMicro()
	
	e.mu.Lock()
	e.buffer = append(e.buffer, sig)
	e.mu.Unlock()
}

// Flush returns the artifacts and resets buffer
func (e *Encoder) Flush() []byte {
	e.mu.Lock()
	defer e.mu.Unlock()

	data, _ := json.MarshalIndent(map[string]interface{}{
		"version": 1,
		"signals": e.buffer,
	}, "", "  ")

	e.buffer = make([]signals.Signal, 0, 1024)
	return data
}
