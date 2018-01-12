# fetch-ripple-rates
Microservice that fetches ripple exchange rates and exposes them as prometheus metrics

## Running

```
docker run -ti -p 3001:3001 -e FETCH_PAIRS=XRP::USD:rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq,XRP::EUR:rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq xtruder/fetch-ripple-rates
```
