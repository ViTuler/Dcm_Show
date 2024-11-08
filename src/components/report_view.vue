<script>
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

    computed: {
        all_dcm_list() {
            const original_dcm_list = this.dcm_list.map(dcm => {
                return {
                    dcm_path: dcm.dcm_path,
                    file_name: `(原)${dcm.file_name}`
                }
            })

            return [ ...this.dcm_list, ...original_dcm_list, ]
        },
    },  

    methods: {
        choose_dcm(dcm) {
            const is_original = dcm.file_name.includes('(原)')
            this.$emit('choose_dcm', dcm.dcm_path, is_original)
        },
    }

}

</script>


<template>
<div :class = "`${report_id} report`">
    <div>
        <div class = "title">南阳南石医院检查报告单</div>
        <el-divider />

        <el-descriptions class = "basic_info" :column = "3">
            <el-descriptions-item label = "姓名">{{ report_info['姓名'] }}</el-descriptions-item>

            <el-descriptions-item label = "性别">{{ report_info['性别'] }}</el-descriptions-item>
            
            <el-descriptions-item label="年龄">{{ report_info['年龄'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查号">{{ report_info['检查号'] }}</el-descriptions-item>

            <el-descriptions-item label = "科室">{{ report_info['科室'] }}</el-descriptions-item>

            <el-descriptions-item label = "床号">{{ report_info['床号'] }}</el-descriptions-item>

            <el-descriptions-item label = "门诊号">{{ report_info['门诊号'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查项目" :span = "2">{{ report_info['检查项目'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查日期" :span = "3">{{ report_info['检查日期'] }}</el-descriptions-item>

            <el-descriptions-item label = "报告时间" :span = "3">{{ report_info['报告时间'] }}</el-descriptions-item>

        </el-descriptions><el-divider />

        <el-descriptions class = "report_info" :column = "1">
            <el-descriptions-item label = "检查部位及方法">{{ report_info['标本部位'] }}</el-descriptions-item>

            <el-descriptions-item label = "检查所见">{{ report_info['检查所见'] }}</el-descriptions-item>

            <el-descriptions-item label = "诊断意见">{{ report_info['诊断意见'] }}</el-descriptions-item>

            <el-descriptions-item label = "影像报告" >
                <div class = "img_desc">
                    <el-button class = "dcm_button" size = "mini"
                        v-for = "dcm in all_dcm_list" :key = "dcm.file_name" 
                        @click = "choose_dcm(dcm)" 
                        type = "primary">{{ dcm.file_name }}</el-button>
                </div>
                
            </el-descriptions-item>
        </el-descriptions><el-divider />

        <el-descriptions class = "report_foot" :column = "2">
            <el-descriptions-item label = "报告医生">{{ report_info['报告医生'] }}</el-descriptions-item>

            <el-descriptions-item label = "审核医生">{{ report_info['审核医生'] }}</el-descriptions-item>
        </el-descriptions>
    </div>
</div>
</template>

<style lang="scss">
@media screen and (max-width: 600px){
    .report {
        margin: 10px 20px;

        .title {
            margin: 20px auto; width: 60vw; text-align: center;
            font-weight: bold; font-size: 20px;
        }

        .basic_info {
            div { margin: 4px 0; }
            .el-descriptions-item.el-descriptions-item__cell {
                padding-bottom: 0px;
                font-size: 14px;
            }
        }

        .report_info {
            min-height: 50vh;
            div { margin: 8px 0; }
            .img_desc {
                display: inline-block;
                .dcm_button {
                    margin: 2px .3em;
                }
            }
        }

        .report_foot {
            margin-bottom: 10px;

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