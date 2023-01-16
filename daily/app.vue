<template>
    <div class="daily">
        <!-- 1. 菜单栏 -->
        <div class="daily-menu">
            <div class="daily-menu-item"
                 @click="handleToRecommend"
                 :class="{ on: type === 'recommend' }">每日推荐</div>
            <div class="daily-menu-item"
                 :class="{ on: type === 'daily' }"
                 @click="showThemes = !showThemes">主题日报</div>
            <!-- 主题日报下的子类列表, themeId表示当前选中的主题ID -->
            <ul v-show="showThemes">
                <li v-for="item in themes">
                    <a
                        :class="{ on: item.id === themeId && type === 'daily' }"
                        @click="handleToTheme(item.id)">{{ item.name }}</a>
                </li>
            </ul>
        </div>

        <!-- 2. 文章列表 -->
        <div class="daily-list" ref="list">
            <!-- a. 点击每日推荐时的显示 -->
            <template v-if="type === 'recommend'">
                <div v-for="list in recommendList">
                    <div class="daily-date">{{ formatDay(list.date) }}</div>
                    <!-- Item是一个子组件, 见components -->
                    <Item
                        v-for="item in list.stories"
                        :data="item"
                        :key="item.id"
                        @click.native="handleClick(item.id)"></Item>
                </div>
            </template>
            <!-- b. 点击主题日报下的子类时的显示 -->
            <template v-if="type === 'daily'">
                <Item
                    v-for="item in list"
                    :data="item"
                    :key="item.id"
                    @click.native="handleClick(item.id)"></Item>
            </template>
        </div>

        <!-- 3. 文章正文: daily-article组件 -->
        <daily-article :id="articleId"></daily-article>
    </div>
</template>


<script>
    import Item from './components/item.vue';
    import dailyArticle from './components/daily-article.vue';
    import $ from './libs/util';

    export default {
        components: { Item, dailyArticle },
        data () {
            // 初始化数据
            return {
                themes: [],
                showThemes: false,
                type: 'recommend',
                recommendList: [],  // 推荐文章列表
                dailyTime: $.getTodayTime(),
                list: [], // 主题日报文章列表
                themeId: 0, // 当前点击的主题ID
                articleId: 0,  // 当前文章ID
                isLoading: false
            }
        },
        methods: {
            handleToRecommend () {
                this.type = 'recommend';
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
                    this.list = res.stories
                        .filter(item => item.type !== 1);
                })
            },
            getThemes () {  // 发起axios请求, 获取主题信息
                $.ajax.get('themes').then(res => {
                    this.themes = res.others;  // res返回值中的others数据
                })
            },
            getRecommendList () {   // 获取推荐文章列表
                this.isLoading = true;
                const prevDay = $.prevDay(this.dailyTime + 86400000);
                $.ajax.get('news/before/' + prevDay).then(res => {
                    if (res == undefined) {
                        console.log('获取信息异常?');
                        return
                    }
                    console.log(res);
                    console.log('-------------------');
                    this.recommendList.push(res);
                    this.isLoading = false;
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

        mounted () {
            this.getRecommendList();
            this.getThemes();
            const $list = this.$refs.list;
            $list.addEventListener('scroll', () => {
                if (this.type === 'daily' || this.isLoading) return;
                if
                (
                    $list.scrollTop
                    + document.body.clientHeight
                    >= $list.scrollHeight
                )
                {
                    this.dailyTime -= 86400000;
                    this.getRecommendList();
                }
            });
        }
    }
</script>