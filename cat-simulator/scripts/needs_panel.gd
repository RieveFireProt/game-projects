extends PanelContainer
## Shows one cat's three meters.
##
## Built in code rather than as a node tree because at a 384x216 viewport the UI
## is only a few dozen pixels tall, and every size here has to be an exact pixel
## count. There is no room for a layout that "roughly works".
##
## Deliberately no text on the bars: at this resolution a label per bar costs
## more pixels than it earns. Colour carries the meaning, and a bar turning red
## is the signal that something needs attention.

const BAR_SIZE := Vector2(64, 5)
const METERS: Array[StringName] = [&"hunger", &"energy", &"happiness"]

var cat: Cat:
	set(value):
		cat = value
		_refresh()

var _bars: Dictionary = {}
var _name_label: Label


func _ready() -> void:
	add_theme_stylebox_override("panel", _panel_style())

	var rows := VBoxContainer.new()
	rows.add_theme_constant_override("separation", 2)
	add_child(rows)

	_name_label = Label.new()
	_name_label.add_theme_font_size_override("font_size", 8)
	_name_label.add_theme_color_override("font_color", Palette.TEXT)
	rows.add_child(_name_label)

	for meter in METERS:
		var bar := ProgressBar.new()
		bar.custom_minimum_size = BAR_SIZE
		bar.max_value = Needs.MAX
		bar.show_percentage = false
		bar.add_theme_stylebox_override("background", _bar_style(Palette.PANEL_DARK))
		bar.add_theme_stylebox_override("fill", _bar_style(_colour_for(meter)))
		rows.add_child(bar)
		_bars[meter] = bar

	GameClock.ticked.connect(_on_tick)
	_refresh()


func _on_tick(_delta: float) -> void:
	_refresh()


func _refresh() -> void:
	if _bars.is_empty():
		return  # _ready hasn't run yet; the setter will call us again.
	visible = cat != null
	if cat == null:
		return
	_name_label.text = cat.data.display_name
	for meter in METERS:
		var value := cat.needs.get_meter(meter)
		var bar: ProgressBar = _bars[meter]
		bar.value = value
		# Recolour rather than add an icon -- red reads as "attend to me" without
		# costing any pixels.
		var colour := Palette.BAD if value < Needs.URGENT else _colour_for(meter)
		bar.add_theme_stylebox_override("fill", _bar_style(colour))


func _colour_for(meter: StringName) -> Color:
	match meter:
		&"hunger": return Palette.COLORS[15]
		&"energy": return Palette.COLORS[25]
		&"happiness": return Palette.COLORS[20]
	return Palette.TEXT_DIM


func _bar_style(colour: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = colour
	return style


func _panel_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(Palette.PANEL_DARK, 0.8)
	style.set_content_margin_all(3)
	return style
