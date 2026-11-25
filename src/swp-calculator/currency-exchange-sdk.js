/**
 * CurrencyExchangeSDK - Lightweight SDK adapted from global-currency-atlas
 * Provides live exchange rates, cross-currency conversion, and caching
 * Primary providers: open.er-api.com, Fawazahmed0 Currency API CDN
 * Fallback: Static baseline exchange rates for major currencies
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CurrencyExchangeSDK = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Baseline offline exchange rates (relative to 1 USD)
    const FALLBACK_RATES = {
        usd: 1.0,
        eur: 0.95,
        gbp: 0.79,
        inr: 86.5,
        cad: 1.42,
        aud: 1.56,
        jpy: 154.2,
        chf: 0.89,
        sgd: 1.35,
        aed: 3.6725,
        cny: 7.24,
        hkd: 7.78,
        nzd: 1.74,
        sek: 10.95,
        krw: 1395.0,
        brl: 5.82,
        mxn: 20.35,
        zar: 18.2
    };

    class CurrencyExchangeSDK {
        constructor(options = {}) {
            this.cacheTimeoutMs = options.cacheTimeoutMs || 12 * 60 * 60 * 1000; // 12 hours
            this.rates = null;
            this.lastUpdated = null;
            this.listeners = [];
        }

        /**
         * Fetch latest exchange rates with USD as reference base
         * @returns {Promise<{rates: Object, lastUpdated: string, source: string}>}
         */
        async getLatestRates() {
            const cacheKey = 'currency_exchange_rates_usd';
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < this.cacheTimeoutMs && parsed.rates) {
                        this.rates = parsed.rates;
                        this.lastUpdated = parsed.lastUpdated;
                        return { rates: this.rates, lastUpdated: this.lastUpdated, source: 'cache' };
                    }
                }
            } catch (e) {
                // Ignore localStorage errors
            }

            // Providers in priority order (open.er-api is open & CORS-friendly)
            const endpoints = [
                {
                    url: 'https://open.er-api.com/v6/latest/USD',
                    parser: (data) => {
                        const r = {};
                        if (data && data.rates) {
                            for (const k in data.rates) {
                                r[k.toLowerCase()] = data.rates[k];
                            }
                            return { rates: r, date: data.time_last_update_utc || new Date().toISOString() };
                        }
                        return null;
                    }
                },
                {
                    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
                    parser: (data) => {
                        if (data && data.usd) {
                            data.usd.usd = 1;
                            return { rates: data.usd, date: data.date || new Date().toISOString() };
                        }
                        return null;
                    }
                }
            ];

            for (const ep of endpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);
                    const res = await fetch(ep.url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) continue;
                    const json = await res.json();
                    const parsed = ep.parser(json);
                    if (parsed && parsed.rates) {
                        this.rates = parsed.rates;
                        this.lastUpdated = parsed.date;

                        try {
                            localStorage.setItem(cacheKey, JSON.stringify({
                                timestamp: Date.now(),
                                rates: this.rates,
                                lastUpdated: this.lastUpdated
                            }));
                        } catch (e) {}

                        return { rates: this.rates, lastUpdated: this.lastUpdated, source: 'live' };
                    }
                } catch (err) {
                    // Try next provider
                }
            }

            // Fallback to static offline rates
            this.rates = { ...FALLBACK_RATES };
            this.lastUpdated = new Date().toISOString();
            return { rates: this.rates, lastUpdated: this.lastUpdated, source: 'fallback' };
        }

        /**
         * Get exchange rate between two currency codes (e.g. from 'USD' to 'EUR')
         * @param {string} fromCur 
         * @param {string} toCur 
         * @returns {number|null} Rate: 1 fromCur = X toCur
         */
        getExchangeRate(fromCur = 'USD', toCur = 'USD') {
            const rates = this.rates || FALLBACK_RATES;
            const from = fromCur.toLowerCase();
            const to = toCur.toLowerCase();

            if (from === to) return 1.0;

            const fromRateInUSD = rates[from]; // e.g. 1 USD = 86.5 INR => INR rate in USD table is 86.5
            const toRateInUSD = rates[to];     // e.g. 1 USD = 0.95 EUR => EUR rate in USD table is 0.95

            if (!fromRateInUSD || !toRateInUSD) return null;

            // 1 fromCur = (toRateInUSD / fromRateInUSD) toCur
            return toRateInUSD / fromRateInUSD;
        }

        /**
         * Convert an amount from one currency to another
         * @param {number} amount 
         * @param {string} fromCur 
         * @param {string} toCur 
         * @returns {number}
         */
        convert(amount, fromCur = 'USD', toCur = 'USD') {
            const rate = this.getExchangeRate(fromCur, toCur);
            if (rate === null) return amount;
            return amount * rate;
        }

        /**
         * Get common target comparison currencies for a selected base currency
         * @param {string} baseCurrency 
         * @param {number} amount 
         * @returns {Array<{code: string, symbol: string, rate: number, convertedAmount: number}>}
         */
        getConversionsFor(baseCurrency = 'USD', amount = 1) {
            const targets = [
                { code: 'USD', symbol: '$' },
                { code: 'EUR', symbol: '€' },
                { code: 'GBP', symbol: '£' },
                { code: 'INR', symbol: '₹' },
                { code: 'CAD', symbol: 'CA$' },
                { code: 'AUD', symbol: 'A$' },
                { code: 'JPY', symbol: '¥' },
                { code: 'CHF', symbol: 'CHF' },
                { code: 'AED', symbol: 'AED' }
            ].filter(t => t.code.toUpperCase() !== baseCurrency.toUpperCase());

            return targets.map(t => {
                const rate = this.getExchangeRate(baseCurrency, t.code) || 1;
                return {
                    code: t.code,
                    symbol: t.symbol,
                    rate,
                    convertedAmount: amount * rate
                };
            });
        }
    }

    return new CurrencyExchangeSDK();
}));
