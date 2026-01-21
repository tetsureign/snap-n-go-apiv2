import os

objects = []

with open('raw.txt','r') as f:
    lines = f.readlines()
    objects = [i.split(': ')[1].rstrip('\n') for i in lines]

with open('result.txt','w') as f:
    f.write(str(objects))
