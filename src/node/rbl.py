import json
import os
import sys

# def real_path(file):
# 	return os.path.join(sys.path[0], file)

def load():
	return json.load(sys.stdin)

def submit(data):
	sys.stdout.write(json.dumps(data))
