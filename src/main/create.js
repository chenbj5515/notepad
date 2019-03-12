var fs = require('fs')
var path = require('path')
fs.mkdir('我是你哥哥/我们都是你妈的儿子', { recursive: true }, (err) => {
    if (err) throw err;
});
// var createFolder = function(to) { //文件写入
//     var sep = path.sep
//     var folders = path.dirname(to).split(sep);
//     var p = '';
//     while (folders.length) {
//         p += folders.shift() + sep;
//         if (!fs.existsSync(p)) {
//             fs.mkdirSync(p);
//         }
//     }
// };
// createFolder('/publis/statemenet/out.txt');
// fs.createWriteStream('public/statement/out.txt')