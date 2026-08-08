extends Node
## End-to-end check of the simulation: decay, save, and restore.
##
## Run:  godot --headless --path . res://tools/smoke_test.tscn
## Exits non-zero on failure, so it can gate a commit.
##
## This is a scene rather than a `--script` run because Godot only instantiates
## autoloads for a real main scene, and the whole test is about GameClock and
## GameState.
##
## Time is driven through GameClock.advance() instead of waiting for frames,
## which is the reason the clock is a single injectable source.

const ROOM := "res://scenes/room.tscn"
## Ten simulated minutes -- long enough that decay is unambiguous.
const ELAPSED := 600.0

var _failures := 0


func _ready() -> void:
	# Deferred so the tree has finished setting up before we add scenes to root.
	_run.call_deferred()


func _run() -> void:
	GameState.clear_save()

	var room: Node = _open_room()
	var cat: Cat = _find_cat(room)
	if cat == null:
		_fail("no cat spawned in a fresh room")
		_finish()
		return

	_check("cat starts with full hunger", is_equal_approx(cat.needs.hunger, Needs.MAX))

	GameClock.advance(ELAPSED)

	var expected: float = Needs.MAX - cat.data.hunger_decay * (ELAPSED / 60.0)
	_check(
		"hunger decayed to %.1f (expected %.1f)" % [cat.needs.hunger, expected],
		is_equal_approx(cat.needs.hunger, expected)
	)
	_check("energy also decayed", cat.needs.energy < Needs.MAX)

	var saved_needs := cat.needs.to_dict()
	var saved_id := cat.cat_id
	GameState.save_game()

	_check("save file written", FileAccess.file_exists(GameState.SAVE_PATH))
	var raw := FileAccess.get_file_as_string(GameState.SAVE_PATH)
	var parsed: Variant = JSON.parse_string(raw)
	_check("save is valid JSON object", typeof(parsed) == TYPE_DICTIONARY)
	if typeof(parsed) == TYPE_DICTIONARY:
		var save: Dictionary = parsed
		_check("save carries a version", save.get("version") == GameState.SAVE_VERSION)
		_check("save carries one cat", (save.get("cats", []) as Array).size() == 1)

	# Tear the room down and rebuild it, exactly as relaunching the game would.
	room.free()
	var reloaded: Node = _open_room()
	var restored: Cat = _find_cat(reloaded)
	if restored == null:
		_fail("no cat after reload")
	else:
		_check("cat id survived the round trip", restored.cat_id == saved_id)
		_check(
			"hunger restored (%.1f vs %.1f)" % [
				restored.needs.hunger, saved_needs.hunger
			],
			is_equal_approx(restored.needs.hunger, saved_needs.hunger)
		)
		_check(
			"happiness restored",
			is_equal_approx(restored.needs.happiness, saved_needs.happiness)
		)
	reloaded.free()

	# Leave no save behind, so a later manual run starts clean.
	GameState.clear_save()
	_finish()


func _open_room() -> Node:
	var room: Node = (load(ROOM) as PackedScene).instantiate()
	get_tree().root.add_child(room)
	return room


func _find_cat(room: Node) -> Cat:
	for child in room.get_node("Entities").get_children():
		if child is Cat:
			return child
	return null


func _check(label: String, passed: bool) -> void:
	print("%s  %s" % ["PASS" if passed else "FAIL", label])
	if not passed:
		_failures += 1


func _fail(label: String) -> void:
	_check(label, false)


func _finish() -> void:
	print("%d failure(s)" % _failures)
	get_tree().quit(1 if _failures > 0 else 0)
