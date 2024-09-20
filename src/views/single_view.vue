<script>
import ConrnerView from '@/components/conrner_view.vue'


export default {
    components: { ConrnerView },
    data() {
        return {
            patient_id: '',
            corner_para: {
                require_url: 'http://192.168.124.22:9010/dicom',
                location: 'center',
            }
        }
    },

    async created() {
        const urlParams = new URLSearchParams(window.location.search)

        this.patient_id = urlParams.get('id')
    },

}
</script>


<template>
    <div class = "single">
        <conrner-view :patient_id = "patient_id"
            :require_url = "corner_para.require_url" 
            :location = "corner_para.location"/>
    </div>
</template>



<style lang="scss"></style>