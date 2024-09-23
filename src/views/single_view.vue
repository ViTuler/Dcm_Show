<script>
import ConrnerView from '@/components/conrner_view.vue'
import { back_server } from '@/utils/vi_tools'


export default {
    components: { ConrnerView },
    data() {
        return {
            yizhu_id: '',
            corner_para: {
                require_url: `${back_server()}/dicom`,
                location: 'center',
            }
        }
    },

    async created() {
        const urlParams = new URLSearchParams(window.location.search)

        this.yizhu_id = urlParams.get('id')
    },

}
</script>


<template>
    <div class = "single">
        <conrner-view :yizhu_id = "yizhu_id"
            :require_url = "corner_para.require_url" 
            :location = "corner_para.location"/>
    </div>
</template>



<style lang="scss"></style>