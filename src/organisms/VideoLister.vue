<template lang="pug">
    column.video-list-container(width="100%" padding="1rem" align-v="top")
        span(v-if="videoResults.length == 0")
            | (No other videos matching this search)
        column.video-list-element(v-for="eachVideoId in videoResults" @click="selectVideo($event, eachVideoId)")
            row.thumbnail(width="100%" height="100%" :background-image="`url(http://img.youtube.com/vi/${eachVideoId}/mqdefault.jpg)`" position="relative")
</template>

<script>
export default {
    data: ()=>({
        get
    }),
    computed: {
        videoResults() {
            let videos = this.$root.searchResults.videos
            let selectedId = get(this.$root, ['routeData$', 'videoId'], null)
            let filtered = Object.keys(videos).filter(each=>each!==selectedId)
            return filtered
        }
    },
    methods: {
        getTitleFor(videoId) {
            let videoObject = this.$root.getCachedVideoObject(videoId)
            let title = videoObject&&videoObject.summary&&videoObject.summary.title
            if (title === null) {
                return "[Title not in database]"
            }
            if (title != undefined) {
                return title
            } else {
                this.backend.then(backend=>{
                    console.log(`requesting video title`)
                    backend.mongoInterface.get({
                        from: 'videos',
                        keyList: [videoId, "summary", "title"],
                    }).then(title=>{
                        console.log(`received title ${title}`)
                        if (!(videoObject.summary instanceof Object)) {
                            videoObject.summary = {}
                        }
                        videoObject.summary.title = title || null
                        this.$forceUpdate()
                    })
                })
                return "Loading..."
            }
        },
        selectVideo(eventObj, videoId) {
            this.$root.push({videoId})
        },
    }
}
</script>

<style lang='sass' scoped>
.thumbnail
    background-size: cover
    background-repeat: no-repeat

span
    color: black
    
.video-list-container
    overflow: scroll

.video-list-element
    height: 14rem 
    min-height: 14rem
    width: 100%  
    margin-bottom: 2rem 
    position: relative
    cursor: pointer
    .video-title
        align-self: flex-start
        margin-bottom: 0.5rem
        
    .overlay
        width: 100%
        height: 100%
        position: absolute
</style>