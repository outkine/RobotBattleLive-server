import json
import os
import sys

# def real_path(file):
# 	return os.path.join(sys.path[0], file)

def load():
	return json.loads(sys.stdin.readline())

def submit(data):
	json.dump(data, sys.stdout)
	sys.stdout.flush()

def main(func):
	while True:
		submit(func(load()))
