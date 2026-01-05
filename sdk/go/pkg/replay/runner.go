package replay

import (
	"context"
	"fmt"

	"github.com/evoreplay/go-sdk/pkg/adapter"
)

// Run executes the given entrypoint in Replay Mode
func Run(ctx context.Context, artifactData []byte, entryPoint func(context.Context)) error {
	rec := adapter.Get()
	
	fmt.Println("[EvoReplay] Loading Artifact...")
	if err := rec.LoadArtifact(artifactData); err != nil {
		return err
	}
	
	fmt.Println("[EvoReplay] Replaying...")
	entryPoint(ctx)
	
	fmt.Println("[EvoReplay] Done.")
	return nil
}
