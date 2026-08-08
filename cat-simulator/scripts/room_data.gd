class_name RoomData
extends Resource
## Size and identity of a room.
##
## Kept as data rather than baked into the scene so that "buy a bigger
## apartment" is a change to two numbers instead of a rebuilt room.

@export var display_name: String = "Studio Apartment"
@export_range(8, 64) var width_tiles: int = 24
@export_range(8, 64) var height_tiles: int = 16
## Rows at the top of the room drawn as wall instead of floor.
@export_range(1, 4) var wall_height_tiles: int = 2


## The walkable area, in tiles.
func floor_rect() -> Rect2i:
	return Rect2i(0, wall_height_tiles, width_tiles, height_tiles - wall_height_tiles)


## Full room size in pixels -- the camera's pan bounds.
func pixel_size() -> Vector2i:
	return Vector2i(width_tiles, height_tiles) * Grid.TILE_SIZE
