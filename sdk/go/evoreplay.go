package evoreplay

import (
	"github.com/evoreplay/go-sdk/pkg/adapter"
	"github.com/evoreplay/go-sdk/pkg/signals"
)

// Public API Wrapper

// Start initializes the global recorder
func Start() {
	adapter.Get().Start()
}

// Stop halts recording and returns the artifact
func Stop() []byte {
	return adapter.Get().Stop()
}

// Intercept captures a value deterministically
func Intercept(typ signals.SignalType, generator func() interface{}) interface{} {
	return adapter.Get().Intercept(typ, generator)
}
