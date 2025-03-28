/*
功能: 入口文件, 日报是一个单页应用, 只有一个入口(webpack.config.js中entry配置): main.js

*/
import Vue from 'vue';
import App from './app.vue';
import './style.css';

new Vue({
    el: '#app',
    render: h => {
        return h(App)
    }
});