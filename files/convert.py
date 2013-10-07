import sys

data = open(str(sys.argv[1]), 'r')
f = open('./geo.json', 'w')
string = "{"
for line in data:
	argv = line.split(",")
	string += "\"" + argv[0] + "\":" + "[" + argv[1] + "," + argv[2] + "]" + ","
string += "}"
f.write(string)
