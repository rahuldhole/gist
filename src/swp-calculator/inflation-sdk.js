/**
 * InflationSDK - Lightweight SDK to fetch historic inflation data from open source APIs
 * Primary provider: World Bank Open Data API (FP.CPI.TOTL.ZG indicator - Inflation, consumer prices annual %)
 * Fallback: Built-in 30-year historic dataset if offline or blocked by CORS/network
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

    // Central Bank Target / Long-term Policy Anchors (%)
    const CB_TARGETS = {
        WLD: 3.0,
        USA: 2.0,
        EMU: 2.0,
        GBR: 2.0,
        IND: 4.0,
        CAN: 2.0,
        AUS: 2.5,
        JPN: 2.0,
        CHE: 1.5,
        SGP: 2.0,
        ARE: 2.0
    };

    // Baseline 30-year historical world & country inflation data (fallback cache)
    const FALLBACK_DATA = {
        WLD: [
            { year: 2025, value: 3.04 }, { year: 2024, value: 3.01 }, { year: 2023, value: 5.73 }, { year: 2022, value: 8.00 }, { year: 2021, value: 3.47 },
            { year: 2020, value: 1.92 }, { year: 2019, value: 2.22 }, { year: 2018, value: 2.45 }, { year: 2017, value: 2.25 }, { year: 2016, value: 1.60 },
            { year: 2015, value: 1.44 }, { year: 2014, value: 2.39 }, { year: 2013, value: 2.61 }, { year: 2012, value: 3.73 }, { year: 2011, value: 4.80 },
            { year: 2010, value: 3.33 }, { year: 2009, value: 2.86 }, { year: 2008, value: 8.95 }, { year: 2007, value: 4.81 }, { year: 2006, value: 4.27 },
            { year: 2005, value: 4.11 }, { year: 2004, value: 3.52 }, { year: 2003, value: 3.03 }, { year: 2002, value: 2.91 }, { year: 2001, value: 3.84 },
            { year: 2000, value: 3.43 }, { year: 1999, value: 3.04 }, { year: 1998, value: 5.10 }, { year: 1997, value: 5.55 }, { year: 1996, value: 6.53 }
        ],
        USA: [
            { year: 2024, value: 2.95 }, { year: 2023, value: 4.12 }, { year: 2022, value: 8.00 }, { year: 2021, value: 4.70 }, { year: 2020, value: 1.23 },
            { year: 2019, value: 1.81 }, { year: 2018, value: 2.44 }, { year: 2017, value: 2.13 }, { year: 2016, value: 1.26 }, { year: 2015, value: 0.12 },
            { year: 2014, value: 1.62 }, { year: 2013, value: 1.46 }, { year: 2012, value: 2.07 }, { year: 2011, value: 3.16 }, { year: 2010, value: 1.64 },
            { year: 2009, value: -0.36 }, { year: 2008, value: 3.84 }, { year: 2007, value: 2.85 }, { year: 2006, value: 3.23 }, { year: 2005, value: 3.39 },
            { year: 2004, value: 2.68 }, { year: 2003, value: 2.27 }, { year: 2002, value: 1.59 }, { year: 2001, value: 2.83 }, { year: 2000, value: 3.38 },
            { year: 1999, value: 2.19 }, { year: 1998, value: 1.55 }, { year: 1997, value: 2.34 }, { year: 1996, value: 2.93 }, { year: 1995, value: 2.81 }
        ],
        EMU: [
            { year: 2025, value: 2.47 }, { year: 2024, value: 2.26 }, { year: 2023, value: 5.95 }, { year: 2022, value: 8.55 }, { year: 2021, value: 2.53 },
            { year: 2020, value: 0.22 }, { year: 2019, value: 1.45 }, { year: 2018, value: 1.70 }, { year: 2017, value: 1.38 }, { year: 2016, value: 0.15 },
            { year: 2015, value: -0.10 }, { year: 2014, value: 0.20 }, { year: 2013, value: 1.22 }, { year: 2012, value: 2.60 }, { year: 2011, value: 3.29 },
            { year: 2010, value: 1.53 }, { year: 2009, value: 0.51 }, { year: 2008, value: 4.15 }, { year: 2007, value: 2.51 }, { year: 2006, value: 2.77 },
            { year: 2005, value: 2.56 }, { year: 2004, value: 2.23 }, { year: 2003, value: 2.10 }, { year: 2002, value: 2.47 }, { year: 2001, value: 2.93 },
            { year: 2000, value: 3.04 }, { year: 1999, value: 2.13 }, { year: 1998, value: 2.39 }, { year: 1997, value: 2.34 }, { year: 1996, value: 3.07 }
        ],
        GBR: [
            { year: 2025, value: 3.88 }, { year: 2024, value: 3.27 }, { year: 2023, value: 6.79 }, { year: 2022, value: 7.92 }, { year: 2021, value: 2.52 },
            { year: 2020, value: 0.99 }, { year: 2019, value: 1.74 }, { year: 2018, value: 2.29 }, { year: 2017, value: 2.56 }, { year: 2016, value: 1.01 },
            { year: 2015, value: 0.37 }, { year: 2014, value: 1.45 }, { year: 2013, value: 2.29 }, { year: 2012, value: 2.57 }, { year: 2011, value: 3.86 },
            { year: 2010, value: 2.49 }, { year: 2009, value: 1.96 }, { year: 2008, value: 3.52 }, { year: 2007, value: 2.39 }, { year: 2006, value: 2.46 },
            { year: 2005, value: 2.09 }, { year: 2004, value: 1.39 }, { year: 2003, value: 1.38 }, { year: 2002, value: 1.52 }, { year: 2001, value: 1.53 },
            { year: 2000, value: 1.18 }, { year: 1999, value: 1.75 }, { year: 1998, value: 1.82 }, { year: 1997, value: 2.20 }, { year: 1996, value: 2.85 }
        ],
        IND: [
            { year: 2025, value: 2.40 }, { year: 2024, value: 4.95 }, { year: 2023, value: 5.65 }, { year: 2022, value: 6.70 }, { year: 2021, value: 5.13 },
            { year: 2020, value: 6.62 }, { year: 2019, value: 3.73 }, { year: 2018, value: 3.94 }, { year: 2017, value: 3.33 }, { year: 2016, value: 4.95 },
            { year: 2015, value: 4.91 }, { year: 2014, value: 6.67 }, { year: 2013, value: 10.02 }, { year: 2012, value: 9.48 }, { year: 2011, value: 8.91 },
            { year: 2010, value: 11.99 }, { year: 2009, value: 10.88 }, { year: 2008, value: 8.35 }, { year: 2007, value: 6.37 }, { year: 2006, value: 5.80 },
            { year: 2005, value: 4.25 }, { year: 2004, value: 3.77 }, { year: 2003, value: 3.81 }, { year: 2002, value: 4.30 }, { year: 2001, value: 3.78 },
            { year: 2000, value: 4.01 }, { year: 1999, value: 4.67 }, { year: 1998, value: 13.23 }, { year: 1997, value: 7.16 }, { year: 1996, value: 8.98 }
        ],
        CAN: [
            { year: 2025, value: 2.07 }, { year: 2024, value: 2.38 }, { year: 2023, value: 3.88 }, { year: 2022, value: 6.80 }, { year: 2021, value: 3.40 },
            { year: 2020, value: 0.72 }, { year: 2019, value: 1.95 }, { year: 2018, value: 2.27 }, { year: 2017, value: 1.60 }, { year: 2016, value: 1.43 },
            { year: 2015, value: 1.13 }, { year: 2014, value: 1.91 }, { year: 2013, value: 0.94 }, { year: 2012, value: 1.52 }, { year: 2011, value: 2.91 },
            { year: 2010, value: 1.78 }, { year: 2009, value: 0.30 }, { year: 2008, value: 2.37 }, { year: 2007, value: 2.14 }, { year: 2006, value: 2.00 },
            { year: 2005, value: 2.21 }, { year: 2004, value: 1.86 }, { year: 2003, value: 2.76 }, { year: 2002, value: 2.26 }, { year: 2001, value: 2.53 },
            { year: 2000, value: 2.72 }, { year: 1999, value: 1.73 }, { year: 1998, value: 1.00 }, { year: 1997, value: 1.62 }, { year: 1996, value: 1.57 }
        ],
        AUS: [
            { year: 2025, value: 2.87 }, { year: 2024, value: 3.17 }, { year: 2023, value: 5.60 }, { year: 2022, value: 6.59 }, { year: 2021, value: 2.86 },
            { year: 2020, value: 0.85 }, { year: 2019, value: 1.61 }, { year: 2018, value: 1.91 }, { year: 2017, value: 1.95 }, { year: 2016, value: 1.28 },
            { year: 2015, value: 1.51 }, { year: 2014, value: 2.49 }, { year: 2013, value: 2.45 }, { year: 2012, value: 1.76 }, { year: 2011, value: 3.30 },
            { year: 2010, value: 2.92 }, { year: 2009, value: 1.77 }, { year: 2008, value: 4.35 }, { year: 2007, value: 2.33 }, { year: 2006, value: 3.56 },
            { year: 2005, value: 2.69 }, { year: 2004, value: 2.34 }, { year: 2003, value: 2.73 }, { year: 2002, value: 2.98 }, { year: 2001, value: 4.41 },
            { year: 2000, value: 4.46 }, { year: 1999, value: 1.48 }, { year: 1998, value: 0.86 }, { year: 1997, value: 0.22 }, { year: 1996, value: 2.62 }
        ],
        JPN: [
            { year: 2025, value: 3.17 }, { year: 2024, value: 2.74 }, { year: 2023, value: 3.27 }, { year: 2022, value: 2.50 }, { year: 2021, value: -0.23 },
            { year: 2020, value: -0.02 }, { year: 2019, value: 0.47 }, { year: 2018, value: 0.99 }, { year: 2017, value: 0.48 }, { year: 2016, value: -0.13 },
            { year: 2015, value: 0.80 }, { year: 2014, value: 2.76 }, { year: 2013, value: 0.34 }, { year: 2012, value: -0.04 }, { year: 2011, value: -0.27 },
            { year: 2010, value: -0.73 }, { year: 2009, value: -1.35 }, { year: 2008, value: 1.38 }, { year: 2007, value: 0.06 }, { year: 2006, value: 0.25 },
            { year: 2005, value: -0.28 }, { year: 2004, value: -0.01 }, { year: 2003, value: -0.26 }, { year: 2002, value: -0.92 }, { year: 2001, value: -0.74 },
            { year: 2000, value: -0.68 }, { year: 1999, value: -0.34 }, { year: 1998, value: 0.66 }, { year: 1997, value: 1.75 }, { year: 1996, value: 0.14 }
        ],
        CHE: [
            { year: 2025, value: 0.15 }, { year: 2024, value: 1.06 }, { year: 2023, value: 2.14 }, { year: 2022, value: 2.84 }, { year: 2021, value: 0.58 },
            { year: 2020, value: -0.73 }, { year: 2019, value: 0.36 }, { year: 2018, value: 0.94 }, { year: 2017, value: 0.53 }, { year: 2016, value: -0.43 },
            { year: 2015, value: -1.14 }, { year: 2014, value: -0.01 }, { year: 2013, value: -0.22 }, { year: 2012, value: -0.69 }, { year: 2011, value: 0.23 },
            { year: 2010, value: 0.69 }, { year: 2009, value: -0.48 }, { year: 2008, value: 2.43 }, { year: 2007, value: 0.73 }, { year: 2006, value: 1.06 },
            { year: 2005, value: 1.17 }, { year: 2004, value: 0.80 }, { year: 2003, value: 0.64 }, { year: 2002, value: 0.64 }, { year: 2001, value: 0.99 },
            { year: 2000, value: 1.56 }, { year: 1999, value: 0.81 }, { year: 1998, value: 0.02 }, { year: 1997, value: 0.52 }, { year: 1996, value: 0.81 }
        ],
        SGP: [
            { year: 2025, value: 0.90 }, { year: 2024, value: 2.39 }, { year: 2023, value: 4.83 }, { year: 2022, value: 6.13 }, { year: 2021, value: 2.32 },
            { year: 2020, value: -0.17 }, { year: 2019, value: 0.57 }, { year: 2018, value: 0.44 }, { year: 2017, value: 0.58 }, { year: 2016, value: -0.53 },
            { year: 2015, value: -0.52 }, { year: 2014, value: 1.03 }, { year: 2013, value: 2.36 }, { year: 2012, value: 4.58 }, { year: 2011, value: 5.25 },
            { year: 2010, value: 2.83 }, { year: 2009, value: 0.59 }, { year: 2008, value: 6.64 }, { year: 2007, value: 2.11 }, { year: 2006, value: 0.97 },
            { year: 2005, value: 0.43 }, { year: 2004, value: 1.66 }, { year: 2003, value: 0.51 }, { year: 2002, value: -0.39 }, { year: 2001, value: 1.00 },
            { year: 2000, value: 1.36 }, { year: 1999, value: 0.02 }, { year: 1998, value: -0.27 }, { year: 1997, value: 2.00 }, { year: 1996, value: 1.38 }
        ],
        ARE: [
            { year: 2025, value: 1.25 }, { year: 2024, value: 1.66 }, { year: 2023, value: 1.63 }, { year: 2022, value: 5.29 }, { year: 2021, value: 0.18 },
            { year: 2020, value: -2.08 }, { year: 2019, value: -1.93 }, { year: 2018, value: 3.07 }, { year: 2017, value: 1.97 }, { year: 2016, value: 1.62 },
            { year: 2015, value: 4.07 }, { year: 2014, value: 2.35 }, { year: 2013, value: 1.10 }, { year: 2012, value: 0.66 }, { year: 2011, value: 0.88 },
            { year: 2010, value: 0.88 }, { year: 2009, value: 1.56 }, { year: 2008, value: 12.25 }
        ]
    };

    class InflationSDK {
        constructor(options = {}) {
            this.cacheTimeoutMs = options.cacheTimeoutMs || 24 * 60 * 60 * 1000; // 24 hours
            this.baseUrl = options.baseUrl || 'https://api.worldbank.org/v2';
        }

        /**
         * Fetch historic inflation for a country or region code (e.g. 'WLD', 'USA', 'IND', 'EMU', 'GBR')
         * Always fetches up to 35 years once per country and slices locally for fast multi-horizon queries.
         * @param {string} countryCode
         * @param {number} years
         * @returns {Promise<Array<{year: number, value: number}>>}
         */
        async getHistoricInflation(countryCode = 'WLD', years = 30) {
            const maxYears = Math.max(years, 30);
            const cacheKey = `inflation_sdk_full_${countryCode}`;
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < this.cacheTimeoutMs && Array.isArray(parsed.data) && parsed.data.length > 0) {
                        return parsed.data.slice(0, years);
                    }
                }
            } catch (e) {
                // Ignore localStorage errors
            }

            try {
                // World Bank API indicator FP.CPI.TOTL.ZG
                const url = `${this.baseUrl}/country/${encodeURIComponent(countryCode)}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=${maxYears + 10}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 7000);

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const json = await response.json();
                if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
                    throw new Error('Unexpected API response structure');
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
                    try {
                        localStorage.setItem(cacheKey, JSON.stringify({
                            timestamp: Date.now(),
                            data: records
                        }));
                    } catch (e) {}
                    return records.slice(0, years);
                }
            } catch (err) {
                console.warn('InflationSDK: Failed to fetch live data from World Bank, using fallback cache:', err.message);
            }

            const fallback = FALLBACK_DATA[countryCode] || FALLBACK_DATA.WLD;
            return fallback.slice(0, years);
        }

        /**
         * Synchronously compute rich multi-horizon profile from cached or fallback data (instant UI response)
         */
        getSyncCountryProfile(countryCode = 'WLD') {
            let history = null;
            try {
                const cached = localStorage.getItem(`inflation_sdk_full_${countryCode}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
                        history = parsed.data;
                    }
                }
            } catch (e) {}

            if (!history) {
                history = FALLBACK_DATA[countryCode] || FALLBACK_DATA.WLD;
            }
            return this._buildProfile(countryCode, history, 'World Bank Open Data');
        }

        /**
         * Asynchronously fetch and build a full multi-horizon inflation profile for a country
         * Includes Latest, 3Y, 5Y, 10Y, 20Y, 30Y averages, Median, Peak Stress, Low, CB Target, and yearly series.
         */
        async getCountryProfile(countryCode = 'WLD') {
            const history = await this.getHistoricInflation(countryCode, 30);
            return this._buildProfile(countryCode, history, 'World Bank Open Data');
        }

        _buildProfile(countryCode, history, source) {
            const list = Array.isArray(history) && history.length > 0 ? history : FALLBACK_DATA.WLD;
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
            const latestYear = list[0] ? list[0].year : 2025;
            const cbTarget = CB_TARGETS[countryCode] ?? 2.0;

            return {
                countryCode,
                source,
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
                low: minEntry ? { rate: Math.max(0, Math.round(minEntry.value * 10) / 10), rawRate: minEntry.value, year: minEntry.year } : { rate: 0, rawRate: 0, year: latestYear },
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
                    average: 3.4,
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
