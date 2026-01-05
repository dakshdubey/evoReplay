package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/evoreplay/go-sdk/pkg/adapter"
	"github.com/evoreplay/go-sdk/pkg/signals"
)

func main() {
	recordCmd := flag.NewFlagSet("record", flag.ExitOnError)
	replayCmd := flag.NewFlagSet("replay", flag.ExitOnError)

	if len(os.Args) < 2 {
		fmt.Println("expected 'record' or 'replay' subcommands")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "record":
		recordCmd.Parse(os.Args[2:])
		runRecord()
	case "replay":
		replayCmd.Parse(os.Args[2:])
		if replayCmd.NArg() < 1 {
			fmt.Println("usage: evoreplay replay <artifact_path>")
			os.Exit(1)
		}
		runReplay(replayCmd.Arg(0))
	default:
		fmt.Println("expected 'record' or 'replay' subcommands")
		os.Exit(1)
	}
}

// Simulated App Logic
func appLogic(ctx context.Context) {
	rec := adapter.Get()
	
	// Intercept Time
	tVal := rec.Intercept(signals.TIME, func() interface{} {
		return time.Now().UnixMicro()
	}).(int64) // Need generic casting in Go or wrapper methods
	
	fmt.Printf("App Logic: Captured Time %d\n", tVal)

	// Intercept Random
	rVal := rec.Intercept(signals.RANDOM, func() interface{} {
		return rand.Intn(100)
	}).(int) // Cast from json Unmarshal (will be float64 usually) - simple hack for MVP

	// Fix JSON number type issue in replay
	if f, ok := interface{}(rVal).(float64); ok {
		rVal = int(f)
	}

	fmt.Printf("App Logic: Captured Random %d\n", rVal)
}

func runRecord() {
	rec := adapter.Get()
	rec.Start()
	
	fmt.Println("--- Recording Start ---")
	appLogic(context.Background())
	fmt.Println("--- Recording End ---")
	
	data := rec.Stop()
	err := os.WriteFile("artifact.evor", data, 0644)
	if err != nil {
		panic(err)
	}
	fmt.Println("Saved to artifact.evor")
}

func runReplay(path string) {
	rec := adapter.Get()
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	
	err = rec.LoadArtifact(data)
	if err != nil {
		panic(err)
	}
	
	fmt.Println("--- Replay Start ---")
	appLogic(context.Background())
	fmt.Println("--- Replay End ---")
}
