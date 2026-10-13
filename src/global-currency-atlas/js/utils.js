import { RAW_COUNTRIES, MIN_DATE } from './config.js';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const currNames = new Intl.DisplayNames(['en'], { type: 'currency' });

export const cname = (cur) => {
  try {
    return currNames.of(cur) || cur;
  } catch {
    return cur;
  }
};

export const flag = (a2) => {
  return String.fromCodePoint(...[...a2].map(c => 127397 + c.charCodeAt(0)));
};

export const COUNTRIES = {};
RAW_COUNTRIES.trim().split(/\s+/).forEach(s => {
  const [a3, a2, cur] = s.split(':');
  COUNTRIES[a3] = {
    a3,
    a2,
    cur,
    name: regionNames.of(a2),
    flag: flag(a2)
  };
});

export const todayUTC = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const iso = (d) => d.toISOString().slice(0, 10);

export const maxBack = Math.floor((todayUTC() - MIN_DATE) / 864e5);

export const dateForPos = (p) => new Date(todayUTC().getTime() - (maxBack - p) * 864e5);

export const posFromDate = (d) => {
  const p = maxBack - Math.round((todayUTC() - d) / 864e5);
  return isNaN(p) ? maxBack : Math.max(0, Math.min(maxBack, p));
};

export const fmtDate = (s) => {
  return new Date(s + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

export function fmt(n) {
  if (n == null || isNaN(n)) return '---';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1000) return Math.round(n).toLocaleString('en-US');
  if (n >= 100) return n.toFixed(1);
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(3);
  return n.toPrecision(3);
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
