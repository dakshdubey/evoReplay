package adapter

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/evoreplay/go-sdk/pkg/encoder"
	"github.com/evoreplay/go-sdk/pkg/signals"
)

type Mode int

const (
	IDLE Mode = iota
	RECORDING
	REPLAYING
)

// Recorder manages state
type Recorder struct {
	mode        int32 // Atomic Mode
	encoder     *encoder.Encoder
	replayQueue []signals.Signal
	replayIndex int32 // Atomic index
	mu          sync.RWMutex
}

var globalRecorder = &Recorder{
	mode:    int32(IDLE),
	encoder: encoder.NewEncoder(),
}

// GetRecorder returns singleton
func Get() *Recorder {
	return globalRecorder
}

func (r *Recorder) Start() {
	r.encoder = encoder.NewEncoder()
	atomic.StoreInt32(&r.mode, int32(RECORDING))
}

func (r *Recorder) Stop() []byte {
	atomic.StoreInt32(&r.mode, int32(IDLE))
	return r.encoder.Flush()
}

func (r *Recorder) LoadArtifact(data []byte) error {
	var artifact struct {
		Signals []signals.Signal `json:"signals"`
	}
	if err := json.Unmarshal(data, &artifact); err != nil {
		return err
	}
	
	r.mu.Lock()
	r.replayQueue = artifact.Signals
	atomic.StoreInt32(&r.replayIndex, 0)
	r.mu.Unlock()
	
	atomic.StoreInt32(&r.mode, int32(REPLAYING))
	return nil
}

// Intercept handles logic for Record vs Replay (Generic hooks not as easy in Go, using empty interface)
func (r *Recorder) Intercept(typ signals.SignalType, generator func() interface{}) interface{} {
	mode := Mode(atomic.LoadInt32(&r.mode))

	if mode == IDLE {
		return generator()
	}

	if mode == RECORDING {
		val := generator()
		r.Record(signals.Signal{Type: typ, Val: val})
		return val
	}

	if mode == REPLAYING {
		idx := atomic.AddInt32(&r.replayIndex, 1) - 1
		r.mu.RLock()
		defer r.mu.RUnlock()
		
		if int(idx) >= len(r.replayQueue) {
			// Fallback if out of signals
			return generator()
		}
		
		sig := r.replayQueue[idx]
		
		// Simple type check (ignoring divergence handling for MVP)
		if sig.Type == typ {
			return sig.Val
		}
		
		// If mismatch, we might want to panic or log. For now, pass through.
		fmt.Printf("divergence: expected %v got %v\n", typ, sig.Type)
		return generator()
	}
	
	return generator()
}

func (r *Recorder) Record(sig signals.Signal) {
	r.encoder.Encode(sig)
}
