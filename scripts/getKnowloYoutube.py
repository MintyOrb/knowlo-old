import pafy
import json

videoData = []

for line in open('youtubeurls.txt'):

    videoObj = {}

    try:
        video = pafy.new(line.strip())
    except ValueError:
        print "error here - ", line
        with open('videos.json', 'w') as outfile:
            json.dump(videoData, outfile)
        print "dumped combined video object."
    else:

        videoObj['url']            = line.strip()

        videoObj['title']          = video.title
        videoObj['duration']       = video.duration
        videoObj['rating']         = video.rating
        videoObj['author']         = video.author
        videoObj['length']         = video.length
        videoObj['description']    = video.description
        videoObj['keywords']       = video.keywords
        videoObj['thumb']          = video.thumb
        videoObj['bigthumb']       = video.bigthumb
        videoObj['videoid']        = video.videoid
        videoObj['viewcount']      = video.viewcount
        videoObj['likes']          = video.likes
        videoObj['dislikes']       = video.dislikes
        videoObj['username']       = video.username

        videoData.append(videoObj)

        print len(videoData), " - ", video.title
    

with open('videos.json', 'w') as outfile:
    json.dump(videoData, outfile)
