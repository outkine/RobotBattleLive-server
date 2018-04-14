import json
import sys

class Unit:
	def __init__(self, id, coords, data):
		self.coords = coords
		self.id = id
		self.health = data['health']

	def move(self, direction):
		self.set_action('move', { 'direction': direction })

	def attack(self, direction):
		self.set_action('attack', { 'direction': direction })

	def set_action(self, action_type, data):
		global action_
		data['type'] = action_type
		action_[self.id] = data

CLASSES = {
	'soldier': Unit,
}

action_ = {}
init_ = None
main_ = None

def load():
	return json.loads(sys.stdin.readline())

def submit(data):
	sys.stdout.write('ACTION' + ';' + json.dumps(data))
	sys.stdout.flush()

def process(data):
	allies = []
	enemies = []
	for team in data['units']:
		if team == data['team']:
			for id, coords in data['units'][team].items():
				unit = data['grid'][coords[0]][coords[1]]
				allies.append(CLASSES[unit['unit']](id, coords, unit))
		else:
			for coords in data['units'][team].values():
				unit = data['grid'][coords[0]][coords[1]]
				enemies.append(unit)
	return allies, enemies

def init(func):
	global init_
	init_ = func

def main(func):
	global action_
	data = load()
	if init_:
		init_(data['grid'], data['team'])
	while True:
		print(1)
		allies, enemies = process(data)
		func(allies, enemies, data['grid'], data['team'])
		submit(action_)
		data = load()
		action_ = {}
