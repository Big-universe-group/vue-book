/*
功能: axios使用, 用于全局拦截axios返回的信息
参考: http://axios-js.com/zh-cn/docs/index.html
*/
import axios from 'axios';

const Util = {
    imgPath: 'http://127.0.0.1:8011/img/',
    apiPath: 'http://127.0.0.1:8010/'
};

// 功能: 获取当前请求发生时的今天0点0分0秒的时间戳
Util.getTodayTime = function () {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
};

// 功能: 获取当前请求发生时的上一天日期
Util.prevDay = function (timestamp = (new Date()).getTime()) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    // getMouth获取的值范围: 0 ~ 11, 这里会序列化进行补0操作
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return year + '' + month + '' + day;
};

/*
基本用法1: 通过GET/POST请求获取响应数据, 考虑到跨域请求, 下面的请求会报错
注意1: axios基于Promise语法
*/
axios.get('https://www.baidu.com?id=123')
    .then(function(response) {
        console.log(response);
    })
    .catch(function(error) {
        console.log(error);
    });

/*
用法2: 使用自定义配置创建一个axios实例, 后续该实例就可以使用各种方法
    axios#request(config)
    axios#get(url[, config])
    axios#delete(url[, config])
    axios#head(url[, config])
    axios#options(url[, config])
    axios#post(url[, data[, config]])
    axios#put(url[, data[, config]])
    axios#patch(url[, data[, config]])
*/
Util.ajax = axios.create({
    baseURL: Util.apiPath,  // URL前缀, 真正的路径: baseURL + url
    timeout: 2000,
    headers: {},
});

/*
用法3: 设置axios配置默认值, 上述的所有请求命令就可以不设置这些默认值, 谨慎使用该用法, 不符合ISP原则
配置的加载顺序, 按照如下顺序进行配置合并,后者的优先级更高:
    lib/default.js中默认值 --> 实例defaults --> 请求config参数
其中请求config的优先级最高
*/
axios.defaults.baseURL = Util.apiPath;
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';


/*
用法4: 拦截器, 在请求或响应被then/catch处理前拦截
实例: 添加响应拦截器
*/
Util.ajax.interceptors.request.use(config => {
    // a. 发送请求之前的动作, 注意, 最后必须返回config, 否则异常
    return config;
}, error => {
    // b. 对请求错误的处理
});
Util.ajax.interceptors.response.use(res => {
    // c. 响应成功
    return res.data;
}, error => {
    // d. 响应错误
});
export default Util;