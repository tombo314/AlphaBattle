let http = require("http");
let fs = require("fs");

http.createServer((req, res)=>{
    if (req.url==="/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync("index.html"))
    } else if (req.url==="/stylesheet/main.css"){
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(fs.readFileSync("stylesheet/main.css"));
    } else if (req.url==="/main.js"){
        res.writeHead(200, {"Content-Type": "text/js"});
        res.end(fs.readFileSync("main.js"));
    } else if (req.url==="/data.json"){
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(fs.readFileSync("data.json"));
    } else if (req.url==="/node_modules/seedrandom/seedrandom.js"){
        res.writeHead(200, {"Content-Type": "text/js"});
        res.end(fs.readFileSync("node_modules/seedrandom/seedrandom.js"));
    } else if (req.url==="favicon.ico"){
        res.end();
    }
}).listen(process.env.PORT || 8000);