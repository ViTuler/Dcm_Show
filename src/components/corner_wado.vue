<script>
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'

import { post_data as post, back_server } from '@/utils/vi_tools'


export default {
    props: {
        img_id: { required: true, type: String },
        dcm_path: { required: true, type: String },
    },

    data() {
        return {
            server_url: back_server(),

            img_stack: { currentImageIdIndex: 0, imageIds: [], },
            img_info: {},
            tool_status: {},

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
                    { para_name: 'kVP', show_name: 'KVP' },
                    { para_name: 'sliceThickness', show_name: 'Thk' },
                ],

                right_bottom: [
                    { para_name: 'size', show_name: '' },
                    { para_name: 'modality', show_name: '' },
                    { para_name: 'windowWidth', show_name: 'WW' },
                    { para_name: 'windowCenter', show_name: 'WL' },
                ],
            },

            curr_view: { name: '正常视窗' },
            view_info: {
                basic_info: {name: '正常视窗'},
                bone_info: { center: 500, width: 1500, name: '骨窗'},
                mediastinum_info: { center: 35, width: 320, name: '纵膈窗'},
                lung_info: { center: -600, width: 1600, name: '肺窗'},
                skull_info: { center: 35, width: 80, name: '脑窗'},
                abdomen_info: { center: 35, width: 330, name: '腹窗'},
                spine_info: { center: 35, width: 300, name: '脊柱窗'},
                felsen_info: { center: 500, width: 4000, name: '颞骨窗'},
                postmyelo_info: { center: 200, width: 1000, name: '脊髓窗'},
            },
        }
    },

    computed: {
        curr_iinfo() {
            const index = this.img_stack.currentImageIdIndex
            const img_element = document.getElementById(this.img_id)

            if (img_element == null) {
                return null
            }
            
            const info = {
                index: index,
                ele: cornerstone.getEnabledElement(img_element),
                metadata: Object.values(this.img_info)[index],
            }

            if (typeof info.metadata != 'undefined') {
                info.metadata.images = `${index+1}/${this.img_stack.imageIds.length}`
            } else {
                info.metadata = {
                    images: `${index+1}/${this.img_stack.imageIds.length}`
                }
            }

            return info
        },
    },

    watch: {
        curr_view(newv) {
             if (this.series != 'undefined') {
                this.adjust_para('windowWidth', newv.width || this.curr_iinfo.metadata.windowWidth)
                this.adjust_para('windowCenter', newv.center || this.curr_iinfo.metadata.windowCenter)
            }
        },

        'img_stack.currentImageIdIndex': function(newv) {
            // console.log(cornerstone.metaData.get('scalingModule', this.img_id))

            if (this.curr_view.name != '正常视窗') {
                return
            } else {
                const metadata = Object.values(this.img_info)[newv]

                const img_element = document.getElementById(this.img_id)
                const element = cornerstone.getEnabledElement(img_element)
                const view_port = cornerstone.getViewport(element.element)

                view_port.voi = {
                    windowCenter: metadata?.windowCenter || 450,
                    windowWidth: metadata?.windowWidth || 1500,
                }

                // console.log(view_port)
                cornerstone.setViewport(element.element, view_port)
                cornerstone.updateImage(element.element)
            }
            
        },
    },

    async mounted() {
        let resp = await post(`${this.server_url}/dicom/${this.dcm_path}?ori=1`)

        this.$emit('finish_loading')

        if (typeof resp == 'string') {
            resp = JSON.parse(resp)
        }

        if (resp.code == 20000) {
            let file_list = resp.data.file_list.map(
                ele => `wadouri:${this.server_url}/dicom/${ele}?ori=1`
            )

            this.img_stack.imageIds = file_list
        } else {
            this.$message.error(resp.res)
        }

        cornerstone.metaData.addProvider((key, img_id) => {
            const img_path = img_id.replace(`wadouri:${this.server_url}/`, '')

            if (Object.keys(this.img_info).includes(img_path)) {
                return this.img_info[img_path][key] 
            } else {
                return undefined
            }
        })

        this.init_img()
        
    },

    methods: {
        async init_img() {
            await this.catch_info()

            if (this.img_stack.imageIds.length != Object.keys(this.img_info).length) {
                this.$message.warning('未找到部分图像元数据，将重新加载数据')
                await this.catch_info(true)
                window.location.reload()
            }

            const img_ele = document.getElementById(this.img_id)
            cornerstone.enable(img_ele)

            // for (let img of this.img_stack.imageIds) {
            //     await cornerstone.loadAndCacheImage(img)
            // }

            this.img_stack.imageIds.slice(0, 5).forEach(img => {
                cornerstone.loadAndCacheImage(img)
            })

            cornerstone.loadImage(this.img_stack.imageIds[0]).then(async (img) => {
                cornerstone.displayImage(img_ele, img)

                cornerstoneTools.addStackStateManager(img_ele, ['stack', 'Crosshairs', 'StackScroll', 'Wwwc'])
                cornerstoneTools.addToolState(img_ele, 'stack', this.img_stack)

                this.$forceUpdate()
                // this.get_metadata()
            })

            this.init_tool()
            this.load_img()
        },

        async load_img() {
            // for (let img of this.img_stack.imageIds) {
            //     await cornerstone.loadAndCacheImage(img)
            // }

            // this.img_stack.imageIds.forEach(img => {
            //     cornerstone.loadAndCacheImage(img)
            // })

            const batchSize = 5
            const imageIds = this.img_stack.imageIds

            const loadBatch = async (batch) => {
                await Promise.all(
                    batch.map(img => cornerstone.loadAndCacheImage(img))
                )
            }

            for (let i = 0; i < imageIds.length; i += batchSize) {
                const batch = imageIds.slice(i, i + batchSize)
                await loadBatch(batch)
            }
        },

        init_tool() {
            const img_ele = document.getElementById(this.img_id)
            
            // the default tools that won't be controlled
            cornerstoneTools.setToolActiveForElement(img_ele, 'ScaleOverlay')
            cornerstoneTools.setToolActiveForElement(img_ele, 'StackScrollMouseWheel', {})
           
            // cornerstoneTools.setToolActiveForElement(img_ele, 'Length', { mouseButtonMask: 1 })

            this.register_tool(['StackScroll'], true)
            this.register_tool(['Length', 'Wwwc', 'Zoom', 'Pan', 'WwwcRegion'], false)
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

        async catch_info(need_force) {
            const url = `${this.server_url}/dicom/1`
            // const url = `http://192.168.3.12:6080/dicom/1`
            const url_para = { type: 'info', dcm_path: this.dcm_path, }
            if (need_force) { url_para.force_new = 1 }

            const resp = await post(url, url_para)
            if (resp.code == 20000) {
                delete resp.code; delete resp.res; delete resp.total_num
                this.img_info = resp
            }
        },

        filter_show(info) {
            const is_undef = (item) => typeof this.curr_iinfo?.metadata[item.para_name] == 'undefined'

            const is_null = (item) => ['', null].includes(this.curr_iinfo?.metadata[item.para_name])

            return info.filter(
                item => !is_undef(item) && !is_null(item)
            )
        },

        opera_tool(keyword) {       
            const img_element = document.getElementById(this.img_id)

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

        adjust_para(key, value) {
            const img_element = document.getElementById(this.img_id)
            const element = cornerstone.getEnabledElement(img_element)
            const image = element.image

            if (image, image.hasOwnProperty(key)) {
                const view_port = cornerstone.getViewport(element.element)

                view_port.voi[key] = value
                cornerstone.setViewport(element.element, view_port)
                cornerstone.updateImage(element.element)
            } else {
                console.log(`Cant Found Current Image Parameter ${key}`)
            }
        },
    },
}
</script>

<template>
<div class = "wado_show">

    <div style = "margin: 5px 0;">
        <button @click = "opera_tool('StackScroll')">滚动</button>
        <button @click = "opera_tool('Length')">测距</button>
        <button @click = "opera_tool('Wwwc')">对比</button>
        <button @click = "opera_tool('WwwcRegion')">高亮</button>
        <button @click = "opera_tool('Zoom')">缩放</button>
        <button @click = "opera_tool('Pan')">移动</button>
        <button @click = "opera_tool('DragProbe')">RGB</button>
        <button @click = "opera_tool('Magnify')">放大镜</button>
        <select v-model = "curr_view">
            <option v-for = "view in view_info" :key = "view.name" :value = "view" >{{ view.name }}</option>
        </select>
    </div>

    <div :id = "img_id"
        style = "height: 500px; position: absolute; width: 94%; margin: 5px;">
        <canvas class = "cornerstone-canvas" />

        <div v-for = "(item, index) in filter_show(show_info.left_top)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{top: `${index * 20 + 5}px`, left: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_iinfo.metadata[item.para_name]}` : `${item.show_name}:${curr_iinfo.metadata[item.para_name]}` }}
        </div>

        <div v-for = "(item, index) in filter_show(show_info.right_top)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{top: `${index * 20 + 5}px`, right: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_iinfo.metadata[item.para_name]}` : `${item.show_name}:${curr_iinfo.metadata[item.para_name]}` }}
        </div>

        <div v-for = "(item, index) in filter_show(show_info.left_bottom)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{bottom: `${index * 20 + 5}px`, left: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_iinfo.metadata[item.para_name]}` : `${item.show_name}:${curr_iinfo.metadata[item.para_name]}` }}
        </div>

        <div v-for = "(item, index) in filter_show(show_info.right_bottom)" 
            :key = "item.para_name" class = "shown_info"
            :style = "{bottom: `${index * 20 + 5}px`, right: '5px', position: 'absolute', color: 'white',}"> 
            {{ item.show_name == '' ? `${curr_iinfo.metadata[item.para_name]}` : `${item.show_name}:${curr_iinfo.metadata[item.para_name]}` }}
        </div>
    </div>
</div>
</template>

<style lang="scss">
.wado_show {
    width: 100vw; flex-grow: 1;

    .shown_info { font-size: 12px; }
}
</style>