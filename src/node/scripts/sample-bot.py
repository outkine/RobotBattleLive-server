import rbl

@rbl.main
def main(allies, enemies, grid, team):
	for soldier in allies:
		soldier.move('left')
