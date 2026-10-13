import { iso } from './utils.js';

const cache = {};

export async function fetchRatesByDate(dateKey) {
  if (cache[dateKey]) {
    return cache[dateKey];
  }

  const urls = [
    `https://${dateKey}.currency-api.pages.dev/v1/currencies/usd.json`,
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateKey}/v1/currencies/usd.json`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (!res.ok) continue;
      const j = await res.json();
      if (j && j.usd) {
        j.usd.usd = 1;
        cache[dateKey] = { date: j.date, rates: j.usd };
        return cache[dateKey];
      }
    } catch (e) {
      // Continue to next mirror
    }
  }

  if (dateKey === 'latest') {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const j = await res.json();
    const rMap = {};
    for (const k in j.rates) {
      rMap[k.toLowerCase()] = j.rates[k];
    }
    cache[dateKey] = {
      date: iso(new Date(j.time_last_update_unix * 1000)),
      rates: rMap
    };
    return cache[dateKey];
  }

  throw new Error(`Data unavailable for date: ${dateKey}`);
}
