class_name Cat
extends Node2D
## A cat: wanders its room, drains its meters, and is the thing you look after.
##
## The node's own position is the cat's *feet*, not its centre -- the sprite is
## offset upward. That's the bottom-centre anchor convention everything uses, and
## it's what makes Y-sorting against furniture come out right.

enum State { REST, WALK }

## How close counts as arrived, in pixels.
const ARRIVE_EPSILON := 1.5
## Below Needs.URGENT energy the cat stops wandering and rests for longer.
const TIRED_REST_MULTIPLIER := 2.5

@export var data: CatData

var cat_id: String = "cat"
var needs: Needs = Needs.new()

var _state := State.REST
var _rest_left := 0.0
var _target := Vector2.ZERO
## Walkable area in pixels. Set by the room before the cat starts moving.
var _bounds := Rect2()
var _rng := RandomNumberGenerator.new()

@onready var _sprite: AnimatedSprite2D = $Sprite


func _ready() -> void:
	if data == null:
		data = CatData.new()
	_rng.randomize()
	if data.frames != null:
		_sprite.sprite_frames = data.frames
	GameClock.ticked.connect(_on_tick)
	_begin_rest()


## Confine the cat to `walkable` (pixels). Called by the room on spawn.
func set_bounds(walkable: Rect2) -> void:
	_bounds = walkable
	if _bounds.has_area():
		position = position.clamp(_bounds.position, _bounds.end)


func _on_tick(delta: float) -> void:
	needs.decay(
		delta / 60.0, data.hunger_decay, data.energy_decay, data.happiness_decay
	)
	match _state:
		State.WALK:
			_tick_walk(delta)
		State.REST:
			_tick_rest(delta)


func _tick_rest(delta: float) -> void:
	_rest_left -= delta
	if _rest_left <= 0.0:
		_begin_walk()


func _tick_walk(delta: float) -> void:
	var to_target := _target - position
	if to_target.length() <= ARRIVE_EPSILON:
		position = _target
		_begin_rest()
		return
	position += to_target.normalized() * data.walk_speed * delta
	# Art is drawn facing right; everything leftward is the same art mirrored.
	if absf(to_target.x) > 0.5:
		_sprite.flip_h = to_target.x < 0.0


func _begin_rest() -> void:
	_state = State.REST
	var tired := needs.energy < Needs.URGENT
	_rest_left = _rng.randf_range(data.rest_min, data.rest_max)
	if tired:
		_rest_left *= TIRED_REST_MULTIPLIER
	# A tired cat sits; a rested one mostly stands and looks around.
	var sitting := tired or _rng.randf() < data.sit_chance
	_play(&"sit" if sitting else &"idle")


func _begin_walk() -> void:
	if not _bounds.has_area():
		# No room to walk in yet -- rest again rather than wander to (0, 0).
		_begin_rest()
		return
	_state = State.WALK
	_target = Vector2(
		_rng.randf_range(_bounds.position.x, _bounds.end.x),
		_rng.randf_range(_bounds.position.y, _bounds.end.y),
	)
	_play(&"walk")


## Play an animation, falling back to whatever exists if the artist hasn't drawn
## that state yet. Missing art should not stop the game.
func _play(anim: StringName) -> void:
	var frames := _sprite.sprite_frames
	if frames == null:
		return
	if frames.has_animation(anim):
		_sprite.play(anim)
	elif frames.has_animation(&"idle"):
		_sprite.play(&"idle")
	elif frames.get_animation_names().size() > 0:
		_sprite.play(frames.get_animation_names()[0])


func to_dict() -> Dictionary:
	return {
		"id": cat_id,
		"data": data.resource_path,
		"x": position.x,
		"y": position.y,
		"needs": needs.to_dict(),
	}


func apply_dict(d: Dictionary) -> void:
	cat_id = str(d.get("id", cat_id))
	position = Vector2(float(d.get("x", position.x)), float(d.get("y", position.y)))
	needs = Needs.from_dict(d.get("needs", {}))
