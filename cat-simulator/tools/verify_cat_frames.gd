extends SceneTree
## Loads every generated SpriteFrames and prints what Godot actually sees.
##
## Catches the case where build_cat_frames.py writes a .tres that Python thinks
## is fine but the engine won't parse. Run:
##   godot --headless --script res://tools/verify_cat_frames.gd

const CATS_DIR := "res://resources/cats"


func _initialize() -> void:
	var dir := DirAccess.open(CATS_DIR)
	if dir == null:
		push_error("cannot open %s" % CATS_DIR)
		quit(1)
		return

	var failures := 0
	var checked := 0
	for file in dir.get_files():
		if not file.ends_with(".tres"):
			continue
		checked += 1
		var path := "%s/%s" % [CATS_DIR, file]
		var frames := load(path) as SpriteFrames
		if frames == null:
			print("FAIL  %s did not load as SpriteFrames" % path)
			failures += 1
			continue
		var names := frames.get_animation_names()
		print("OK    %s" % path)
		for anim in names:
			print("        %-6s %d frame(s) @ %.1f fps  loop=%s" % [
				anim,
				frames.get_frame_count(anim),
				frames.get_animation_speed(anim),
				frames.get_animation_loop(anim),
			])
			if frames.get_frame_count(anim) == 0:
				print("        ^ empty animation")
				failures += 1

	if checked == 0:
		print("no .tres files found in %s" % CATS_DIR)
	print("checked %d resource(s), %d failure(s)" % [checked, failures])
	quit(1 if failures > 0 else 0)
