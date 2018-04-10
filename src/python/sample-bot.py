import rbl

data = rbl.load()

action = {
	"type": "attack",
	"direction": "left",
}

rbl.submit(action)
