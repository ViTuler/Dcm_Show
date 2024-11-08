<script>
import ConrnerView from '@/components/conrner_view.vue'


export default {
    components: {
        ConrnerView,
    },

    data() {
        return {
            require_url: "",
            dcm_path: "",
            location: "center",
            need_show: false,
        }
    },

    
}
</script>

<template>
    <div class = "test">
        <el-form class = "test_form" label-width = "100px">
            <el-form-item label = "后端请求url">
                <el-input v-model = "require_url" class = "inputer"/>
            </el-form-item>

            <el-form-item label = "目标路径">
                <el-input v-model = "dcm_path" class = "inputer"/>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click = "need_show = true">确定</el-button>

                <el-button @click = "need_show = false">取消</el-button>
            </el-form-item>
        </el-form>
        
        <ConrnerView v-if = "need_show == true"
            :require_url = "require_url" 
            :dcm_path = "dcm_path"
            :location = "location"/>
    </div>
</template>

<style lang="scss">
.test {
    .test_form {
        width: 40vw; height: auto;
        .inputer {
            width: 350px;
        }
    }
}
</style>