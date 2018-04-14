import rbl
import json

@rbl.main
def main(data):
	action = {}
	team = data['units'][data['team']]
	for id in team:
		action[id] = {
			'type': 'move',
			'direction': 'left'
		}
	return action
