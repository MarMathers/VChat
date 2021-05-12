global.Numbers = undefined
global.wsMap = new Map()

const NOREG=0
const AVAIL=1
const BUSY=2


const r = require('./routes/todos')
const express = require('express')
const db = require('./db/db')
const exphbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const favicon = require('serve-favicon');

let app = express();

// set up plain http server
http.createServer(app).listen(80, function() {
    console.log('Express HTTP server listening on port ' + "80");
});

const expressWS = require('express-ws')
const directoryToServe = 'client'

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, '../ssl', 'certificate.crt')),
    key: fs.readFileSync(path.join(__dirname, '../ssl', 'private.key')),
    ca:fs.readFileSync(path.join(__dirname, '../ssl', 'ca_bundle.crt'))
    // cert: fs.readFileSync(path.join(__dirname, '../ssl', 'server.crt')),
    // key: fs.readFileSync(path.join(__dirname, '../ssl', 'server.key'))
}
const PORT = process.env.PORT = 443
const server = https.createServer(httpsOptions, app)
    .listen(PORT, () => {
        console.log(`Serving the SSL-server (${directoryToServe})`)
    })

app.use(favicon(__dirname + '/favicon.ico'));
app.use(express.urlencoded({ extended: false }));

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '/views'))

r.use('/.well-known', express.static(path.join(__dirname, '../.well-known')))
r.use('/css', express.static(path.join(__dirname, '/css')))
r.use('/js', express.static(path.join(__dirname, '/js')))
r.use('/static', express.static(path.join(__dirname, '/static')))
r.use('/repo', express.static('/root/repo'))
r.use('/webrtc', express.static(path.join(__dirname, '../node_modules/webrtc-adapter/out')))
r.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist/')));
r.use('/matcss', express.static(path.join(__dirname, '../node_modules/materialize-css/dist/css')));
r.use('/matjs', express.static(path.join(__dirname, '../node_modules/materialize-css/dist/js')));
r.use('/maticons', express.static(path.join(__dirname, '../node_modules/material-design-icons/iconfont')));
r.use('/roboto', express.static(path.join(__dirname, '../node_modules/roboto-fontface/css/roboto')));
r.use('/fonts/roboto', express.static(path.join(__dirname, '../node_modules/roboto-fontface/fonts/roboto')));
app.use(r)

const wsInstance = expressWS(app, server)
app = wsInstance.app

app.ws('/wss', (ws, req) => {
    ws.on('message', function (mess) {
        try {
            const message = JSON.parse(mess)
            switch (message.type) {
                case 'rtc': {
                    socket = global.wsMap.get(message.dst)
                    // console.log(`RTC: ${message.src} > ${message.dst}`)
                    if (socket) {
                        socket.send(mess)
                    } else console.log('socket not found')
                    break
                }
                case 'reg': {
                    sock = global.wsMap.get(message.src)
                    if (sock) {
                        aWss.clients.forEach(wsock => {
                            if (wsock !== sock) wsock.send(JSON.stringify({ type: 'server_mes', mes: 'out', number: `${message.src}` }))
                        })
                        sock.send(JSON.stringify({ type: 'server_mes', mes: 'relogin', href: '/login' }))
                    }

                    global.wsMap.set(message.src, ws)
                    global.Numbers.filter(n => n.number === message.src)[0].reg = AVAIL
                    aWss.clients.forEach(wsock => {
                        if (wsock !== ws) wsock.send(JSON.stringify({ type: 'server_mes', mes: 'in', number: `${message.src}` }))
                    })
                    ws.send(JSON.stringify({ type: 'server_mes', mes: 'numbers', numbers: [...global.Numbers] }))
                    break
                }
                case 'busy': {
                    message.data?
                        global.Numbers.filter(n => n.number === message.src)[0].reg = BUSY
                    :   global.Numbers.filter(n => n.number === message.src)[0].reg = AVAIL
                    aWss.clients.forEach(wsock => {
                        if (wsock !== ws) wsock.send(JSON.stringify({ type: 'server_mes', mes: 'busy', number: `${message.src}`,data: `${message.data}` }))
                    })
                    break
                }

                default: break
            }
        } catch (er) {
            console.log(mess, er)
        }
        // console.log(mess)
    });

    ws.send(JSON.stringify({ type: 'server_mes', mes: 'Подключение к RT-серверу успешно.' }))

    ws.on('close', () => {
        let key = null
        let keys = [...global.wsMap.keys()]
        keys.forEach(k => {
            if (global.wsMap.get(k) === ws) key = k
        })
        if (!key)return
        global.wsMap.delete(key)

        const n = global.Numbers.find(nu => nu.number === key);
        if (n) n.reg = NOREG
        aWss.clients.forEach(wsock => {
            if (wsock !== ws) wsock.send(JSON.stringify({ type: 'server_mes', mes: 'out', number: `${key}` }))
        })

    })
})

let aWss = wsInstance.getWss('/wss')

const run = async () => {
    try {
        await db.main()
        global.Numbers = await db.reloadNumbers()
        global.Numbers.forEach(n => {
            n.reg = NOREG
        })
    } catch (e) {
        console.log(e)
    }
}
run()