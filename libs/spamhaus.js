const dns = require('dns');
const util = require('util');

const resolve = util.promisify(dns.resolve4);

class SpamhausResolver {
    constructor(cache=null) {
        this.cache = cache
    }

    fromCache(ip) {
        if(this.cache) {
            return this.cache.get(ip)
        }
    }

    setCache(ip, value) {
        if(this.cache) {
            this.cache.set(ip, value)
        }
    }

    async isGoodIP(ip) {
        const cache_value = this.fromCache(ip)
        if(cache_value !== undefined) {
            return cache_value
        }
        const prefix = ip.split('.').reverse().join('.')
        try {
            console.info(`DNS request for IP: ${ip}`)
            const answers = await resolve(`${prefix}.zen.spamhaus.org`)
            const is_good = !answers.includes('127.0.0.4')
            this.setCache(ip, is_good)
            if(!is_good) {
                console.info(`Bad IP: ${ip}`)
            }
            return is_good
        } catch(e) {
            if(e.code != 'ENOTFOUND') {
                console.warn(e)
            }
            this.setCache(ip, true)
            return true
        }
    }
}

module.exports = SpamhausResolver