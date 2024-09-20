<script>
import AboutView from '@/views/AboutView.vue'
import HomeView from './views/HomeView.vue'

import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'
import cornerstoneMath from 'cornerstone-math'
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import dicomParser from 'dicom-parser'
import Hammer from 'hammerjs'

import { post_data } from './utils/vi_tools'

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
    name: 'main_tester',

    components: { AboutView, HomeView },
    
    data() {
        return {
            base_url: 'http://192.168.124.22:8086/test',
            left_value: '', right_value: '',
            series_list: [
                {
                    show_name: 'du-chun-sheng-1', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744175.289507',
                },
                {
                    show_name: 'du-chun-sheng-2', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744248.263966',
                },
                {
                    show_name: 'du-chun-sheng-3', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744252.66969',
                },
                {
                    show_name: 'du-chun-sheng-4', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744316.400795',
                },
                {
                    show_name: '陈锡伟-1', folder: 'wado/陈锡伟(75771)/1.2.3.4.5.2680727744.19710702.11343/1.2.3.4.5.2680727744.19710702.11343.70612',
                },
                {
                    show_name: '陈锡伟-2', folder: 'wado/陈锡伟(75771)/1.2.3.4.5.2680727744.19710702.11343/1.2.3.4.5.2680727744.19710702.11343.70613',
                },
                {
                    show_name: '陈锡伟-3', folder: 'wado/陈锡伟(75771)/1.2.3.4.5.2680727744.19710702.11343/1.2.3.4.5.2680727744.19710702.11343.70614',
                },
                {
                    show_name: '陈锡伟-4', folder: 'wado/陈锡伟(75771)/1.2.3.4.5.2680727744.19710702.11343/1.2.3.4.5.2680727744.19710702.11343.70615',
                },
                {
                    show_name: '杜春生-1', folder: 'wado/杜春生(242175)/1212.193.11.154.1248.177.202407120813190/1212.193.11.154.1248.177.202407120813190.1002',
                },
                {
                    show_name: '杜春生-2', folder: 'wado/杜春生(242175)/1212.193.11.154.1248.177.202407120813190/1212.193.11.154.1248.177.202407120813190.1004',
                },
                // {
                //     show_name: '测试', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744175.289508/Image1.DCM',
                // },
                // {
                //     show_name: '测试2', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744175.289509/Image1.DCM',
                // },
                // {
                //     show_name: '测试3', folder: 'wado/du-chun-sheng(101785)/1.2.392.200036.9116.2.5.1.48.1214228087.1720743354.530615/1.2.392.200036.9116.2.5.1.48.1214228087.1720744175.289510/Image1.DCM',
                // },
            ],
            
            // synchorizer
            scroll_synchronizer: '', wwwc_synchronizer: '',

            // thumbnail img
            left_thumb: [], right_thumb: [],
            left_stack: '', right_stack: '',
        }
    },

    computed: {
        curr_lefter() {
            let temper = this.series_list.filter(item => item.show_name == this.left_value)[0]
            return { disabled: false, ...temper }
        },

        curr_righter() {
            let temper = this.series_list.filter(item => item.show_name == this.right_value)[0]
            return {
                disabled: false, ...temper
            }
        },

        curr_width() { return window.innerWidth },
    },

    async created() {
        this.left_value = this.series_list[3].show_name
        this.right_value = this.series_list[0].show_name

        this.series_list.forEach(series => {
            this.fetch_thumbnail(series)
        })
    },

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
        
        cornerstoneTools.setToolActive("Wwwc", {
            mouseButtonMask: 1, 
            synchronizationContext: this.wwwc_synchronizer,
        })
        
    },

    methods: {
        // package synchronizer
        sync_scroll_synchronizer(
            synchronizer, sourceElement, targetElement, eventData) {
            if (!eventData) { return }

            const isLeft = sourceElement.id.includes('left')
            const source_stack = isLeft ? this.left_stack : this.right_stack
            const target_stack = isLeft ? this.right_stack : this.left_stack
            const old_index = eventData.oldImage.imageId
            const index = eventData.image.imageId

            eventData.direction = index > old_index ? 1 : -1

            if (this.left_stack != '' && this.right_stack != '') {
                const imaginal_index = target_stack.total * source_stack.percentage

                eventData.direction = Math.round(imaginal_index - target_stack.curr)
            }

            return cornerstoneTools.stackScrollSynchronizer(
                synchronizer, sourceElement, 
                targetElement, eventData
            )
        },

        select_series(location, name) {
            if (location == 'left') { this.left_value = name }
            if (location == 'right') { this.right_value = name }
            this.$forceUpdate()
        },

        async fetch_thumbnail(series) {
            const info = await post_data(`${this.base_url}/${series.folder}`, { type: 'thumbnail' }, 15000)
            if (typeof info.data != 'undefined') {
                this.left_thumb.push({
                    thumb: `${this.base_url}/${info.data.thumb_path}`,
                    show_name: series.show_name,
                    total_num: info.data.total_num,
                })
            }
        },

        collect_info(loc, stack) {
            if (loc == 'left') { this.left_stack = stack} 
            else if (loc == 'right') { this.right_stack = stack }
        },
    },
}
</script>


<template>
    <div class = "cornerstone_app">
        <div class = "cornerstone_fa">
            <div class = "cornerstone_button" v-if = "curr_width > 600">
                <div v-for = "item in left_thumb" :key = "item.show_name" :id = "item.show_name">
                    <img :src = "item.thumb"
                    @click = "select_series('left', item.show_name)"
                    :disabled = "curr_lefter.disabled"
                    style = "width: 75px; height: 75px; margin: 5px 0;" />
                    <div style = "text-align: center;">{{ item.total_num }}</div>
                </div>
                
            </div>

            <select v-else v-model = "left_value" class = "cornerstone_button">
                <option v-for = "item in series_list" :key = "item.show_name" :id = "item.show_name">{{ item.show_name }}</option>
            </select>

            <AboutView :key = "`left-${curr_lefter.show_name}`"
                :series = "curr_lefter.folder" :location = "'left'"
                :require_url = "base_url" :synchronizer = "[scroll_synchronizer, wwwc_synchronizer]"
                @img_stack = "collect_info"  />
        
            
            
        </div>

        <div>
            <button @click = "scroll_synchronizer.enabled = !scroll_synchronizer.enabled">滚动联动</button>
            <button @click = "wwwc_synchronizer.enabled = !wwwc_synchronizer.enabled">对比联动</button>
        </div>

        <div class = "cornerstone_fa">
            <select v-if = "curr_width <= 600" v-model = "right_value" class = "cornerstone_button">
                <option v-for = "item in series_list" :key = "item.show_name" :id = "item.show_name">{{ item.show_name }}</option>
            </select>

            <AboutView :key = "`right-${curr_righter.show_name}`"
                :series = "curr_righter.folder" :location = "'right'"
                :require_url = "base_url" :synchronizer = "[scroll_synchronizer, wwwc_synchronizer]"
                @img_stack = "collect_info" />
        
            <div class = "cornerstone_button" v-if = "curr_width > 600">
                <button v-for = "item in series_list" :key = "item.show_name" :id = "item.show_name"
                    @click = "select_series('right', item.show_name)"
                    :disabled = "curr_righter.disabled"
                    style = "margin-bottom: 10px;">{{ item.show_name }}</button>
            </div>
        </div>
        <!-- <home-view api_url = "http://192.168.124.22:8086/test" :left_series = "curr_lefter.folder" :right_series = "curr_righter.folder"/> -->
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
