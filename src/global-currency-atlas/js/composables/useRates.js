import { ref, computed } from 'vue';
import { ALT_CURRENCIES } from '../config.js';
import { COUNTRIES, cname, maxBack, iso, dateForPos, posFromDate, fmtDate, sleep } from '../utils.js';
import { fetchRatesByDate } from '../api.js';

export function useRates(showToast) {
  const base = ref('USD');
  const pos = ref(maxBack);
  const date = ref('');
  const rates = ref(null);
  const playing = ref(false);

  const currencyOptions = computed(() => {
    const set = new Map();
    Object.values(COUNTRIES).forEach(c => {
      if (!set.has(c.cur)) set.set(c.cur, { code: c.cur, name: cname(c.cur) });
    });
    return Array.from(set.values()).sort((a, b) => a.code.localeCompare(b.code));
  });

  const rateOf = (cur) => {
    if (!rates.value) return null;
    const r = rates.value;
    const f = c => r[c.toLowerCase()] ?? r[(ALT_CURRENCIES[c] || '').toLowerCase()];
    const t = f(cur), b = f(base.value);
    return (t && b) ? t / b : null;
  };

  const formattedDate = computed(() => date.value ? fmtDate(date.value) : 'Loading…');

  let fetchToken = 0;
  const loadRates = async () => {
    const my = ++fetchToken;
    const stage = document.getElementById('stage');
    if (stage) stage.classList.add('busy');

    try {
      const key = pos.value === maxBack ? 'latest' : iso(dateForPos(pos.value));
      const d = await fetchRatesByDate(key);

      if (my !== fetchToken) return;

      rates.value = d.rates;
      date.value = d.date;
      if (!rates.value[base.value.toLowerCase()]) base.value = 'USD';
      history.replaceState(null, '', '#' + base.value + (pos.value === maxBack ? '' : '@' + date.value));
    } catch (e) {
      if (my === fetchToken) showToast("Couldn't load rates for that date");
    } finally {
      if (my === fetchToken && stage) stage.classList.remove('busy');
    }
  };

  const togglePlay = async () => {
    if (playing.value) {
      playing.value = false;
      return;
    }
    playing.value = true;
    let p = pos.value >= maxBack - 1 ? 0 : pos.value;
    while (playing.value) {
      pos.value = p;
      await loadRates();
      if (p >= maxBack) break;
      await sleep(650);
      p = Math.min(maxBack, p + 25);
    }
    playing.value = false;
  };

  const onSliderInput = (e) => {
    pos.value = +e.target.value;
    date.value = iso(dateForPos(pos.value));
  };

  const onSliderChange = () => {
    playing.value = false;
    loadRates();
  };

  const onDateChange = (e) => {
    if (!e.target.value) return;
    playing.value = false;
    pos.value = posFromDate(new Date(e.target.value + 'T00:00:00Z'));
    loadRates();
  };

  const goToToday = () => {
    playing.value = false;
    pos.value = maxBack;
    loadRates();
  };

  const goTo1YAgo = () => {
    playing.value = false;
    pos.value = Math.max(0, maxBack - 365);
    loadRates();
  };

  const setBase = (cur) => {
    if (!cur) return;
    base.value = cur.toUpperCase();
    history.replaceState(null, '', '#' + base.value + (pos.value === maxBack ? '' : '@' + date.value));
  };

  const onBaseChange = () => {
    history.replaceState(null, '', '#' + base.value + (pos.value === maxBack ? '' : '@' + date.value));
  };

  return {
    base,
    pos,
    date,
    rates,
    playing,
    currencyOptions,
    formattedDate,
    rateOf,
    loadRates,
    togglePlay,
    onSliderInput,
    onSliderChange,
    onDateChange,
    goToToday,
    goTo1YAgo,
    setBase,
    onBaseChange
  };
}
