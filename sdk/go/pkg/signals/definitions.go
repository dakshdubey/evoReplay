package signals

// SignalType defines the type of event captured
type SignalType int

const (
	BRANCH       SignalType = 1
	SWITCH       SignalType = 2
	EXCEPTION    SignalType = 3
	TIME         SignalType = 4
	RANDOM       SignalType = 5
	IO_READ      SignalType = 6
	CTX_START    SignalType = 7
	CTX_END      SignalType = 8
	DECISION     SignalType = 9
)

// Signal represents a single captured event
type Signal struct {
	Type  SignalType  `json:"type"`
	Val   interface{} `json:"val,omitempty"`
	Label string      `json:"label,omitempty"`
	Ctx   string      `json:"ctx,omitempty"`
	TS    int64       `json:"ts"`
}
