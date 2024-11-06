<script>
import ConrnerView from '@/components/conrner_view.vue'
import ReportView from '@/components/report_view.vue'
import ConrnerWado from '@/components/corner_wado.vue'

import { back_server, post_data } from '@/utils/vi_tools'


export default {
    name: "singler",

    components: { 
        ConrnerView,
        ReportView,
        ConrnerWado,
    },

    data() {
        return {
            // para
            corner_para: {
                require_url: `${back_server()}/dicom`,
                require_org_url: `${back_server()}/dicom/original`,
                location: 'center',
            },

            // data
            yizhu_id: '',
            dcm_list: [],
            report_info: {},

            // control
            curr_show: 'report',
            curr_dcm_path: null,
            loading: true,
            show_org: false,
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

        choose_dcm(dcm_path, is_original) {
            this.curr_show = 'dcm'
            this.show_org = is_original
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
        <!-- <ConrnerWado
                :dcm_path = "'MR/20241011/1.2.3.4.5.2680727744.19661011.12144'"
                :img_id = "`test/image`"
                @finish_loading = "loading = false" /> -->

        <div v-if = "curr_show == 'report'">
            <ReportView 
                :report_info = "report_info" 
                :report_id = "yizhu_id" 
                :dcm_list = "dcm_list"
                @choose_dcm = "choose_dcm"
                />
        </div>

        <div v-if = "curr_show == 'dcm'">
            <div style = "display: flex; align-items: center">
                <el-button @click = "choose_dcm(null, null)" type = "primary" size = "mini">返回报告</el-button>

                <el-button @click = "show_org = true" type = "primary" size = "mini" v-if = "!show_org">查看原图</el-button>

                <div v-if = "loading" class = "load_text"> 校验信息中... </div>
            </div>
            
            <ConrnerView v-if = "!show_org"
                :dcm_path = "curr_dcm_path"
                :require_url = "corner_para.require_url" 
                :location = "corner_para.location"
                @finish_loading = "loading = false" />

            <ConrnerWado v-else
                :dcm_path = "curr_dcm_path"
                :img_id = "`${curr_dcm_path}/image`"
                @finish_loading = "loading = false" />
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

    .load_text {
        margin-left: 10px; font-size: 12px; font-weight: bold;
    }
}
</style>