<script>
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'

import { post_data } from '@/utils/vi_tools'


export default {
    name: "corner",

    props: {
        require_url: { required: true, type: String },
        dcm_path: { required: true, type: String, },
        location: { required: true, type: String, },
        synchronizer: { default() {return []}, type: Array, },
    },

    data() {
        return {
            img_info: '', 
            total_num: 0,
            is_loading: false,
            tool_status: {},
            img_stack: { currentImageIdIndex: 0, imageIds: [], },
            show_info: {
                left_top: [
                    { para_name: 'patientName', show_name: 'Name' },
                    { para_name: 'patientSex', show_name: 'Gender' },
                    { para_name: 'seriesNumber', show_name: 'Series' },
                    { para_name: 'images', show_name: 'Image' },
                ],
                right_top: [
                    { para_name: 'institutionName', show_name: '' },
                    { para_name: 'accessionNumber', show_name: 'Acc' },
                    { para_name: 'acquisitionDatetime', show_name: 'Acq' },
                ],

                left_bottom: [
                    { para_name: 'pixelSpacing', show_name: 'PixelSpacing' },
                    { para_name: 'windowWidth', show_name: 'WW' },
                    { para_name: 'kVP', show_name: 'KVP' },
                    { para_name: 'sliceThickness', show_name: 'Thk' },
                    
                ],

                right_bottom: [
                    { para_name: 'size', show_name: '' },
                    { para_name: 'modality', show_name: '' },
                ],
            },

        }
    },

    computed: {
        curr_metadata() {
          
            let temper = this.img_stack.currentImageIdIndex
            temper = this.img_stack.imageIds[temper]
       
            if (typeof temper == 'undefined') { return {} }
            temper = temper.replace(`${this.require_url}/`, '')
            
            // add other parameter to metadata
            
            return { 
                images: `${this.img_stack.currentImageIdIndex + 1}/${this.img_stack.imageIds.length}`, 
                ...this.img_info[temper] 
            }
        },
    },

    watch: {
        'img_stack': {
            deep: true,
            handler(newv) {
                const percentage = (newv.currentImageIdIndex + 1) / newv.imageIds.length
                const curr = newv.currentImageIdIndex +1

                this.$emit('img_stack', this.location, {
                    percentage: percentage, curr: curr, 
                    total: newv.imageIds.length
                })
            },
        }
    },

    async mounted() {
        this.is_loading = true
        let resp = await this.fetch_img(
            `${this.require_url}/1`, 
            {
                type: 'info', dcm_path: this.dcm_path,
            }
        )
        this.is_loading = false

        if (resp.hasOwnProperty('res')) { 
            this.$message.error(resp.res)
            return 
        }
        
        this.total_num = resp.total_num
        delete resp.code; delete resp.total_num; delete resp.res
        this.img_info = resp
        
        this.img_stack.imageIds = Object.keys(resp)
            .map(img => `${this.require_url}/${img}`)

        
        cornerstone.metaData.addProvider(this.get_image_metadata.bind(this))
        this.init_img()

        this.finish_load_image()
        // if (this.total_num > 10) {
        //     this.finish_load_image()
        // }
        
    },

    methods: {
        async finish_load_image() {        
            const interval_id = setInterval(async () => {
                let local_cached_num = 0
                let resp = await this.fetch_img(
                    `${this.require_url}/1`, 
                    { type: 'info', dcm_path: this.dcm_path, }
                )
                
                local_cached_num = resp.total_num
                delete resp.total_num

                this.img_info = resp
                this.img_stack.imageIds = Object.keys(resp)
                    .map(img => `${this.require_url}/${img}`)
                
                this.init_img()

                if (local_cached_num == this.total_num) {
                    console.log('Finish Loading Images')
                    clearInterval(interval_id)
                }
            }, 5000)
        },

        async fetch_img(url, url_para) {
            let resp = await post_data(url, url_para, 60000,)

            if (resp.code == 20000) {
                delete resp.code; delete resp.res
            } else {
                this.$message.error(resp.res)
            } return resp         
        },

        register_tool(name, status) {
            if (typeof name == 'string') {
                this.tool_status[name] = status

            } else if (Array.isArray(name)) {
                name.forEach(item => {
                    this.tool_status[item] = status
                })
            }
        },

        init_tool() {
            const img_element = document.getElementById(`${this.location}/${this.series}/img_element`)
            
            // the default tools that won't be controlled
            cornerstoneTools.setToolActiveForElement(img_element, 'ScaleOverlay')
            
            
            cornerstoneTools.setToolActiveForElement(img_element, 'StackScrollMouseWheel', {})
           
            
            // cornerstoneTools.setToolActiveForElement(img_element, 'Length', { mouseButtonMask: 1 })

            this.register_tool(['StackScroll'], true)
            this.register_tool(['Length', 'Wwwc', 'Zoom', 'Pan'], false)
        },

        async init_img() {
            const img_element = document.getElementById(`${this.location}/${this.series}/img_element`)

            if (img_element == null) {
                console.log('Shown Element is Null')
                return
            }
            
            let img_fa = document.getElementById(`${this.location}/cornerstone`)
            img_element.style.width = `${img_fa.offsetWidth - 10}px`
            
            cornerstone.enable(img_element)

            this.img_stack.imageIds.forEach(img => cornerstone.loadAndCacheImage(img))

            cornerstone.loadImage(this.img_stack.imageIds[0]).then((img) => {
                cornerstone.displayImage(img_element, img)

                // add curr element to all synchronizers
                this.synchronizer.forEach(syncer => {syncer.add(img_element)})

                cornerstoneTools.addStackStateManager(img_element, ['stack', 'Crosshairs', 'StackScroll', 'Wwwc'])
                cornerstoneTools.addToolState(img_element, 'stack', this.img_stack)
            })
            
            this.init_tool()
        },

        filter_show(info) {
            const is_undef = (item) => typeof this.curr_metadata[item.para_name] == 'undefined'

            const is_null = (item) => ['', null].includes(this.curr_metadata[item.para_name])

            return info.filter(
                item => !is_undef(item) && !is_null(item)
            )
        },

        opera_tool(keyword) {       
            const img_element = document.getElementById(`${this.location}/${this.series}/img_element`)

            for (const tool in this.tool_status) {
                if (this.tool_status[tool]) {
                    cornerstoneTools.setToolPassiveForElement(img_element, tool)
                    this.tool_status[tool] = false
                }
            }

            if (this.tool_status[keyword]) {
                cornerstoneTools.setToolPassiveForElement(img_element, keyword,)
                this.tool_status[keyword] = false
            } else {
                cornerstoneTools.setToolActiveForElement(img_element, keyword, { mouseButtonMask: 1 })
                this.tool_status[keyword] = true
            }
        },

        get_image_metadata(keyword, img_id) { 
            let temper = img_id.replace(`${this.require_url}/`, '')
            if (Object.keys(this.img_info).includes(temper)) {
                return this.img_info[temper][keyword] 
            }
        },
    },
}
</script>

