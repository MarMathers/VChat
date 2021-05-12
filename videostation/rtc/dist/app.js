'use strict';

//const adapter= require('webrtc-adapter')
var WebSocket = require('ws');
var server = new WebSocket.Server({ port: 5060 });

var express = require('express');
var db = require('./db/db');
var exphbs = require('express-handlebars');

var path = require('path');

var app = express();
app.use(express.urlencoded({ extended: false }));
var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'

});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

var PORT = process.env.PORT = 8082;

server.on('connection', function (ws) {

    ws.on('message', function (message) {
        switch (message.type) {
            case 'reg':
                {
                    db.wsMap.set(message.number, ws);
                    console.log(db.wsMap);
                    break;
                }
            default:
                break;
        }
    });
    ws.send('Подключение к RT-серверу успешно.');
});

var run = async function run() {
    try {
        await db.connect();
        app.listen(PORT);
        console.log('\u0421\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D. \u041F\u043E\u0440\u0442: ' + PORT);
        var todoRoutes = require('./routes/todos');
        todoRoutes.use('/css', express.static(path.join(__dirname, '/css')));
        todoRoutes.use('/js', express.static(path.join(__dirname, '/js')));
        app.use(todoRoutes);
    } catch (e) {
        console.log(e);
    }
};

run();