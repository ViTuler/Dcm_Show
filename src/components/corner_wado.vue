<script>
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'

import { post_data as post } from '@/utils/vi_tools'
import { server_list } from '@/utils/constant'


export default {
    props: {
        id: {required: true, type :String},
    },

    data() {
        return {
            dcm_server: server_list.yt_dicom,

            tool_list: {

            },
        }
    },

    computed: {
        curr_metadata() {},
    },

    async mounted() {

    },

    methods: {
        async post_data(url, url_para, timeout) {
            const resp = await post(url, url_para)

            if (resp?.code == 20000) {

            }
        },

        init_img() {

        },

        init_tool() {

        },


    },
}
</script>

<template>
<div class = "wado_show">
    <div :id = "id"
        style = "height: 500px; position: absolute;">
        <canvas class = "cornerstone-canvas" />
    </div>
</div>
</template>

<style lang="scss">
.wado_show {

}
</style>