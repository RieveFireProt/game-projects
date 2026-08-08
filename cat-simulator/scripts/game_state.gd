extends Node
## Autoloaded as `GameState`. Owns the save file and the values that outlive a
## single scene.
##
## Systems don't hand their state to this node directly -- they connect to
## `collecting` and `applying` and read/write their own key in the save
## dictionary. That keeps the save format from becoming a list of everything the
## game contains, and means a new system adds itself without editing this file.

signal collecting(save: Dictionary)
signal applying(save: Dictionary)

const SAVE_PATH := "user://save.json"
## Bump when the format changes in a way older saves can't satisfy. Loading an
## unknown version starts fresh rather than guessing.
const SAVE_VERSION := 1
const AUTOSAVE_SECONDS := 30.0

var coins: int = 0

var _since_autosave := 0.0


func _ready() -> void:
	GameClock.ticked.connect(_on_tick)


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		save_game()


func _on_tick(delta: float) -> void:
	_since_autosave += delta
	if _since_autosave >= AUTOSAVE_SECONDS:
		_since_autosave = 0.0
		save_game()


func save_game() -> void:
	var save := {
		"version": SAVE_VERSION,
		"play_time": GameClock.play_time,
		"coins": coins,
	}
	collecting.emit(save)

	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_error("could not write %s: %s" % [
			SAVE_PATH, error_string(FileAccess.get_open_error())
		])
		return
	# Indented so the save stays readable -- being able to open it and see what
	# the game thinks is going on is worth more than the bytes.
	file.store_string(JSON.stringify(save, "\t"))
	file.close()


## Returns true if a save was found and applied.
func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false

	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		push_error("could not read %s" % SAVE_PATH)
		return false
	var text := file.get_as_text()
	file.close()

	var parsed: Variant = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		push_warning("%s is not valid JSON; starting fresh" % SAVE_PATH)
		return false

	var save: Dictionary = parsed
	var version := int(save.get("version", 0))
	if version != SAVE_VERSION:
		push_warning(
			"save is version %d, game expects %d; starting fresh" % [version, SAVE_VERSION]
		)
		return false

	coins = int(save.get("coins", 0))
	GameClock.play_time = float(save.get("play_time", 0.0))
	applying.emit(save)
	return true


## Delete the save. Handy while tuning, since a stale save otherwise masks
## changes to starting values.
func clear_save() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SAVE_PATH))
