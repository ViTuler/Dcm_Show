<script>
import ConrnerView from '@/components/conrner_view.vue'
import ReportView from '@/components/report_view.vue'

import { back_server, post_data } from '@/utils/vi_tools'


export default {
    name: "singler",

    components: { 
        ConrnerView,
        ReportView,
    },

    data() {
        return {
            // para
            corner_para: {
                require_url: `${back_server()}/dicom`,
                location: 'center',
            },

            // data
            yizhu_id: '',
            dcm_list: [],
            report_info: {},

            // control
            curr_show: 'report',
            curr_dcm_path: null,
        }
    },

    watch: {
        curr_dcm_path(newv) {
            if (typeof newv == 'string') {
                if (this.curr_show == 'report') {
                    this.curr_show = 'dcm'
                }
            } else if (newv == null) {
                this.curr_show = 'report'
            }
        }
    },

    async created() {
        const urlParams = new URLSearchParams(window.location.search)

        this.yizhu_id = urlParams.get('id')
        this.get_report()
    },

    methods: {
        set_dcm(dcm_paths) {
            this.dcm_list = dcm_paths
        },

        choose_dcm(dcm_path) {
            this.curr_dcm_path = dcm_path
        },

        async get_report() {
            const url_para = {type: 'pers_info', yizhu_id: this.yizhu_id}
            const resp = await post_data(`${back_server()}/dicom/1`, url_para)

            if (resp.code == 20000) {
                this.report_info = resp.rpt_info
                this.dcm_list = resp.dcm_path
            }
        },
    }

}
</script>


<template>
    <div class = "single">
        <div v-if = "curr_show == 'report'">
            <ReportView 
                :report_info = "report_info" 
                :report_id = "yizhu_id" 
                :dcm_list = "dcm_list"
                @choose_dcm = "choose_dcm"
                />
        </div>

        <div v-if = "curr_show == 'dcm'">
            <el-button @click = "choose_dcm(null)" type = "primary" size = "mini">返回报告</el-button>
            
            <conrner-view v-if = "curr_show == 'dcm'"
                :dcm_path = "curr_dcm_path"
                :require_url = "corner_para.require_url" 
                :location = "corner_para.location"/>
        </div>
    </div>
</template>


<style lang="scss">
.single {
    .dcm_contain {
        display: flex; align-items: center; text-align: center;
        .dcm_button {
            margin: 5px 0;
        }
    }
    
}
</style>