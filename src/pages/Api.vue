<template lang="pug">
    column(align-v='top' width='100%' flex-grow=1)
        Loader(v-if="!loadedAll$")
        //- top bar search area
        //- column.top-bar-container(v-if="loadedAll$" width="100%")
        //-     column(padding='1.2rem' align-h="left")
        //-         ui-autocomplete.rounded-search(
        //-             placeholder="Search for a label, or a video"
        //-             v-model="searchTerm"
        //-             :suggestions="suggestions"
        //-         )
        column(v-if="loadedAll$" padding="1.2rem")
            h5 Change Database
            Card(margin="3rem")
                ui-textbox(label="Which Database" v-model="databaseName" @keydown.enter="changeDatabases")
            row
                //- ui-autocomplete.rounded-search(
                //-     placeholder="Which collection"
                //-     v-model="whichCollection"
                //-     :suggestions="collections"
                //- )
                column(@keyup.enter="submitSearch")
                    h5 Search Options
                    jsonRoot.json-root-class(:initValue="{from: 'observations', maxNumberOfResults: 10, where: [ { valueOf: ['observer'], is: 'bob' } ]}" @changeValue="newJsonValue")
            
            column
                h5 Search Results
                JsonTree(:data="searchResult")
        
        
</template>

<script>
const FileSaver = require('file-saver')
export default {
    name: "ApiExplore",
    components: {
        Loader: require('../atoms/Loader').default,
        JsonTree: require('vue-json-tree').default,
        jsonRoot: require("edit-json-vue/src/jsonRoot.vue").default,
        Card: require("../molecules/Card").default,
    },
    mixins: [
        require("../mixins/loader"),
        require("../iilvd-api").mixin,
    ],
    data: ()=>({
        needToLoad$: {},
        searchTerm: null,
        whichCollection: null,
        searchOptions: {},
        collections: [],
        suggestions: [],
        searchResult: null,
        databaseName: "submission-",
    }),
    windowListeners: {
        // keydown({key}) {
        //     if (key == "Enter") {
        //         this.submitSearch()
        //     }
        // }
    },
    created() {
        this.$once("loadedAll$",async ()=>{
            this.collections = await (await this.backend).collectionNames()
        })
    },
    methods: {
        newJsonValue(value) {
            this.searchOptions = value
        },
        async changeDatabases() {
            this.$toasted.show(`Okay, I told the database to switch to: ${this.databaseName}`).goAway(2500)
            await (await this.backend).changeDb(this.databaseName)
        },
        async submitSearch() {
            this.$toasted.show(`Searching`).goAway(2500)
            let result = await (await this.backend).mongoInterface.getAll(this.searchOptions)
            window.apiResult = result // DEBUGGING
            const numberOfCharsFoundToReallyReallyReallySlowTheUIDown = 24956
            if (JSON.stringify(result).length < numberOfCharsFoundToReallyReallyReallySlowTheUIDown) {
                this.$toasted.show(`Search results returned`).goAway(2500)
                this.searchResult = result
            } else {
                this.searchResult = {}
                this.$toasted.show(`Results are too large (UI will freeze)`, {
                    action:[
                        {
                            text : 'Save Results To File?',
                            onClick : (eventData, toastObject) => {
                                FileSaver.saveAs(new Blob([JSON.stringify(result, 0, 4)], {type: "text/plain;charset=utf-8"}), "result.json")
                            },
                        },
                    ]
                }).goAway(6500)
            }
        }
    }
}
</script>

<style lang="sass">
.json-root-class
    padding: 1rem

</style>