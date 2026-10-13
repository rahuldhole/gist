import { ref, computed, watch, onMounted } from 'vue';
import { GEO_URL, COMMODITIES, MIN_DATE } from './config.js';
import { COUNTRIES, cname, fmt, iso, todayUTC, maxBack, posFromDate } from './utils.js';
import { useRates } from './composables/useRates.js';
import { useCommodities } from './composables/useCommodities.js';
import { useMap } from './composables/useMap.js';

export default {
  setup() {
    const toastMsg = ref('');
    const toastBg = ref('#7f1d1d');
    let toastTimer = null;

    const showToast = (text, bg = '#7f1d1d') => {
      toastMsg.value = text;
      toastBg.value = bg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastMsg.value = ''; }, 3500);
    };

    // Rates State & Management
    const {
      base, pos, date, rates, playing, currencyOptions, formattedDate,
      rateOf, loadRates, togglePlay, onSliderInput, onSliderChange,
      onDateChange, goToToday, goTo1YAgo, setBase, onBaseChange
    } = useRates(showToast);

    // Modes & Display States
    const mapMode = ref('fx'); // 'fx', 'gold', 'silver'
    const metalWeight = ref('g'); // 'g', '10g', 'oz'
    const metalDisplayCur = ref('local'); // 'local', 'base'

    const raceMode = ref('strong'); // 'strong', 'nominal'
    const tableFilter = ref('all'); // 'all', 'commodities'
    const tableSearch = ref('');
    const sortCol = ref('rate');
    const sortAsc = ref(true);

    const showRatesPopover = ref(false);
    const showTimePopover = ref(false);
    const showMapConfigs = ref(typeof window !== 'undefined' ? window.innerWidth >= 640 : true);
    const rightPanelTab = ref('ledger'); // 'ledger' or 'race'
    const isFullscreen = ref(false);

    // Commodities & Precious Metals
    const {
      goldUnit, calcAmt, calcAsset, ratesTab, goldMetrics, goldBadgeText,
      filteredAssetCards, quickCalc, getCountryAssetData, getCountryFuelData, selectCalcAsset
    } = useCommodities(rates, base, rateOf);

    // D3 Heatmap Map Composable
    const {
      k, legendLabels, heat, buildMap, paintMap, layoutLabels, resetMapZoom, savePNG
    } = useMap(base, rates, mapMode, metalWeight, metalDisplayCur, rateOf, getCountryAssetData, getCountryFuelData, setBase);

    // Top 10 Currency Race Computed List
    const sortedRace = computed(() => {
      if (!rates.value) return [];
      const isFuel = mapMode.value === 'fuel';
      const isMetal = mapMode.value === 'gold' || mapMode.value === 'silver';
      const assetKey = mapMode.value === 'gold' ? 'xau' : (mapMode.value === 'silver' ? 'xag' : null);

      const deduped = [];
      const seen = new Set();
      Object.values(COUNTRIES).forEach(c => {
        if (!seen.has(c.cur)) { seen.add(c.cur); deduped.push(c); }
      });

      let list = [];
      if (isFuel) {
        list = deduped.map(c => {
          const f = getCountryFuelData(c.a3, c.cur);
          if (!f) return null;
          return {
            ...c,
            fuel: f,
            // When 'strong', rank by lowest price per liter (most liters per base)
            rate: raceMode.value === 'strong' ? f.litersPerBaseUnit : f.localPricePerLiter
          };
        }).filter(c => c && c.rate != null);

        list.sort((a, b) => b.rate - a.rate);
      } else if (isMetal) {
        list = deduped.map(c => {
          const a = getCountryAssetData(c.cur, assetKey);
          if (!a) return null;
          return {
            ...c,
            asset: a,
            rate: raceMode.value === 'strong' ? a.mgPerLocalUnit : a.localPricePerGram || a.localPricePerUnit
          };
        }).filter(c => c && c.rate != null);

        list.sort((a, b) => b.rate - a.rate);
      } else {
        list = deduped.map(c => {
          const r = rateOf(c.cur);
          return { ...c, rate: r };
        }).filter(c => c.rate != null && c.cur !== base.value);

        if (raceMode.value === 'strong') list.sort((a, b) => a.rate - b.rate);
        else list.sort((a, b) => b.rate - a.rate);
      }

      const top10 = list.slice(0, 10);
      return top10.map((item, idx) => {
        const barPct = raceMode.value === 'strong' ? (95 - idx * 6.5) : (idx === 0 ? 98 : Math.max(15, 98 - idx * 7.5));
        const barColor = raceMode.value === 'strong'
          ? (mapMode.value === 'fuel'
              ? 'linear-gradient(90deg, #10b981, #f59e0b)'
              : (mapMode.value === 'gold' ? 'linear-gradient(90deg, #10b981, #facc15)' : 'linear-gradient(90deg, #10b981, #38bdf8)'))
          : 'linear-gradient(90deg, #f97316, #ef4444)';

        let valDisplay = fmt(item.rate);
        if (isFuel) {
          if (raceMode.value === 'strong') {
            valDisplay = `${item.fuel.litersPerBaseUnit.toFixed(1)} L / ${base.value}`;
          } else {
            valDisplay = `${fmt(item.fuel.localPricePerLiter)} ${item.cur}/L`;
          }
        } else if (isMetal) {
          if (raceMode.value === 'strong') {
            valDisplay = `${fmt(item.asset.mgPerLocalUnit)} mg`;
          } else {
            valDisplay = `${fmt(item.asset.localPricePerGram || item.asset.localPricePerUnit)} ${item.cur}`;
          }
        }
        return { ...item, barPct, barColor, valDisplay };
      });
    });

    // World Currency Ledger Table
    const filteredTable = computed(() => {
      if (!rates.value) return [];
      let items = Object.values(COUNTRIES).map(c => {
        const r = rateOf(c.cur);
        return {
          ...c,
          rate: r,
          inverse: r ? 1 / r : null,
          isCommodity: false,
          subText: `${c.cur} · ${cname(c.cur)}`
        };
      }).filter(c => c.rate != null);

      const commodityItems = COMMODITIES.map(c => {
        const r = rateOf(c.id);
        return {
          a3: c.id.toUpperCase(),
          a2: c.symbol,
          cur: c.symbol,
          name: c.name,
          flag: c.icon,
          rate: r,
          inverse: r ? 1 / r : null,
          isCommodity: true,
          subText: `${c.symbol} · ${c.desc}`
        };
      }).filter(c => c.rate != null);

      if (tableFilter.value === 'commodities') {
        items = commodityItems;
      } else {
        const q = tableSearch.value.toLowerCase().trim();
        if (q) {
          const matchedComm = commodityItems.filter(c =>
            c.name.toLowerCase().includes(q) || c.cur.toLowerCase().includes(q) || 'gold metal silver copper oil'.includes(q)
          );
          items = [...items, ...matchedComm];
        }
      }

      const q = tableSearch.value.toLowerCase().trim();
      if (q) {
        items = items.filter(c => c.name.toLowerCase().includes(q) || c.cur.toLowerCase().includes(q) || (c.a2 && c.a2.toLowerCase().includes(q)));
      }

      const asc = sortAsc.value ? 1 : -1;
      items.sort((a, b) => {
        if (sortCol.value === 'country') return asc * a.name.localeCompare(b.name);
        if (sortCol.value === 'rate') return asc * ((a.rate || 0) - (b.rate || 0));
        if (sortCol.value === 'inverse') return asc * ((a.inverse || 0) - (b.inverse || 0));
        return 0;
      });

      return items.map(c => {
        let rateText = '', invText = '', tierColor = '', tierLabel = '';
        if (mapMode.value === 'fuel' && !c.isCommodity) {
          const fuel = getCountryFuelData(c.a3, c.cur);
          if (fuel) {
            rateText = `${fmt(fuel.localPricePerLiter)} ${c.cur} / L`;
            invText = `$${fuel.priceUsd.toFixed(2)} USD / L`;
            tierColor = fuel.isSubsidized ? '#22c55e' : (fuel.isHighTax ? '#ef4444' : '#f59e0b');
            tierLabel = fuel.isSubsidized ? '⚡ Subsidized' : (fuel.isHighTax ? 'High Duty' : 'Market');
          }
        } else if (mapMode.value === 'gold' && !c.isCommodity) {
          const a = getCountryAssetData(c.cur, 'xau');
          if (a) {
            rateText = `${fmt(a.localPricePerGram)} ${c.cur} / g`;
            invText = `${fmt(a.basePricePerGram)} ${base.value} / g`;
            tierColor = heat(Math.min(1, Math.max(0, Math.log10(a.localPricePerGram) / 4)));
            tierLabel = `${a.mgPerLocalUnit.toFixed(2)} mg/unit`;
          }
        } else if (mapMode.value === 'silver' && !c.isCommodity) {
          const a = getCountryAssetData(c.cur, 'xag');
          if (a) {
            rateText = `${fmt(a.localPricePerGram)} ${c.cur} / g`;
            invText = `${fmt(a.basePricePerGram)} ${base.value} / g`;
            tierColor = heat(Math.min(1, Math.max(0, Math.log10(a.localPricePerGram) / 4)));
            tierLabel = `${a.mgPerLocalUnit.toFixed(2)} mg/unit`;
          }
        } else {
          const isBase = c.cur === base.value;
          rateText = isBase ? '1.00 (Base)' : `${fmt(c.rate)} ${c.cur}`;
          invText = isBase ? `1.00 ${base.value}` : `${fmt(c.inverse)} ${base.value}`;
          tierColor = isBase ? '#38bdf8' : (c.isCommodity ? '#facc15' : (c.rate ? heat(Math.min(1, Math.max(0, Math.log10(c.rate) / 4))) : '#888'));
          tierLabel = c.isCommodity ? 'Commodity / Asset' : (isBase ? 'Standard' : (c.rate < 1 ? 'High Value' : 'Nominal Tier'));
        }
        return { ...c, rateText, invText, tierColor, tierLabel };
      });
    });

    const dateline = computed(() => {
      if (!date.value) return 'Loading rates…';
      if (mapMode.value === 'fuel') return `${formattedDate.value} · Retail Gasoline & Fuel prices across world markets in local & USD/base`;
      if (mapMode.value === 'gold') return `${formattedDate.value} · 24K Pure Gold rates across 160+ countries in local currency & ${base.value}`;
      if (mapMode.value === 'silver') return `${formattedDate.value} · Fine Silver rates across 160+ countries in local currency & ${base.value}`;
      return `${formattedDate.value} · live foreign exchange rates per 1 ${base.value}`;
    });

    const setMapMode = (mode) => {
      mapMode.value = mode;
    };

    const sortTable = (col) => {
      if (sortCol.value === col) sortAsc.value = !sortAsc.value;
      else { sortCol.value = col; sortAsc.value = true; }
    };

    const onRowClick = (c) => {
      if (c.isCommodity) {
        showRatesPopover.value = true;
        selectCalcAsset(c.a3.toLowerCase());
      } else {
        setBase(c.cur);
      }
    };

    const visualizeGoldOnMap = () => {
      showRatesPopover.value = false;
      mapMode.value = 'gold';
      const st = document.getElementById('stage');
      if (st) st.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const visualizeFuelOnMap = () => {
      showRatesPopover.value = false;
      mapMode.value = 'fuel';
      const st = document.getElementById('stage');
      if (st) st.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const scrollToMetals = () => {
      const el = document.getElementById('metals-benchmarks');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleTimePopover = () => {
      showTimePopover.value = !showTimePopover.value;
      if (showTimePopover.value) showRatesPopover.value = false;
    };

    const copyLink = () => {
      const url = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => showToast('Share link copied to clipboard!', '#14532d'))
          .catch(() => copyFallback(url));
      } else copyFallback(url);
    };

    const copyFallback = (text) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Share link copied to clipboard!', '#14532d');
      } catch (e) {
        showToast(text, '#1e293b');
      }
      document.body.removeChild(ta);
    };

    const toggleFullscreen = async () => {
      const stage = document.getElementById('stage');
      if (!stage) return;
      try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (stage.requestFullscreen) {
            await stage.requestFullscreen();
          } else if (stage.webkitRequestFullscreen) {
            await stage.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          }
        }
      } catch (err) {
        showToast('Fullscreen mode not available', '#b91c1c');
      }
    };

    // Watchers
    watch([rates, base, mapMode, metalWeight, metalDisplayCur], () => {
      paintMap();
      layoutLabels(k.value);
    });

    onMounted(async () => {
      const m = location.hash.match(/^#([A-Za-z]{3})(?:@(\d{4}-\d{2}-\d{2}))?$/);
      if (m) {
        base.value = m[1].toUpperCase();
        if (m[2]) pos.value = posFromDate(new Date(m[2] + 'T00:00:00Z'));
      }

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.popover-menu-container')) {
          showRatesPopover.value = false;
          showTimePopover.value = false;
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          showRatesPopover.value = false;
          showTimePopover.value = false;
        }
      });

      document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement;
      });
      document.addEventListener('webkitfullscreenchange', () => {
        isFullscreen.value = !!document.webkitFullscreenElement;
      });

      try {
        const geoData = await (await fetch(GEO_URL)).json();
        buildMap(geoData);
      } catch (e) {
        showToast("Couldn't load map boundaries");
        return;
      }
      await loadRates();
      paintMap();
      layoutLabels(k.value);
    });

    return {
      base, pos, date, formattedDate, dateline, maxBack, minDateStr: iso(MIN_DATE), maxDateStr: iso(todayUTC()),
      selectedDate: computed({ get: () => date.value, set: val => date.value = val }),
      sliderPos: computed({ get: () => pos.value, set: val => pos.value = val }),
      playing, mapMode, metalWeight, metalDisplayCur, raceMode, tableFilter, tableSearch, sortCol, sortAsc,
      showRatesPopover, showTimePopover, showMapConfigs, ratesTab, goldUnit, calcAmt, calcAsset, toastMsg, toastBg,
      currencyOptions, goldMetrics, goldBadgeText, filteredAssetCards, quickCalc, sortedRace, filteredTable,
      legendLabels, rightPanelTab, resetMapZoom, setBase, setMapMode, sortTable, onRowClick, selectCalcAsset,
      visualizeGoldOnMap, visualizeFuelOnMap, scrollToMetals, toggleTimePopover, togglePlay, onSliderInput, onSliderChange,
      onDateChange, goToToday, goTo1YAgo, onBaseChange,
      savePNG: () => savePNG(formattedDate.value, date.value),
      copyLink, isFullscreen, toggleFullscreen
    };
  }
};
