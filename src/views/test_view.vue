<script>
import { post_data, back_server } from '@/utils/vi_tools'

export default {
    data() {
        return {
            // server_url: back_server(),
            server_url: "http://192.168.124.22:8087",
            shouma_html: '',
        }
    },

    async mounted() {
        const resp = await post_data(`${this.server_url}/shou_ma`, {type: 'test'})
        
        if (resp.code == 20000) {
            const html_bolb = resp.data
            const url = window.URL.createObjectURL(html_bolb)
            this.shouma_html = url
        }
    },

    methods: {},
}
</script>

<template>
<div class = "test_view">
    <div>1234</div>
    <iframe class = "surgical_anesthesia" :src = "shouma_html"></iframe>
</div>
</template>

<style lang="scss">
.test_view {
    .surgical_anesthesia {
        height: 40vw; width: 80vw;
    }
}
</style>