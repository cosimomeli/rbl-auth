const http = require('http')
const { URL } = require('url')
const Resolver = require('./libs/spamhaus')
const LRU = require("lru-cache")

const dry_run = process.env.DRY_RUN == 'true' ? true : false
const ip_header = process.env.IP_HEADER || 'x-real-ip'
const port = process.env.PORT || 8000
const cache = new LRU({
    max: process.env.CACHE_SIZE || 50000,
    maxAge: process.env.CACHE_MS || 86400000
})
const rbl = new Resolver(cache)

const server = http.createServer(async (req, res) => {
    const route = (new URL(req.url, `http://${req.headers.host}`)).pathname
    try {
        if (route === '/healthz') {
            res.end('OK')
            return
        }

        const ip = req.headers[ip_header]
        const is_good = ip && await rbl.isGoodIP(ip)
        const returnCode = ip && !is_good ? 403 : 200
        if(ip && returnCode === 403) {
            console.info(dry_run ? `Should ban IP: ${ip}` : `Block IP: ${ip}`)
        }
        res.writeHead(dry_run ? 200 : returnCode).end()
    } catch(error) {
        console.error(error)
        res.writeHead(200).end()
    }
})

if(dry_run) {
    console.warn('Dry run enabled, IPs will not be blocked')
}

server.keepAliveTimeout = process.env.KEEPALIVE_MS || 30000

server.listen(port, () => {
    console.log(`Server listening to ${port}`)
})
