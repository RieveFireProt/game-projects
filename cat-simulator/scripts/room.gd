extends Node2D
## Paints the room from its RoomData, spawns its cats, and owns their save state.
##
## The tile layers are left empty in the scene file and filled in here, so the
## room's size lives in one place (the RoomData resource) rather than being
## frozen into hand-placed tiles.

## Index of the atlas source inside room_tileset.tres.
const SOURCE_ID := 0
## Atlas coordinates within that source. FLOOR_TILES[0] is the base floor; the
## rest are accents scattered sparingly -- an even mix reads as a checkerboard.
const FLOOR_TILES := [Vector2i(0, 0), Vector2i(1, 0)]
const WALL_TILE := Vector2i(2, 0)
const WALL_TOP_TILE := Vector2i(3, 0)
## Chance any given floor cell uses an accent tile instead of the base.
const FLOOR_ACCENT_CHANCE := 0.12
## Fixed seed so the floor variant scatter is identical every run.
const FLOOR_SEED := 20260808

const CAT_SCENE := preload("res://scenes/cat.tscn")
const DEFAULT_CAT_DATA := preload("res://data/cats/tabby.tres")
## Keeps a cat's feet this far inside the floor edges, so it never walks with
## half its body clipped by the room boundary.
const WALK_INSET := 6.0

@export var room_data: RoomData

@onready var _floor: TileMapLayer = $Floor
@onready var _walls: TileMapLayer = $Walls
@onready var _entities: Node2D = $Entities
@onready var _camera: Camera2D = $Camera
@onready var _room_name: Label = $HUD/RoomName
@onready var _needs_panel := $HUD/NeedsPanel


func _ready() -> void:
	if room_data == null:
		room_data = RoomData.new()
	_paint()
	_room_name.add_theme_color_override("font_color", Palette.TEXT)
	_room_name.add_theme_color_override("font_shadow_color", Palette.SHADOW)
	_room_name.add_theme_constant_override("shadow_offset_y", 1)

	var bounds := Rect2i(Vector2i.ZERO, room_data.pixel_size())
	_camera.set_bounds(bounds)
	_camera.position = Vector2(bounds.size) / 2.0

	GameState.collecting.connect(_on_collecting)
	GameState.applying.connect(_on_applying)
	if not GameState.load_game():
		_spawn_cat(DEFAULT_CAT_DATA, walkable().get_center())
	_needs_panel.cat = _first_cat()
	_update_title()


## The area a cat may stand in, in pixels.
func walkable() -> Rect2:
	var cells := room_data.floor_rect()
	var px := Rect2(
		Vector2(cells.position) * Grid.TILE_SIZE, Vector2(cells.size) * Grid.TILE_SIZE
	)
	return px.grow(-WALK_INSET)


func _paint() -> void:
	_floor.clear()
	_walls.clear()

	var rng := RandomNumberGenerator.new()
	rng.seed = FLOOR_SEED

	var cells := room_data.floor_rect()
	for y in range(cells.position.y, cells.end.y):
		for x in range(cells.position.x, cells.end.x):
			var variant: Vector2i = FLOOR_TILES[0]
			if FLOOR_TILES.size() > 1 and rng.randf() < FLOOR_ACCENT_CHANCE:
				variant = FLOOR_TILES[1 + rng.randi() % (FLOOR_TILES.size() - 1)]
			_floor.set_cell(Vector2i(x, y), SOURCE_ID, variant)

	for y in room_data.wall_height_tiles:
		var tile := WALL_TOP_TILE if y == 0 else WALL_TILE
		for x in room_data.width_tiles:
			_walls.set_cell(Vector2i(x, y), SOURCE_ID, tile)


func _spawn_cat(data: CatData, at: Vector2) -> Cat:
	var cat: Cat = CAT_SCENE.instantiate()
	# Set before add_child so the cat's _ready sees its own data.
	cat.data = data
	cat.position = at
	cat.cat_id = "cat_%d" % _entities.get_child_count()
	_entities.add_child(cat)
	cat.set_bounds(walkable())
	return cat


func _first_cat() -> Cat:
	for child in _entities.get_children():
		if child is Cat:
			return child
	return null


func _on_collecting(save: Dictionary) -> void:
	var entries: Array = []
	for child in _entities.get_children():
		if child is Cat:
			entries.append(child.to_dict())
	save["cats"] = entries


func _on_applying(save: Dictionary) -> void:
	for child in _entities.get_children():
		_entities.remove_child(child)
		child.queue_free()

	for entry in save.get("cats", []):
		var path := str(entry.get("data", ""))
		var data: CatData = DEFAULT_CAT_DATA
		if ResourceLoader.exists(path):
			data = load(path)
		else:
			push_warning("save references missing cat data '%s'; using default" % path)
		var cat := _spawn_cat(data, walkable().get_center())
		cat.apply_dict(entry)


# --- Dev affordances -------------------------------------------------------
# Meters drain over about an hour, which is unwatchable while tuning. These let
# you fast-forward without editing the decay rates you're trying to judge.

const TIME_SCALES := [1.0, 10.0, 60.0, 300.0]


func _unhandled_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	match event.keycode:
		KEY_EQUAL, KEY_KP_ADD:
			_cycle_time_scale(1)
		KEY_MINUS, KEY_KP_SUBTRACT:
			_cycle_time_scale(-1)
		KEY_P:
			GameClock.paused = not GameClock.paused
			_update_title()


func _cycle_time_scale(step: int) -> void:
	var i: int = TIME_SCALES.find(GameClock.time_scale)
	if i < 0:
		i = 0
	GameClock.time_scale = TIME_SCALES[clampi(i + step, 0, TIME_SCALES.size() - 1)]
	_update_title()


func _update_title() -> void:
	var title := room_data.display_name
	if GameClock.paused:
		title += "  [paused]"
	elif GameClock.time_scale != 1.0:
		title += "  x%d" % int(GameClock.time_scale)
	_room_name.text = title
