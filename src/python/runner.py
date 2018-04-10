import os.path
import subprocess
import json
import sys

def real_path(file):
	return os.path.join(sys.path[0], file)

def generate_grid(default_item, size):
	return [[dict(default_item) for _ in range(size[1])] for _ in range(size[0])]

def assertm(bool_, message):
	if !bool_:
		raise Exception(message)

def verify_type(data, type_):
	assertm(type(data) == type_, 'Invalid data format.')

def verify_in_grid(coords):
	assertm(
		(
			coords[0] >= 0 and
			coords[0] < GRID_SIZE[0] and
			coords[1] >= 0 and
			coords[1] < GRID_SIZE[1]
		),
		'Coords "{}" not in grid'.format(coords)
	)

def verify_key(dict_, key):
	assertm(
		key in dict_,
		'Key "{}" not found'.format(key)
	)

class Bot:
	def __init__(self, language, file):
		self.language = language
		self.file = file
		if self.language == 'python':
			self.command = 'python3'
		else:
			raise Exception('Invalid language')

	def run(self, data):
		return subprocess.run(
			[
				self.command,
				real_path(self.file),
				'<',
				json.dumps(data).encode('utf-8')
			],
			stdin=subprocess.PIPE,
			stdout=subprocess.PIPE
		).stdout.decode('utf-8')

GRID_SIZE = [10, 10]
grid = generate_grid(
	{
		'type': 'plain',
	},
	GRID_SIZE,
)
bots = [
	Bot('python', 'sample-bot.py'),
	Bot('python', 'sample-bot.py'),
]
unit_commands = {
	'soldier': ['move']
}

template = [
	((0, 0), False): {
		('type', True): '',

	}
]

def verify_type(obj, template):
	assertm(type(obj) == type(template), 'Invalid data value type.')
	if type(obj) == dict:
		for key, required in template:
			if required:
				assertm(key in obj, 'Missing data key "{}"'.format(key))
		for key in obj:
			assertm(type(key) == type(list(template.keys())[0])), 'Invalid data key type.')
			verify_type(obj[key], template[list(template.keys())[0]])
	elif type(obj) == list or tuple:
		for val in obj:
			verify_type(val, template[0])

for i in range(10):
	for bot in bots:
		commands = bot.run(grid)
		verify_type(commands, template)

		for coords in commands:
			command = commands[coords]
			verify_in_grid(coords)
			unit = grid[coords[0]][coords[1]]

			if command['type'] not in unit_commands[unit['type']]:
				raise Exception('No command "{}" for unit "{}"'.format(
					command['type'], unit['type']
				))

			if command['type'] == 'move':
