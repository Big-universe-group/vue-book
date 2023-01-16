<template>
    <!-- 子组件, 显示文章列表 -->
    <a class="daily-item">
        <!-- a. 照片 -->
        <div class="daily-img" v-if="data.images">
            <img :src="imgPath + data.images[0]">
        </div>
        <!-- b. 文章标题 -->
        <div
            class="daily-title"
            :class="{ noImg: !data.images}">{{ data.title }}</div>
    </a>
</template>
<script>
    import $ from '../libs/util';
    export default {
        props: {
            data: {
                type: Object
            }
        },
        data () {
            return {
                imgPath: $.imgPath
            }
        }
    }
</script>