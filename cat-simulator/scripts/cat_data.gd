class_name CatData
extends Resource
## Everything that makes one breed of cat different from another.
##
## This is a tuning file, not code: change the numbers in data/cats/*.tres and
## the game changes. It is the intended place to experiment.

@export var display_name: String = "Tabby"
@export var frames: SpriteFrames

@export_group("Decay (points per minute)")
## How fast each meter drains. At 1.5, hunger empties in a bit over an hour.
@export var hunger_decay := 1.5
@export var energy_decay := 1.0
@export var happiness_decay := 0.8

@export_group("Movement")
## Pixels per second. A tile is 32px, so 22 crosses a tile in ~1.5s.
@export var walk_speed := 22.0
## Seconds spent resting between walks, picked randomly in this range.
@export var rest_min := 1.5
@export var rest_max := 5.0
## Chance a rest is a sit rather than a stand, when the cat isn't tired.
@export_range(0.0, 1.0) var sit_chance := 0.35
