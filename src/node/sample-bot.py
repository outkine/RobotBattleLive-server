import rbl

@rbl.main
def main(allies, enemies, grid, team):
	print(1)
	for soldier in allies:
		soldier.move('left')
