import rbl

data = rbl.load()


action = {}
team = data['units'][data['team']]
for id in team:
	action[id] = {
		'type': 'move',
		'direction': 'left'
	}

rbl.submit(action)
