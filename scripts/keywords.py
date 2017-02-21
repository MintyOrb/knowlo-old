import json

words = []
with open("videos.json") as videoFile:
    videos = json.load(videoFile)

    # stuff = map(lambda w: [w.upper(), w.lower(), len(w)], videos)
    # blah = [n * 2 for n in numbers if n % 2 == 1]
    # flattened = [n for row in matrix for n in row]

    # words = [word for video in videos for word in video['keywords']]

    for video in videos:
      for key in video['keywords']:
        found = False
        for word in words:
            if word['name'].lower() == key.lower():
                found = True
                word['count'] += 1
                break
        if not found and len(key) > 0:
            # add
            words.append({
                'name': key,
                'count': 1
            })
    words = [word for word in words if word['count'] > 2]
    words = sorted(words, key=lambda k: k['count'])


    # print [word for word in words if word['count'] > 2]

with open('keywords2.json', 'w') as outfile:
    json.dump(words, outfile)
