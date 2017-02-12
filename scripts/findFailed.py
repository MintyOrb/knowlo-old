import json

failed = []

with open("videos.json") as videoFile:
    videos = json.load(videoFile)

    for line in open('youtubeurls.txt'):
        found = False
        for video in videos:
            if line.strip() == video['url']:
                found = True
        if not found:
            failed.append(line.strip())
            print line.strip()
    print failed
