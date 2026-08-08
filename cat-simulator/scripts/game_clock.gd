extends Node
## Autoloaded as `GameClock`. The single source of simulated time.
##
## Time does NOT pass while the game is closed -- that was a deliberate call, so
## a neglected cat never greets you in a miserable state. Needs only decay while
## the game is actually running.
##
## Systems listen to `ticked` rather than using their own `_process`, so that
## pausing and `time_scale` apply everywhere at once, and so tests can drive the
## simulation forward without waiting in real time.

signal ticked(delta: float)

## Multiplier on simulated time. Raise it to watch a day of decay in a minute
## while tuning rates; 1.0 is real time.
var time_scale: float = 1.0
var paused: bool = false
## Total seconds of simulated play. Persisted in the save.
var play_time: float = 0.0


func _process(delta: float) -> void:
	if paused:
		return
	advance(delta * time_scale)


## Push the simulation forward by hand. Used by tests, and by anything that
## needs to settle state without waiting for frames.
func advance(seconds: float) -> void:
	play_time += seconds
	ticked.emit(seconds)
