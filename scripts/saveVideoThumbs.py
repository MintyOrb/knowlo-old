import urllib
import json

with open("videos.json") as videoFile:
    videos = json.load(videoFile)

    for video in videos:
        try:
            urllib.urlretrieve(video['thumb'], "thumbs/" + video['videoid'] + "_SMALL_" + video['thumb'].split('/')[-1])
        except IOError as err:
            print err

        try:
            urllib.urlretrieve(video['bigthumb'], "thumbs/" + video['videoid'] + "_MEDIUM_" + video['bigthumb'].split('/')[-1])
        except IOError as err:
            print err

        print "saved - ", video['title']
    print "done!"
