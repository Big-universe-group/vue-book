<template>
    <div class="daily-article">
        <div class="daily-article-title">{{ data.title }}</div>
        <div class="daily-article-content" v-html="data.body"></div>
        <div class="daily-comments" v-show="comments.length">
            <span>评论（{{ comments.length }}）</span>
            <div class="daily-comment" v-for="comment in comments" :key="comment.author">
                <div class="daily-comment-avatar">
                    <img :src="comment.avatar">
                </div>
                <div class="daily-comment-content">
                    <div class="daily-comment-name">{{ comment.author }}</div>
                    <div class="daily-comment-time" v-time="comment.time"></div>
                    <div class="daily-comment-text">{{ comment.content }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Time from '../directives/time';
    import $ from '../libs/util';
    export default {
        directives: { Time },
        props: {
            // 文章ID
            id: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {
                data: {},
                comments: []
            }
        },
        methods: {
            // 自动获取某一个ID对应的文章
            getArticle () {
                $.ajax.get('news/' + this.id).then(res => {
                    // 对文章中的http/https地址进行更改
                    res.body = res.body
                        .replace(/src="http/g, 'src="' + $.imgPath + 'http');
                    res.body = res.body
                        .replace(/src="https/g, 'src="' + $.imgPath + 'https');
                    this.data = res;
                    window.scrollTo(0, 0);
                    this.getComments();
                })
            },
            getComments () {
                this.comments = [];
                $.ajax.get('story/' + this.id + '/short-comments').then(res => {
                    if (res.comments != undefined) {
                        this.comments = res.comments.map(comment => {
                            // 将头像的图片地址转为代理地址
                            comment.avatar = $.imgPath + comment.avatar;
                            return comment;
                        });
                    }
                })
            }
        },
        watch: {
            // 监视ID是否变动, 一旦点击新的文章并传递新的ID值, 则自动获取新的文章
            // 注意: article不像item, 数据其他依靠article来自动获取而非从父类传递过来
            id (val) {
                if (val) this.getArticle();
            }
        }
    };
</script>