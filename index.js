const request = require('request-promise');
const express = require('express')
const {register, Gauge} = require('prom-client')
const sleep = require('sleep-promise');

const app = express();
const port = process.env.PORT || 3001;
const pairs = process.env.FETCH_PAIRS.split(',').map(pair => pair.split(':'));

const rippleExchangeRates = new Gauge({
    name: 'ripple_exchange_rates',
    help: 'Ripple exchange rates',
    labelNames: ['base', 'counter', 'base_issuer', 'counter_issuer']
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(register.metrics())
});

const server = app.listen(port, () => {
    console.log(`Metrics listening on port ${port}!`);
});

async function fetchRate(base, base_issuer, counter, counter_issuer) {
    const result = await request.get({
        method: 'GET',
        url: `https://data.ripple.com/v2/exchange_rates/${base}${base_issuer ? '+' + base_issuer : ''}/${counter}${counter_issuer ? '+' + counter_issuer : ''}`,
        json: true
    });

    if (result.result !== 'success') {
        throw new Error(`cannot fetch rates ${base}+${base_issuer}/${counter}+${counter_issuer}`);
    }

    return parseFloat(result.rate);
}

(async function fetchRates() {
    while (true) {
        console.log('fetch rates');

        for (const pair of pairs) {
            console.log('fetch pair', pair);

            const [base, base_issuer, counter, counter_issuer] = pair;

            const rate = await fetchRate(base, base_issuer, counter, counter_issuer);

            rippleExchangeRates.set({base, base_issuer, counter, counter_issuer}, rate);
        }

        await sleep(10000);
    }
})();
