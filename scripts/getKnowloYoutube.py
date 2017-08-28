import pafy
import json

videoData = []

for line in open('know3.txt'):

    videoObj = {}

    try:
        video = pafy.new(line.strip().encode("utf-8"))
    except (ValueError, IOError) as e:
        print "error: ", e
        print "error line - ", line
        with open('know3dump.json', 'w') as outfile:
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

        print len(videoData), " - ", video.title.encode("utf-8")


with open('know3results.json', 'w') as outfile:
    json.dump(videoData, outfile)
