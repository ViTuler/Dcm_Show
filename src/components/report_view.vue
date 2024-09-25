<script>
import { post_data, back_server, format_date } from '@/utils/vi_tools'
import { Object } from 'core-js';


export default {
    props: {
        report_info: { required: true, type: Object },
        report_id: { required: true, type: String },
        dcm_list: { required: false, type: Array },
    },

    data() {
        return {
            report_info_test: {},
        }
    },

    methods: {
        choose_dcm(dcm_path) {
            this.$emit('choose_dcm', dcm_path)
        },
    }

}

</script>


<template>
<div :class = "`${report_id} report`">
    <div>
        <div class = "title">南阳南石医院检查报告单</div>
        <el-divider />

        <el-descriptions class = "basic_info" :column = "4">
            <el-descriptions-item label = "姓名">{{ report_info['姓名'] }}</el-descriptions-item>

            <el-descriptions-item label = "性别">{{ report_info['性别'] }}</el-descriptions-item>
            
            <el-descriptions-item label="年龄">{{ report_info['年龄'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查号">{{ report_info['检查号'] }}</el-descriptions-item>

            <el-descriptions-item label = "科室">{{ report_info['科室'] }}</el-descriptions-item>

            <el-descriptions-item label = "床号">{{ report_info['床号'] }}</el-descriptions-item>

            <el-descriptions-item label = "门诊号">{{ report_info['门诊号'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查项目">{{ report_info['检查项目'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查日期" :span = "2">{{ report_info['检查日期'] }}</el-descriptions-item>

            <el-descriptions-item label = "报告时间" :span = "2">{{ report_info['报告时间'] }}</el-descriptions-item>

        </el-descriptions><el-divider />

        <el-descriptions class = "report_info" :column = "1">
            <el-descriptions-item label = "检查部位及方法">{{ report_info['标本部位'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查所见">{{ report_info['检查所见'] }}</el-descriptions-item>

            <el-descriptions-item label = "诊断意见">{{ report_info['诊断意见'] }}</el-descriptions-item>

            <el-descriptions-item label = "影像报告">
                <el-button class = "dcm_button" size = "mini"
                    v-for = "dcm in dcm_list" :key = "dcm.dcm_path" 
                    @click = "choose_dcm(dcm.dcm_path)" 
                    type = "primary">{{ dcm.file_name }}</el-button>
            </el-descriptions-item>
        </el-descriptions><el-divider />

        <el-descriptions class = "report_foot" :column = "2">
            <el-descriptions-item label = "审核医生">{{ report_info['审核医生'] }}</el-descriptions-item>

            <el-descriptions-item label = "报告医生">{{ report_info['报告医生'] }}</el-descriptions-item>
        </el-descriptions>
    </div>
</div>
</template>

<style lang="scss">
@media screen and (max-width: 600px){
    .report {
        margin: 10px 20px;

        .title {
            margin: 5px auto; width: 40vw; text-align: center;
        }

        .basic_info {
            div { margin: 4px 0; }
            .el-descriptions-item.el-descriptions-item__cell {
                padding-bottom: 0px;
            }
        }

        .report_info {
            div { margin: 8px 0; }
            min-height: 50vh;
            .dcm_button {
                margin: 2px 0;
            }
        }

        .report_foot {
            .el-descriptions-item.el-descriptions-item__cell {
                padding-bottom: 0px;
            }
        }
    }
}

.report {
    height: 40vh;
}
</style>