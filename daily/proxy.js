/*
    代理服务以突破跨域限制.
    端口: 8010-接口处理, 8011-图片处理
*/
const http = require('http');
const request = require('request');

const hostname = '127.0.0.1';
const port = 8010;
const imgPort = 8011;

// mock 主题日报: 该接口目前已关闭, 只能mock
const ArticleValues = {
    104: {
        "title": "瞎扯 · 如何正确地吐槽",
        "body": "这是心理学1的内容",
    },
    102: {
        "title": "心理学2",
        "body": "这是心理学2的内容",
    },
    201: {
        "title": "原神2022流水",
        "body": "原神2022流水突破387亿",
    },
    304: {
        "title": "深夜食堂 · 巴黎爱情故事",
        "body": "功夫电影在2004年内地上映获得好评",
    },
    401: {
        "title": "学英语才是正经事儿",
        "body": "天安门设计的来源, 历史, 发展",
    },
    403: {
        "title": "瞎扯 · 手把手教你搞定陌生漂亮女孩儿",
        "body": "天安门设计的来源, 历史, 发展",
    },
}
const _current_date = new Date();
const _current_date_str = _current_date.getFullYear() + 
    _current_date.getMonth() + _current_date.getDate();
const ThemesValues = [
    {
        "id": 1,
        "name": "日常心理学",
        "stories": [
            {
                "id": 104,
                "title": ArticleValues[104]["title"],
                "date": _current_date_str,
            },
            {
                "id": 102,
                "title": ArticleValues[102]["title"],
                "date": _current_date_str,
            },
        ]
    },
    {
        "id": 2,
        "name": "用户推荐日报",
        "stories": [
            {
                "id": 201,
                "title": ArticleValues[201]["title"],
                "date": _current_date_str,
            },
        ]
    },
    {
        "id": 3,
        "name": "电影日报",
        "stories": [
            {
                "id": 304,
                "title": ArticleValues[304]["title"],
                "date": _current_date_str,
            },
        ]
    },
    {
        "id": 4,
        "name": "设计日报",
        "stories": [
            {
                "id": 401,
                "title": ArticleValues[401]["title"],
                "date": _current_date_str,
            },
            {
                "id": 403,
                "title": ArticleValues[403]["title"],
                "date": _current_date_str,
            },
        ]
    }
]  

// 创建一个 API 代理服务
const apiServer = http.createServer((req, res) => {
    // 访问真正的日报地址: 知乎日报
    const url = 'http://news-at.zhihu.com/api/4' + req.url;
    const options = {
        url: url
    };
    console.log(url);

    function callback (error, response, body) {
        if (!error && response.statusCode === 200) {
            // 设置编码类型，否则中文会显示为乱码
            res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
            // 设置所有域允许跨域
            res.setHeader('Access-Control-Allow-Origin', '*');
            // 返回代理后的内容
            if (url.indexOf('themes') != -1 ) {  // mock: 主题分类列表
                bodyObj = JSON.parse(body)
                if (bodyObj.others.length === 0) {
                    bodyObj.others = ThemesValues
                    body = JSON.stringify(bodyObj)
                }
            }

            res.end(body);
        } else {
            if (url.indexOf('specialtheme') != -1) {
                var themeId = url.split('/').slice(-1);
                var themeObj = ThemesValues.find(element => element.id == themeId);
                myBody = {
                    'id': themeId,
                    'stories': themeObj.stories,
                }
                // 设置编码类型，否则中文会显示为乱码
                res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
                // 设置所有域允许跨域
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(myBody));
            } else if (url.indexOf('news') != -1) {
                var themeId = url.split('/').slice(-1);
                var themeObj = ArticleValues[themeId] || {};
                // 设置编码类型，否则中文会显示为乱码
                res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
                // 设置所有域允许跨域
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(themeObj));
            }
        }
    }
    // 自动到知乎日报服务器上下载照片并通过callback返回
    console.log(`--> api request:${url}`)
    request.get(options, callback); 
});
// 监听 8010 端口
apiServer.listen(port, hostname, () => {
    console.log(`接口代理: 运行在 http://${hostname}:${port}/, 负责获取知乎日报信息`);
});


// 创建一个图片代理服务
const imgServer = http.createServer((req, res) => {
    const url = req.url.split('/img/')[1];
    const options = {
        url: url,
        encoding: null
    };

    function callback (error, response, body) {
        if (!error && response.statusCode === 200) {
            const contentType = response.headers['content-type'];
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(body);
        }
    }
    request.get(options, callback);
});
// 监听 8011 端口
imgServer.listen(imgPort, hostname, () => {
    console.log(`图片代理: 运行在 http://${hostname}:${imgPort}/, 负责获取知乎日报图片`);
});