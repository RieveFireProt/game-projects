extends Node
## Autoloaded as `Grid`. Owns the one number every other system has to agree on.
##
## Object sprites anchor at the bottom-centre of their footprint, so that
## Y-sorting and grid placement line up. `cell_to_anchor()` is the function
## placement code should use; `cell_to_world()` returns the top-left corner and
## is mostly for tile maths.

const TILE_SIZE := 32


func cell_to_world(cell: Vector2i) -> Vector2:
	return Vector2(cell) * TILE_SIZE


## Bottom-centre of a cell -- where an object sprite's origin sits.
func cell_to_anchor(cell: Vector2i) -> Vector2:
	return Vector2(cell.x * TILE_SIZE + TILE_SIZE / 2.0, (cell.y + 1) * TILE_SIZE)


func world_to_cell(world: Vector2) -> Vector2i:
	return Vector2i(floori(world.x / TILE_SIZE), floori(world.y / TILE_SIZE))
