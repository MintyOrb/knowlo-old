import json

failed = []

with open("videos3.json") as videoFile:
    videos = json.load(videoFile)

    for line in open('add2.txt'):
        found = False
        for video in videos:
            if line.strip() == video['url']:
                found = True
        if not found:
            failed.append(line.strip())
            print line.strip()
    print failed
