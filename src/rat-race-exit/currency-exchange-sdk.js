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

    const TIMEZONE_TO_CURRENCY = {
        'Asia/Kolkata': 'INR',
        'Asia/Calcutta': 'INR',
        'Europe/London': 'GBP',
        'Europe/Belfast': 'GBP',
        'GB': 'GBP',
        'GB-Eire': 'GBP',
        'Europe/Zurich': 'CHF',
        'Asia/Tokyo': 'JPY',
        'Japan': 'JPY',
        'Asia/Singapore': 'SGD',
        'Singapore': 'SGD',
        'Asia/Dubai': 'AED',
        'America/Toronto': 'CAD',
        'America/Vancouver': 'CAD',
        'America/Edmonton': 'CAD',
        'America/Winnipeg': 'CAD',
        'America/Halifax': 'CAD',
        'America/St_Johns': 'CAD',
        'America/Regina': 'CAD',
        'America/Montreal': 'CAD',
        'America/Moncton': 'CAD',
        'America/Whitehorse': 'CAD',
        'America/Yellowknife': 'CAD',
        'America/Iqaluit': 'CAD',
        'Europe/Paris': 'EUR',
        'Europe/Berlin': 'EUR',
        'Europe/Amsterdam': 'EUR',
        'Europe/Madrid': 'EUR',
        'Europe/Rome': 'EUR',
        'Europe/Brussels': 'EUR',
        'Europe/Vienna': 'EUR',
        'Europe/Dublin': 'EUR',
        'Europe/Lisbon': 'EUR',
        'Europe/Helsinki': 'EUR',
        'Europe/Athens': 'EUR',
        'Europe/Luxembourg': 'EUR',
        'Europe/Tallinn': 'EUR',
        'Europe/Riga': 'EUR',
        'Europe/Vilnius': 'EUR',
        'Europe/Bratislava': 'EUR',
        'Europe/Ljubljana': 'EUR',
        'Europe/Zagreb': 'EUR',
        'Europe/Malta': 'EUR',
        'Europe/Nicosia': 'EUR',
        'Atlantic/Canary': 'EUR',
        'Atlantic/Madeira': 'EUR',
        'Atlantic/Azores': 'EUR',
        'America/New_York': 'USD',
        'America/Chicago': 'USD',
        'America/Denver': 'USD',
        'America/Los_Angeles': 'USD',
        'America/Phoenix': 'USD',
        'America/Anchorage': 'USD',
        'Pacific/Honolulu': 'USD',
        'America/Detroit': 'USD',
        'America/Boise': 'USD',
        'America/Juneau': 'USD',
        'America/Nome': 'USD',
        'America/Sitka': 'USD'
    };

    const TIMEZONE_PREFIXES = [
        ['Australia/', 'AUD'],
        ['Canada/', 'CAD'],
        ['America/Indiana/', 'USD'],
        ['America/Kentucky/', 'USD'],
        ['US/', 'USD']
    ];

    const REGION_TO_CURRENCY = {
        US: 'USD',
        IN: 'INR',
        GB: 'GBP',
        UK: 'GBP',
        CH: 'CHF',
        LI: 'CHF',
        JP: 'JPY',
        SG: 'SGD',
        AE: 'AED',
        AU: 'AUD',
        CA: 'CAD',
        AT: 'EUR', BE: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR',
        ES: 'EUR', FI: 'EUR', FR: 'EUR', GR: 'EUR', HR: 'EUR',
        IE: 'EUR', IT: 'EUR', LT: 'EUR', LU: 'EUR', LV: 'EUR',
        MT: 'EUR', NL: 'EUR', PT: 'EUR', SI: 'EUR', SK: 'EUR'
    };

    const LANG_TO_CURRENCY = {
        hi: 'INR', ta: 'INR', te: 'INR', kn: 'INR', ml: 'INR',
        mr: 'INR', bn: 'INR', gu: 'INR', pa: 'INR',
        ja: 'JPY',
        de: 'EUR', fr: 'EUR', es: 'EUR', it: 'EUR',
        nl: 'EUR', pt: 'EUR', fi: 'EUR', el: 'EUR'
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

        /**
         * Detect the user's likely currency from browser timezone and locale settings
         * without triggering permission prompts or network requests.
         * @param {Array<string>|null} supportedCodes
         * @param {{timeZone?: string, locales?: Array<string>}} overrides
         * @returns {{code: string, source: 'timezone'|'locale'|'default'}}
         */
        detectUserCurrency(supportedCodes = null, overrides = {}) {
            const hasList = Array.isArray(supportedCodes) && supportedCodes.length > 0;
            const supported = hasList ? new Set(supportedCodes.map(c => String(c).toUpperCase())) : null;
            const isSupported = (code) => !!code && (!supported || supported.has(code));
            const defaultCode = (!supported || supported.has('USD')) ? 'USD' : String(supportedCodes[0]).toUpperCase();

            // 1. IANA Timezone check (most accurate even when OS/browser language is en-US)
            let tz = overrides.timeZone;
            if (tz === undefined) {
                try {
                    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                } catch (e) {
                    tz = '';
                }
            }
            if (tz) {
                const direct = TIMEZONE_TO_CURRENCY[tz];
                if (isSupported(direct)) {
                    return { code: direct, source: 'timezone' };
                }
                for (const [prefix, code] of TIMEZONE_PREFIXES) {
                    if (tz.startsWith(prefix) && isSupported(code)) {
                        return { code, source: 'timezone' };
                    }
                }
            }

            // 2. Locale region & language fallback
            let locales = Array.isArray(overrides.locales) ? overrides.locales : null;
            if (!locales) {
                locales = [];
                try {
                    if (typeof navigator !== 'undefined' && navigator) {
                        if (Array.isArray(navigator.languages)) locales.push(...navigator.languages);
                        if (navigator.language) locales.push(navigator.language);
                    }
                } catch (e) {}
                try {
                    const intlLoc = Intl.DateTimeFormat().resolvedOptions().locale;
                    if (intlLoc) locales.push(intlLoc);
                } catch (e) {}
            }

            for (const rawLoc of locales) {
                if (!rawLoc) continue;
                const parts = String(rawLoc).replace(/_/g, '-').split('-');
                for (let i = 1; i < parts.length; i++) {
                    if (/^[a-zA-Z]{2}$/.test(parts[i])) {
                        const regionCode = parts[i].toUpperCase();
                        const mapped = REGION_TO_CURRENCY[regionCode];
                        if (isSupported(mapped)) {
                            return { code: mapped, source: 'locale' };
                        }
                    }
                }
                const lang = parts[0].toLowerCase();
                const langMapped = LANG_TO_CURRENCY[lang];
                if (isSupported(langMapped)) {
                    return { code: langMapped, source: 'locale' };
                }
            }

            return { code: defaultCode, source: 'default' };
        }
    }

    return new CurrencyExchangeSDK();
}));
