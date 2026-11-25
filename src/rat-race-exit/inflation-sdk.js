/**
 * InflationSDK - Live World Bank Open Data API SDK for Global CPI Inflation
 * Fetches 30-year per-country profiles and 10-year global bulk datasets directly
 * from the World Bank Open Data API (indicator: FP.CPI.TOTL.ZG) with localStorage caching.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.InflationSDK = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Central Bank Long-Term Policy Inflation Targets (%)
    const CB_TARGETS = {
        WLD: 3.0, USA: 2.0, EMU: 2.0, GBR: 2.0, CHN: 3.0, IND: 4.0,
        CAN: 2.0, AUS: 2.5, JPN: 2.0, CHE: 1.5, SGP: 2.0, ARE: 2.0,
        BRA: 3.0, MEX: 3.0, IDN: 2.5, THA: 2.0, KOR: 2.0, TUR: 5.0,
        ZAF: 4.5, POL: 2.5, SWE: 2.0, NOR: 2.0, NZL: 2.0, PHL: 3.0,
        VNM: 4.0, MYS: 2.5, SAU: 2.0, ISR: 2.0, CHL: 3.0, COL: 3.0
    };

    // Monetary-anchor proxies for territories without standalone World Bank CPI series
    const PROXY_COUNTRY_MAP = {
        AND: 'EMU', GUF: 'EMU', MAF: 'EMU', MCO: 'EMU', SMR: 'EMU', VAT: 'EMU',
        LIE: 'CHE',
        FLK: 'GBR', GGY: 'GBR', GIB: 'GBR', IMN: 'GBR', JEY: 'GBR', SHN: 'GBR',
        ASM: 'USA', BMU: 'USA', GUM: 'USA', MHL: 'USA', MNP: 'USA', PRI: 'USA',
        TCA: 'USA', VGB: 'USA', VIR: 'USA',
        FRO: 'DNK', GRL: 'DNK',
        NRU: 'AUS', TUV: 'AUS',
        PYF: 'FRA', NCL: 'FRA',
        ESH: 'MAR'
    };

    const BULK_CACHE_KEY = 'inflation_sdk_bulk_decade_v2';

    class InflationSDK {
        constructor(options = {}) {
            this.cacheTimeoutMs = options.cacheTimeoutMs || 24 * 60 * 60 * 1000; // 24 hours
            this.baseUrl = options.baseUrl || 'https://api.worldbank.org/v2';
            this.bulkHistoryByCountry = {};
            this._bulkPromise = null;
            this._countryPromises = {};
            this._hydrateBulkCache();
        }

        _hydrateBulkCache() {
            try {
                if (typeof localStorage === 'undefined') return;
                const cached = localStorage.getItem(BULK_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.data && typeof parsed.data === 'object') {
                        this.bulkHistoryByCountry = parsed.data;
                    }
                }
            } catch (e) {}
        }

        _readCountryCache(countryCode) {
            try {
                if (typeof localStorage === 'undefined') return null;
                const cached = localStorage.getItem(`inflation_sdk_full_${countryCode}`);
                if (!cached) return null;
                const parsed = JSON.parse(cached);
                if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
                    return parsed;
                }
            } catch (e) {}
            return null;
        }

        _writeCountryCache(countryCode, records) {
            try {
                if (typeof localStorage === 'undefined') return;
                localStorage.setItem(`inflation_sdk_full_${countryCode}`, JSON.stringify({
                    timestamp: Date.now(),
                    data: records
                }));
            } catch (e) {}
        }

        /**
         * Fetch 10-12 years of CPI inflation across all ~230 countries/territories in a single API call.
         * @returns {Promise<Object<string, Array<{year: number, value: number}>>>}
         */
        async fetchAllCountriesOverview() {
            try {
                if (typeof localStorage !== 'undefined') {
                    const cached = localStorage.getItem(BULK_CACHE_KEY);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (parsed && Date.now() - parsed.timestamp < this.cacheTimeoutMs && parsed.data) {
                            this.bulkHistoryByCountry = parsed.data;
                            return this.bulkHistoryByCountry;
                        }
                    }
                }
            } catch (e) {}

            if (this._bulkPromise) return this._bulkPromise;

            this._bulkPromise = (async () => {
                try {
                    const endYear = new Date().getFullYear();
                    const startYear = endYear - 12;
                    const url = `${this.baseUrl}/country/all/indicator/FP.CPI.TOTL.ZG?date=${startYear}:${endYear}&format=json&per_page=5000`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 9000);

                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!response.ok) throw new Error(`Bulk API responded ${response.status}`);
                    const json = await response.json();
                    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
                        throw new Error('Unexpected bulk World Bank response');
                    }

                    const byCountry = {};
                    for (const item of json[1]) {
                        if (!item || item.value === null || item.value === undefined || !item.countryiso3code) continue;
                        const code = String(item.countryiso3code).toUpperCase();
                        if (!byCountry[code]) byCountry[code] = [];
                        byCountry[code].push({
                            year: parseInt(item.date, 10),
                            value: Math.round(Number(item.value) * 100) / 100
                        });
                    }

                    for (const code of Object.keys(byCountry)) {
                        byCountry[code].sort((a, b) => b.year - a.year);
                    }

                    if (Object.keys(byCountry).length > 0) {
                        this.bulkHistoryByCountry = byCountry;
                        try {
                            if (typeof localStorage !== 'undefined') {
                                localStorage.setItem(BULK_CACHE_KEY, JSON.stringify({
                                    timestamp: Date.now(),
                                    data: byCountry
                                }));
                            }
                        } catch (e) {}
                    }
                } catch (err) {
                    console.warn('InflationSDK: Failed to fetch bulk global inflation overview:', err.message);
                } finally {
                    this._bulkPromise = null;
                }
                return this.bulkHistoryByCountry;
            })();

            return this._bulkPromise;
        }

        async _fetchRawCountryHistory(countryCode, years = 30) {
            const maxYears = Math.max(years, 30);
            const cached = this._readCountryCache(countryCode);
            if (cached && (Date.now() - cached.timestamp < this.cacheTimeoutMs)) {
                return cached.data.slice(0, years);
            }

            if (this._countryPromises[countryCode]) {
                const res = await this._countryPromises[countryCode];
                return res.slice(0, years);
            }

            this._countryPromises[countryCode] = (async () => {
                try {
                    const url = `${this.baseUrl}/country/${encodeURIComponent(countryCode)}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=${maxYears + 15}`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 7000);
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
                    const json = await response.json();
                    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
                        return [];
                    }

                    const records = json[1]
                        .filter(item => item && item.value !== null && item.value !== undefined)
                        .map(item => ({
                            year: parseInt(item.date, 10),
                            value: Math.round(Number(item.value) * 100) / 100
                        }))
                        .sort((a, b) => b.year - a.year)
                        .slice(0, maxYears);

                    if (records.length > 0) {
                        this._writeCountryCache(countryCode, records);
                        return records;
                    }
                } catch (err) {
                    console.warn(`InflationSDK: Failed to fetch live CPI for ${countryCode}:`, err.message);
                } finally {
                    delete this._countryPromises[countryCode];
                }

                // Stale country cache or bulk fallback if live request failed or returned empty
                if (cached && cached.data.length > 0) return cached.data;
                if (this.bulkHistoryByCountry[countryCode] && this.bulkHistoryByCountry[countryCode].length > 0) {
                    return this.bulkHistoryByCountry[countryCode];
                }
                return [];
            })();

            const records = await this._countryPromises[countryCode];
            return records.slice(0, years);
        }

        /**
         * Fetch historic inflation for a country or region code (e.g. 'WLD', 'USA', 'CHN', 'IND', 'EMU')
         * Automatically resolves monetary proxies or global CPI if a territory has no standalone WB series.
         * @param {string} countryCode
         * @param {number} years
         * @returns {Promise<Array<{year: number, value: number}>>}
         */
        async getHistoricInflation(countryCode = 'WLD', years = 30) {
            const code = String(countryCode || 'WLD').toUpperCase();
            let records = await this._fetchRawCountryHistory(code, years);
            if (records.length > 0) return records;

            const proxy = PROXY_COUNTRY_MAP[code];
            if (proxy) {
                records = await this._fetchRawCountryHistory(proxy, years);
                if (records.length > 0) return records;
            }

            if (code !== 'WLD') {
                records = await this._fetchRawCountryHistory('WLD', years);
                if (records.length > 0) return records;
            }

            return [{ year: new Date().getFullYear() - 1, value: 3.0 }];
        }

        /**
         * Synchronously compute rich multi-horizon profile from cached full/bulk data.
         */
        getSyncCountryProfile(countryCode = 'WLD') {
            const code = String(countryCode || 'WLD').toUpperCase();
            const proxy = PROXY_COUNTRY_MAP[code];
            const candidates = [code, ...(proxy ? [proxy] : []), 'WLD'];

            for (const cand of candidates) {
                const fullCached = this._readCountryCache(cand);
                if (fullCached && fullCached.data.length > 0) {
                    const src = cand === code
                        ? 'World Bank Open Data'
                        : `World Bank (${cand === 'WLD' ? 'World Avg' : cand + ' Anchor'})`;
                    return this._buildProfile(code, fullCached.data, src, cand !== code);
                }
                const bulk = this.bulkHistoryByCountry[cand];
                if (Array.isArray(bulk) && bulk.length > 0) {
                    const src = cand === code
                        ? 'World Bank API (10Y)'
                        : `World Bank (${cand === 'WLD' ? 'World Avg' : cand + ' Anchor'})`;
                    return this._buildProfile(code, bulk, src, cand !== code);
                }
            }

            return this._buildProfile(code, [{ year: new Date().getFullYear() - 1, value: 3.0 }], 'Default Estimate', true);
        }

        /**
         * Synchronously return quick 10Y average for a country code if present in cache/bulk.
         */
        getSync10YAverage(countryCode) {
            const prof = this.getSyncCountryProfile(countryCode);
            return prof ? prof.avg10Y : 3.0;
        }

        /**
         * Asynchronously fetch and build a full multi-horizon inflation profile for a country.
         */
        async getCountryProfile(countryCode = 'WLD') {
            const code = String(countryCode || 'WLD').toUpperCase();
            let records = await this._fetchRawCountryHistory(code, 30);
            let source = 'World Bank Open Data';
            let isProxy = false;

            if (!records.length) {
                const proxy = PROXY_COUNTRY_MAP[code];
                if (proxy) {
                    records = await this._fetchRawCountryHistory(proxy, 30);
                    if (records.length) {
                        source = `World Bank (${proxy} Anchor)`;
                        isProxy = true;
                    }
                }
            }

            if (!records.length && code !== 'WLD') {
                records = await this._fetchRawCountryHistory('WLD', 30);
                if (records.length) {
                    source = 'World Bank (World Avg)';
                    isProxy = true;
                }
            }

            if (!records.length) {
                records = [{ year: new Date().getFullYear() - 1, value: 3.0 }];
                source = 'Offline Default';
                isProxy = true;
            }

            return this._buildProfile(code, records, source, isProxy);
        }

        _buildProfile(countryCode, history, source, isProxy = false) {
            const list = Array.isArray(history) && history.length > 0
                ? history
                : [{ year: new Date().getFullYear() - 1, value: 3.0 }];

            const calcAvg = (n) => {
                const slice = list.slice(0, Math.min(n, list.length));
                if (!slice.length) return 0;
                const sum = slice.reduce((acc, r) => acc + r.value, 0);
                return Math.round((sum / slice.length) * 10) / 10;
            };

            const sortedVals = [...list.map(r => r.value)].sort((a, b) => a - b);
            const mid = Math.floor(sortedVals.length / 2);
            const medianRaw = sortedVals.length % 2 !== 0
                ? sortedVals[mid]
                : (sortedVals[mid - 1] + sortedVals[mid]) / 2;
            const median = Math.round(medianRaw * 10) / 10;

            const recent15 = list.slice(0, Math.min(15, list.length));
            const peakEntry = recent15.reduce((best, r) => (!best || r.value > best.value ? r : best), null);
            const minEntry = recent15.reduce((best, r) => (!best || r.value < best.value ? r : best), null);

            const latest = list[0] ? Math.round(list[0].value * 10) / 10 : 3.0;
            const latestYear = list[0] ? list[0].year : (new Date().getFullYear() - 1);
            const anchorCode = PROXY_COUNTRY_MAP[countryCode] || countryCode;
            const cbTarget = CB_TARGETS[anchorCode] ?? 2.0;

            return {
                countryCode,
                source,
                isProxy,
                yearsCount: list.length,
                latest: { rate: latest, year: latestYear },
                avg3Y: calcAvg(3),
                avg5Y: calcAvg(5),
                avg10Y: calcAvg(10),
                avg20Y: calcAvg(20),
                avg30Y: calcAvg(30),
                median,
                cbTarget,
                peak: peakEntry ? { rate: Math.round(peakEntry.value * 10) / 10, year: peakEntry.year } : { rate: latest, year: latestYear },
                low: minEntry ? { rate: Math.round(minEntry.value * 10) / 10, rawRate: minEntry.value, year: minEntry.year } : { rate: 0, rawRate: 0, year: latestYear },
                history: list
            };
        }

        /**
         * Calculate average annual inflation over the last N years (backwards-compatible helper)
         */
        async getDecadeAverage(countryCode = 'WLD', years = 10) {
            const history = await this.getHistoricInflation(countryCode, years);
            if (!history || history.length === 0) {
                return {
                    countryCode,
                    average: 3.0,
                    yearsCount: 0,
                    source: 'Default fallback estimate',
                    history: []
                };
            }

            const total = history.reduce((sum, item) => sum + item.value, 0);
            const avg = total / history.length;

            return {
                countryCode,
                average: Math.round(avg * 10) / 10,
                exactAverage: avg,
                yearsCount: history.length,
                source: 'World Bank Open Data',
                history
            };
        }
    }

    return new InflationSDK();
}));
