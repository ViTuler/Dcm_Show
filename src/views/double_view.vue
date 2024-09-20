<script>
import ConrnerView from '@/components/conrner_view.vue'

import * as cornerstoneTools from 'cornerstone-tools'


import { post_data } from '@/utils/vi_tools'



export default {
    name: 'double_viewer',

    components: { ConrnerView },
    
    data() {
        return {
            base_url: 'http://192.168.124.22:9010/dicom',
            left_value: '', right_value: '',
            series_list: [
                {
                    show_name: '某人', patient_id: '12345',
                },
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
            let temper = this.series_list.filter(
                item => item.show_name == this.left_value)[0]
            
            return { disabled: false, ...temper }
        },

        curr_righter() {
            let temper = this.series_list.filter(
                item => item.show_name == this.right_value)[0]

            return {disabled: false, ...temper}
        },

        curr_width() { return window.innerWidth },
    },

    async created() {
        this.left_value = this.series_list[0].show_name
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
            const url_para = { type: 'thumbnail', patient_id: series.patient_id }
            const info = await post_data(`${this.base_url}/1`, url_para, 15000)

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

            <ConrnerView :key = "`left-${curr_lefter.show_name}`"
                :patient_id = "curr_lefter.patient_id" :location = "'left'"
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

            <ConrnerView :key = "`right-${curr_righter.show_name}`"
                :patient_id = "curr_righter.patient_id" :location = "'right'"
                :require_url = "base_url" :synchronizer = "[scroll_synchronizer, wwwc_synchronizer]"
                @img_stack = "collect_info" />
        
            <div class = "cornerstone_button" v-if = "curr_width > 600">
                <button v-for = "item in series_list" :key = "item.show_name" :id = "item.show_name"
                    @click = "select_series('right', item.show_name)"
                    :disabled = "curr_righter.disabled"
                    style = "margin-bottom: 10px;">{{ item.show_name }}</button>
            </div>
        </div>

        <!-- <home-view api_url = "http://192.168.124.22:8086/test" :left_series = "curr_lefter.patient_id" :right_series = "curr_righter.patient_id"/> -->

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
