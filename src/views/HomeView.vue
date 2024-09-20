<script>
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'
import cornerstoneMath from 'cornerstone-math'
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import dicomParser from 'dicom-parser'
import Hammer from 'hammerjs'


import { post_data } from '@/utils/vi_tools'


cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer
cornerstoneTools.external.cornerstoneMath = cornerstoneMath

cornerstoneWebImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

cornerstoneTools.init({ 
    showSVGCursors: true,
    mouseEnabled: true, // listen mouse event
    touchEnabled: true,
    globalToolSyncEnabled: true,
})


export default {
    name: "double_shower",

    props: {
        api_url: { required: true, type: String },
        left_series: { required: true, type: String },
        right_series: { required: true, type: String },
    },

    data() {
        return {
            left_store: {}, right_store: {},

            left_stack: { currentImageIdIndex: 0, imageIds: [], },
            right_stack: { currentImageIdIndex: 0, imageIds: [], },

            // controller
            numImagesLoaded: 0,

            // synchronizer
            scroll_syncer: '', crosshair_syncer: '',
        }
    },

    computed: {
        curr_lefter() {
            let img_element = this.$refs['left/series']
            let index = this.left_stack.currentImageIdIndex
            index = this.left_stack.imageIds[index]
            
            let metadata_key = typeof index == 'undefined' ? null : index.replace(`${this.api_url}/`, '')
            
            return { 
                element: img_element, 
                metadata: this.left_store[metadata_key],
                series: metadata_key,
            }
        },

        curr_righter() {
            let img_element = this.$refs['right/series']
            let index = this.right_stack.currentImageIdIndex
            index = this.right_stack.imageIds[index]
            
            let metadata_key = typeof index == 'undefined' ? null : index.replace(`${this.api_url}/`, '')
            
            return { 
                element: img_element, 
                metadata: this.right_store[metadata_key],
                series: metadata_key,
            }
        },
    },

    async mounted() {
        // collect all img info
        this.left_store = await this.fetch_img(`${this.api_url}/${this.left_series}`, {type: 'info'})
        this.right_store = await this.fetch_img(`${this.api_url}/${this.right_series}`, {type: 'info'})

        this.left_stack.imageIds = Object.keys(this.left_store)
            .filter(img => img != 'total_num')
            .map(img => `${this.api_url}/${img}`)
        this.right_stack.imageIds = Object.keys(this.right_store)
            .filter(img => img != 'total_num')
            .map(img => `${this.api_url}/${img}`)

        // create metadata provider to img element
        cornerstone.metaData.addProvider(this.metadate_provider.bind(this))
        this.init_syncer()

        await this.init_img()       
    },

    methods: {
        async fetch_img(url, url_para) {
            let resp = await post_data(url, url_para, 15000,)
            if (resp.hasOwnProperty('code')) {
                return resp.code == 20000 ? resp.data : resp.res
            } else { return resp }
        },

        init_syncer() {
            this.scroll_syncer = new cornerstoneTools.Synchronizer(
                'cornerstonenewimage',
                this.sync_scroll_synchronizer
            )

            this.crosshair_syncer = new cornerstoneTools.Synchronizer(
                'cornerstonenewimage',
                cornerstoneTools.updateImageSynchronizer,
            )
        },

        async init_img() {
            const elements = [this.curr_lefter.element, this.curr_righter.element]
            // image enable the dicomImage element and add canvas to it
            elements.forEach(element => { cornerstone.enable(element) })

            const left_prom = this._loadImage(
                this.left_stack.imageIds,
                this.curr_lefter.element,
                this.left_stack,
            )

            const right_prom = this._loadImage(
                this.right_stack.imageIds,
                this.curr_righter.element,
                this.right_stack,
            )

            Promise.all([left_prom, right_prom]).then(() => { this.init_tool() })
        },

        init_tool() {
            // Add the tool
            cornerstoneTools.addTool(cornerstoneTools.StackScrollTool)
            // cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 })

            cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool)
            cornerstoneTools.setToolActive('StackScrollMouseWheel', {})

            cornerstoneTools.setToolActive("StackScroll", {
                mouseButtonMask: 1, 
                synchronizationContext: this.scroll_syncer,
            })
        },

        _loadImage(imageIds, element, stack) {
            // cache all series' image
            imageIds.forEach(imageId => cornerstone.loadAndCacheImage(imageId))

            return cornerstone.loadImage(imageIds[0]).then(image => {
                // display this image    
                cornerstone.displayImage(element, image)

                // set the stack as tool state
                this.scroll_syncer.add(element)
                cornerstoneTools.addStackStateManager(element, ['stack', "StackScroll"])
                cornerstoneTools.addToolState(element, 'stack', stack)
            })
        },

        metadate_provider(key, img_id) {
            const curr = img_id.replace(`${this.api_url}/`, '') == this.curr_lefter.series ? this.curr_lefter : this.curr_righter

            if (Object.keys(curr.metadata).includes(key)) {
                return curr.metadata[key]
            }
        },

        // package synchronizer
        sync_scroll_synchronizer(
            synchronizer, sourceElement, targetElement, eventData) {
            if (!eventData) { return }

            const stack = eventData.element.id.includes('left') ? this.left_stack : this.right_stack
            const old_index = stack.imageIds.indexOf(eventData.oldImage.imageId)
            const index = stack.imageIds.indexOf(eventData.image.imageId)

            eventData.direction = index - old_index > 0 ? 1 : -1

            return cornerstoneTools.stackScrollSynchronizer(
                synchronizer, sourceElement, 
                targetElement, eventData
            )
        },
    },
}
</script>

<template>
<div class = "double-cornerstone">
    <!-- <div>{{ curr_lefter }}</div> -->
    <div class = "left-container">
        <div :id = "`left/${left_series}`" ref = "left/series">

        </div>
    </div>
    <div>
        <el-button @click = "scroll_syncer.enabled = !scroll_syncer.enabled">联动</el-button>
    </div>
    <div class = "right-container">
        <div :id = "`right/${right_series}`" ref = "right/series">

        </div>
    </div>
</div>
</template>

<style scoped lang="scss">
.double-cornerstone {
    display: flex; flex-grow: 1;
    width: 100%; height: 100%;

}
</style>