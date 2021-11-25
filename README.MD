# RBL Auth

Simple HTTP Server to authorize IPs using Spamhaus DNSBL XBL list.
Answers 200 for good IPs, 403 for bad ones.

Run with:
 ```bash
node server.js
 ```

/healthz is the healthcheck endpoint (just liveness)
/ is the endpoint for IP authz

## Configuration (env vars)
- PORT: port for the http server, default 8000
- IP_HEADER: name of the header with the IP to authorize, default x-real-ip
- CACHE_SIZE: number of items to keep in cache, default 50000
- CACHE_MS: ttl of cache entries in ms, default 86400000 (24h)
- DRY_RUN: set true to just notify bad IPs not blocking them, default false
- KEEPALIVE_MS: The number of milliseconds of inactivity a server needs to wait for additional incoming data, after it has finished writing the last response, before a socket will be destroyed, default 30000