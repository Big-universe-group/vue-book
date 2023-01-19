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
            // 父类传递给子类的某一个文章缩写信息对象: 标题, 图片
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