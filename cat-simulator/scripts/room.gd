extends Node2D
## Paints the room from its RoomData and hands the camera its bounds.
##
## The tile layers are left empty in the scene file and filled in here, so the
## room's size lives in one place (the RoomData resource) rather than being
## frozen into hand-placed tiles.

## Index of the atlas source inside room_tileset.tres.
const SOURCE_ID := 0
## Atlas coordinates within that source. FLOOR_TILES[0] is the base floor; the
## rest are accents scattered sparingly -- an even mix reads as a checkerboard.
const FLOOR_TILES := [Vector2i(0, 0), Vector2i(1, 0)]
## Chance any given floor cell uses an accent tile instead of the base.
const FLOOR_ACCENT_CHANCE := 0.12
const WALL_TILE := Vector2i(2, 0)
const WALL_TOP_TILE := Vector2i(3, 0)
## Fixed seed so the floor variant scatter is identical every run.
const FLOOR_SEED := 20260808

@export var room_data: RoomData

@onready var _floor: TileMapLayer = $Floor
@onready var _walls: TileMapLayer = $Walls
@onready var _camera: Camera2D = $Camera
@onready var _room_name: Label = $HUD/RoomName


func _ready() -> void:
	if room_data == null:
		room_data = RoomData.new()
	_paint()
	_room_name.text = room_data.display_name
	_room_name.add_theme_color_override("font_color", Palette.TEXT)
	_room_name.add_theme_color_override("font_shadow_color", Palette.SHADOW)
	_room_name.add_theme_constant_override("shadow_offset_y", 1)

	var bounds := Rect2i(Vector2i.ZERO, room_data.pixel_size())
	_camera.set_bounds(bounds)
	_camera.position = Vector2(bounds.size) / 2.0


func _paint() -> void:
	_floor.clear()
	_walls.clear()

	var rng := RandomNumberGenerator.new()
	rng.seed = FLOOR_SEED

	var walkable := room_data.floor_rect()
	for y in range(walkable.position.y, walkable.end.y):
		for x in range(walkable.position.x, walkable.end.x):
			var variant: Vector2i = FLOOR_TILES[0]
			if FLOOR_TILES.size() > 1 and rng.randf() < FLOOR_ACCENT_CHANCE:
				variant = FLOOR_TILES[1 + rng.randi() % (FLOOR_TILES.size() - 1)]
			_floor.set_cell(Vector2i(x, y), SOURCE_ID, variant)

	for y in room_data.wall_height_tiles:
		var tile := WALL_TOP_TILE if y == 0 else WALL_TILE
		for x in room_data.width_tiles:
			_walls.set_cell(Vector2i(x, y), SOURCE_ID, tile)