<template>
<div :id = "`${$props.location}/cornerstone`" style = "flex-grow: 1; "
    class = "corner_item"
    v-loading = "is_loading"
    element-loading-text = "拼命加载中..."
    element-loading-spinner = "el-icon-loading"
    element-loading-background = "rgba(0, 0, 0, 0.8)">

    <div style = "margin: 5px 0;">
        <button @click = "opera_tool('StackScroll')">滚动</button>
        <button @click = "opera_tool('Length')">测距</button>
        <button @click = "opera_tool('Wwwc')">对比</button>
        <button @click = "opera_tool('Zoom')">缩放</button>
        <button @click = "opera_tool('Pan')">移动</button>
        <button @click = "opera_tool('DragProbe')">RGB</button>
        <button @click = "opera_tool('Magnify')">放大镜</button>
    </div>
    
    <div :id = "`${$props.location}/${$props.series}/img_element`" 
        style = "height: 500px; position: absolute; ">
        <canvas class = "cornerstone-canvas"/>

        <div v-for = "(item, index) in filter_show(show_info.left_top)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{top: `${index * 20 + 5}px`, left: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_metadata[item.para_name]}` : `${item.show_name}:${curr_metadata[item.para_name]}` }}
        </div>

        <div v-for = "(item, index) in filter_show(show_info.right_top)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{top: `${index * 20 + 5}px`, right: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_metadata[item.para_name]}` : `${item.show_name}:${curr_metadata[item.para_name]}` }}
        </div>

        <div v-for = "(item, index) in filter_show(show_info.left_bottom)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{bottom: `${index * 20 + 5}px`, left: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_metadata[item.para_name]}` : `${item.show_name}:${curr_metadata[item.para_name]}` }}
        </div>

        <div v-for = "(item, index) in filter_show(show_info.right_bottom)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{bottom: `${index * 20 + 5}px`, right: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_metadata[item.para_name]}` : `${item.show_name}:${curr_metadata[item.para_name]}` }}
        </div>
        
    </div>
    <!-- <div style = "position: absolute;">{{ curr_metadata }}</div> -->
</div>
</template>

<style lang = "scss" scoped>
.corner_item {
    min-height: 500px;
}

@media screen and (max-width: 600px){
.shown_info {
    font-size: 10px;
}}

@media screen and (min-width: 600px){
.shown_info{
    font-size: 12px;
}}
</style>