extends Camera2D
## Click-and-drag panning, clamped to the room bounds.
##
## Drag is the same gesture under a finger as under a mouse, so this doesn't
## quietly lock the game to desktop. Zoom is deliberately left alone: any
## non-integer zoom level destroys pixel-art crispness, so if we ever add it,
## it has to step 1x -> 2x -> 3x and nothing between.

var _dragging := false


## Clamp panning to `bounds` (in pixels). Camera2D enforces the limits itself
## once they're set, including during a drag.
func set_bounds(bounds: Rect2i) -> void:
	limit_left = bounds.position.x
	limit_top = bounds.position.y
	limit_right = bounds.end.x
	limit_bottom = bounds.end.y


## Snap the view to a point -- for the "where is my cat" portrait buttons.
func focus_on(world_position: Vector2) -> void:
	position = world_position


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		_dragging = event.pressed
	elif event is InputEventMouseMotion and _dragging:
		position -= event.relative / zoom
