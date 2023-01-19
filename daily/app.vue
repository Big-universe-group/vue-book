<template>
    <div class="daily">
        <!-- 1. 菜单栏 -->
        <div class="daily-menu">
            <!-- v-bind:class动态绑定class, 只有type==recommend的时候class="on"才会生效 -->
            <div class="daily-menu-item"
                 @click="handleToRecommend"
                 :class="{ on: type === 'recommend' }">每日推荐</div>
            <div class="daily-menu-item"
                 :class="{ on: type === 'daily' }"
                 @click="showThemes = !showThemes">主题日报</div>
            <!-- 主题日报下的子类列表, themeId表示当前选中的主题ID -->
            <ul v-show="showThemes">
                <!-- Vue 2.2.0+的版本里，当在组件中使用v-for时，key是必须的, 否则代码会出现告警提示
                    改动参考: https://www.cnblogs.com/zdz8207/p/vue-for-v-bind-key.html
                -->
                <li v-for="item in themes" :key="item.id">
                    <!-- 当点击主题日报下的某一个主题时, 自动触发获取主题信息的操作 -->
                    <a :class="{ on: item.id === themeId && type === 'daily' }"
                        @click="handleToTheme(item.id)">{{ item.name }}</a>
                </li>
            </ul>
        </div>

        <!-- 2. 文章列表, ref: list, 主题日报文章列表 -->
        <div class="daily-list" ref="list">
            <!-- a. 点击每日推荐时的显示, 此时type值为recommend -->
            <template v-if="type === 'recommend'">
                <div v-for="recommendinfo in recommendList" :key="recommendinfo.date">
                    <div class="daily-date">{{ formatDay(recommendinfo.date) }}</div>
                    <!-- Item是一个子组件, 见components -->
                    <Item
                        v-for="item in recommendinfo.stories"
                        :data="item"
                        :key="item.id"
                        @click.native="handleClick(item.id)"></Item>
                </div>
            </template>
            <!-- b. 点击主题日报下的子类时的显示, 注意只有this.type值为daily, 即鼠标点击"主题日报"的时候才显示 -->
            <template v-if="type === 'daily'">
                <Item
                    v-for="item in list"
                    :data="item"
                    :key="item.id"
                    @click.native="handleClick(item.id)"></Item>
            </template>
        </div>

        <!-- 3. 文章正文: daily-article组件, 传递值: 文章ID -->
        <daily-article :id="articleId"></daily-article>
    </div>
</template>


<script>
    import Item from './components/item.vue';
    import dailyArticle from './components/daily-article.vue';
    import $ from './libs/util';

    export default {
        components: { Item, dailyArticle },
        // 1. 初始化数据
        data () {
            return {
                themes: [], // 主题列表
                showThemes: false,  // 是否显示主题日报-主题列表
                type: 'recommend', // daily-主题日报, recommend-每日推荐, 在handleToRecommend/themes中被赋值
                recommendList: [],  // 推荐文章列表
                dailyTime: $.getTodayTime(),
                list: [], // 主题日报文章列表
                themeId: 0, // 当前点击的主题ID
                articleId: 0,  // 当前文章ID
                isLoading: false, // 表示当前是否在获取信息中
            }
        },
        // 2. 功能方法, 一般为事件方法
        methods: {
            handleToRecommend () {  // 点击"每日推荐"的时候onClick触发该函数
                this.type = 'recommend';  // 该值决定了前端的界面显示
                this.recommendList = [];
                this.dailyTime = $.getTodayTime();
                this.getRecommendList();
            },
            handleToTheme (id) {  // 点击主题日报下某一个主题后的动作
                // id: 某个主题日报的ID值
                this.type = 'daily';
                this.themeId = id;
                this.list = [];
                $.ajax.get('specialtheme/' + id).then(res => {
                    this.list = res.stories.filter(item => item.type !== 1);
                })
            },

            getThemes () {  // 获取主题日报信息, 更新this.themes字段
                $.ajax.get('themes').then(res => {
                    this.themes = res.others;  // res返回值中的others数据
                })
            },
            getRecommendList () {   // 获取每日推荐信息, 更新this.recommendList字段
                this.isLoading = true;
                const prevDay = $.prevDay(this.dailyTime + 86400000);
                $.ajax.get('news/before/' + prevDay).then(res => {
                    if (res == undefined) {
                        console.log('获取信息异常?');
                        return
                    }
                    this.recommendList.push(res);
                    this.isLoading = false;  // 表示加载完成了
                })
            },

            formatDay (date) {
                let month = date.substr(4, 2);
                let day = date.substr(6, 2);
                if (month.substr(0, 1) === '0') month = month.substr(1, 1);
                if (day.substr(0, 1) === '0') day = day.substr(1, 1);
                return `${month} 月 ${day} 日`;
            },
            handleClick (id) {  // 点击主题日报-子标题-某个文章时, 进行赋值操作
                this.articleId = id;  // 这个id在daily-article组件中被watch
            }
        },
        /*
            3. html加载完成后执行(子组件->父组件), 其他钩子函数还有:
                a. created: before create
                b. mouted: before mount(挂载)
                c. updated: before update(更新)
                d. destroyed: before destory(销毁前)
        */
        mounted () {
            // 一旦主页面加载完成就自动获取每日推荐和主题等信息, 根据vue特性自动刷新到页面上
            this.getRecommendList();
            this.getThemes();
            const $list = this.$refs.list;  // 是一个对象, 持有已注册过 ref的所有的子组件, list: 文章列表
            // 添加鼠标滚动监听事件: 文档视图或者一个元素在滚动时, 会触发元素的 scroll 事件
            $list.addEventListener('scroll', () => {
                // 若是每日推荐或者数据正在获取中则滚动事件不生效
                if (this.type === 'daily' || this.isLoading) return;
                // clientHeight表示元素内部的高度, 包含内边距但不包括边框, 外边距, 水平滚动条
                // scrollTop: 获取或设置一个元素的内容垂直滚动的像素数, 即元素的内容顶部到它的视口可见内容的距离(上面被隐藏的部分)
                if ($list.scrollTop + document.body.clientHeight >= $list.scrollHeight) {
                    this.dailyTime -= 86400000;  // 86400 == 24 * 3600
                    this.getRecommendList();
                }
            });
        },
        // 4. 监听函数, 监听某个值的变化
        watch: {
        },
        // 5. 计算属性
        computed: {
        }
    }
</script>