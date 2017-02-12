import os
import shutil

destination = '../dep'
with open('dependencies.txt') as dep:
    current = 0
    for line in dep:
        src = "../" + line.strip().replace('\\','/')
        print src
        shutil.copy(src, destination)
