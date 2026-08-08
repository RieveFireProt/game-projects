class_name Needs
extends Resource
## A cat's three meters.
##
## 100 is fully satisfied and 0 is empty, for all three -- so every meter drains
## in the same direction and a low bar always means "needs attention". Naming
## one of them "hunger" and having it *rise* is the classic way to end up with
## an inverted bar nobody notices until playtest.

const MAX := 100.0
## Below this a meter counts as urgent, which drives behaviour and bar colour.
const URGENT := 25.0

@export_range(0.0, 100.0) var hunger := MAX
@export_range(0.0, 100.0) var energy := MAX
@export_range(0.0, 100.0) var happiness := MAX


## Drain the meters. Rates are points per minute and come from the cat's
## CatData, so tuning lives in a data file rather than in here.
func decay(minutes: float, hunger_rate: float, energy_rate: float, happiness_rate: float) -> void:
	hunger = clampf(hunger - hunger_rate * minutes, 0.0, MAX)
	energy = clampf(energy - energy_rate * minutes, 0.0, MAX)
	happiness = clampf(happiness - happiness_rate * minutes, 0.0, MAX)


func restore(meter: StringName, amount: float) -> void:
	match meter:
		&"hunger":
			hunger = clampf(hunger + amount, 0.0, MAX)
		&"energy":
			energy = clampf(energy + amount, 0.0, MAX)
		&"happiness":
			happiness = clampf(happiness + amount, 0.0, MAX)
		_:
			push_warning("Needs.restore: unknown meter '%s'" % meter)


func get_meter(meter: StringName) -> float:
	match meter:
		&"hunger": return hunger
		&"energy": return energy
		&"happiness": return happiness
	return 0.0


## The meter most in need of attention -- what the cat will act on first.
func most_urgent() -> StringName:
	var lowest := &"hunger"
	var value := hunger
	if energy < value:
		lowest = &"energy"
		value = energy
	if happiness < value:
		lowest = &"happiness"
	return lowest


func to_dict() -> Dictionary:
	return {"hunger": hunger, "energy": energy, "happiness": happiness}


static func from_dict(d: Dictionary) -> Needs:
	var n := Needs.new()
	n.hunger = float(d.get("hunger", MAX))
	n.energy = float(d.get("energy", MAX))
	n.happiness = float(d.get("happiness", MAX))
	return n
