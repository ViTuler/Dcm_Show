<script>
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'
import cornerstoneMath from 'cornerstone-math'
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import dicomParser from 'dicom-parser'
import Hammer from 'hammerjs'


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

// add tools herer
// see example -> https://tools.cornerstonejs.org/examples/
cornerstoneTools.addTool(cornerstoneTools.LengthTool)
cornerstoneTools.addTool(cornerstoneTools.WwwcTool)
cornerstoneTools.addTool(cornerstoneTools.ZoomTool)
cornerstoneTools.addTool(cornerstoneTools.PanTool)
cornerstoneTools.addTool(cornerstoneTools.ScaleOverlayTool)
cornerstoneTools.addTool(cornerstoneTools.StackScrollTool)
cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool)

cornerstoneTools.addTool(cornerstoneTools.DragProbeTool)
cornerstoneTools.addTool(cornerstoneTools.MagnifyTool)

export default {
    name: 'corner',
    
    mounted() {
        this.scroll_synchronizer = new cornerstoneTools.Synchronizer(
            'cornerstonenewimage', // event name
            this.sync_scroll_synchronizer, // recall function
        )
        this.scroll_synchronizer.enabled = false
        
        cornerstoneTools.setToolActive("StackScroll", {
            mouseButtonMask: 1, 
            synchronizationContext: this.scroll_synchronizer,
        })

        this.wwwc_synchronizer = new cornerstoneTools.Synchronizer(
            'cornerstoneimagerendered',
            cornerstoneTools.wwwcSynchronizer,
        )

        this.wwwc_synchronizer.enabled = false
        
        // cornerstoneTools.setToolActive("Wwwc", {
        //     mouseButtonMask: 1, 
        //     synchronizationContext: this.wwwc_synchronizer,
        // })
        
    },
}
</script>


<template>
    <div id = "corner_main">
        <router-view />
    </div>
</template>


<style lang = "scss">
.cornerstone_app {
    display: flex; width: 100%;
    .cornerstone_fa {
        display: flex; width: 100%;
        .cornerstone_button {
            display: flex; flex-direction: column; margin-right: 20px;
        }
    }
}

@media screen and (max-width: 600px){
.cornerstone_app {
    display: flex; flex-direction: column; height: 100%; width: 100%;
    .cornerstone_fa { 
        height: 560px; display: block;
    }
}}
</style>
