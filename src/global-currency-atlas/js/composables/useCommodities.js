import { ref, computed } from 'vue';
import { COMMODITIES, ALT_CURRENCIES, FUEL_PRICES_USD, GLOBAL_MEDIAN_FUEL_USD } from '../config.js';
import { fmt } from '../utils.js';

export function useCommodities(rates, base, rateOf) {
  const goldUnit = ref('oz');
  const calcAmt = ref(1);
  const calcAsset = ref('xau_oz');
  const ratesTab = ref('all');

  const getCountryFuelData = (countryA3, curCode) => {
    if (!rates.value) return null;
    const r = rates.value;
    const f = c => r[c.toLowerCase()] ?? r[(ALT_CURRENCIES[c] || '').toLowerCase()];
    const localPerUsd = f(curCode) || 1;
    const basePerUsd = f(base.value) || 1;

    // Local pump price benchmark in USD per liter
    const priceUsd = FUEL_PRICES_USD[countryA3] ?? GLOBAL_MEDIAN_FUEL_USD;
    // Price in local currency per liter
    const localPricePerLiter = priceUsd * localPerUsd;
    // Price in currently selected base currency per liter
    const basePricePerLiter = priceUsd * basePerUsd;
    // How many liters 1 base unit buys in this country
    const litersPerBaseUnit = basePricePerLiter > 0 ? (1 / basePricePerLiter) : 0;
    // How many liters 1 local currency unit buys
    const litersPerLocalUnit = localPricePerLiter > 0 ? (1 / localPricePerLiter) : 0;

    return {
      priceUsd,
      localPricePerLiter,
      basePricePerLiter,
      litersPerBaseUnit,
      litersPerLocalUnit,
      isSubsidized: priceUsd < 0.60,
      isHighTax: priceUsd > 1.70
    };
  };

  const getCountryAssetData = (curCode, assetId = 'xau') => {
    if (!rates.value) return null;
    const r = rates.value;
    const f = c => r[c.toLowerCase()] ?? r[(ALT_CURRENCIES[c] || '').toLowerCase()];
    const localPerUsd = f(curCode);
    const assetPerUsd = f(assetId);
    if (!localPerUsd || !assetPerUsd) return null;

    const localPricePerUnit = localPerUsd / assetPerUsd;
    const basePerUsd = f(base.value) || 1;
    const basePricePerUnit = basePerUsd / assetPerUsd;
    const isMetal = (assetId === 'xau' || assetId === 'xag' || assetId === 'xpt' || assetId === 'xpd');
    const gramsPerUnit = isMetal ? 31.1034768 : 1;
    const localPricePerGram = localPricePerUnit / gramsPerUnit;
    const localPricePer10G = localPricePerGram * 10;
    const basePricePerGram = basePricePerUnit / gramsPerUnit;
    const basePricePer10G = basePricePerGram * 10;
    const assetUnitsPerLocalUnit = assetPerUsd / localPerUsd;
    const mgPerLocalUnit = assetUnitsPerLocalUnit * gramsPerUnit * 1000;
    const satsPerLocalUnit = assetId === 'btc' ? Math.round(assetUnitsPerLocalUnit * 100000000) : 0;

    return {
      localPricePerUnit,
      localPricePerGram,
      localPricePer10G,
      basePricePerUnit,
      basePricePerGram,
      basePricePer10G,
      assetUnitsPerLocalUnit,
      mgPerLocalUnit,
      satsPerLocalUnit,
      gramsPerUnit,
      isMetal
    };
  };

  const goldMetrics = computed(() => {
    const gRate = rateOf('xau');
    if (!gRate) {
      return {
        pOz: '---',
        pGram: '---',
        p10g: '---',
        pKg: '---',
        mainPrice: '---',
        unitSuffix: '/ troy oz',
        powerStr: '---',
        hundredPower: '---'
      };
    }
    const pOz = 1 / gRate;
    const pGram = pOz / 31.1034768;
    const p10g = pGram * 10;
    const pKg = pGram * 1000;

    let main = pOz, suffix = '/ troy oz (31.10g)';
    if (goldUnit.value === 'g') {
      main = pGram;
      suffix = '/ gram (24K)';
    } else if (goldUnit.value === '10g') {
      main = p10g;
      suffix = '/ 10 grams (Tola)';
    } else if (goldUnit.value === 'kg') {
      main = pKg;
      suffix = '/ kilogram (1,000g)';
    }

    const mgPerBase = gRate * 31103.4768;
    const powerStr = mgPerBase >= 1000 ? `${(mgPerBase / 1000).toFixed(3)} g` : `${mgPerBase.toFixed(2)} mg`;
    const hundredPower = (mgPerBase * 100) >= 1000 ? `${((mgPerBase * 100) / 1000).toFixed(2)} g` : `${(mgPerBase * 100).toFixed(1)} mg`;

    return {
      pOz: fmt(pOz),
      pGram: fmt(pGram),
      p10g: fmt(p10g),
      pKg: fmt(pKg),
      mainPrice: fmt(main),
      unitSuffix: suffix,
      powerStr,
      hundredPower
    };
  });

  const goldBadgeText = computed(() => {
    const gRate = rateOf('xau');
    if (!gRate) return '---';
    const pOz = 1 / gRate;
    const pGram = pOz / 31.1034768;
    const p10g = pGram * 10;
    if (goldUnit.value === 'g') return `${fmt(pGram)}/g`;
    if (goldUnit.value === '10g') return `${fmt(p10g)}/10g`;
    return `${fmt(pOz)}/oz`;
  });

  const filteredAssetCards = computed(() => {
    return COMMODITIES.filter(c => {
      if (c.id === 'xau') return false;
      if (ratesTab.value === 'metal') return c.category === 'metal';
      if (ratesTab.value === 'crypto') return c.category === 'crypto';
      return true;
    }).map(c => {
      const r = rateOf(c.id);
      if (!r) return null;
      const price = 1 / r;
      let sub1 = '', sub2 = '';
      if (c.category === 'metal') {
        sub1 = `1g: ${fmt(price / c.unitGrams)}`;
        sub2 = `1 ${base.value} = ${(r * c.unitGrams).toFixed(2)}g`;
      } else if (c.id === 'btc') {
        sub1 = `1 ${base.value} = ${Math.round(r * 100000000).toLocaleString()} sats`;
        sub2 = `21M Cap`;
      } else {
        sub1 = `1 ${base.value} = ${fmt(r)} ${c.symbol}`;
        sub2 = `Benchmark`;
      }
      return { ...c, priceFormatted: fmt(price), sub1, sub2 };
    }).filter(Boolean);
  });

  const quickCalc = computed(() => {
    const amt = parseFloat(calcAmt.value) || 0;
    const sel = calcAsset.value;
    const goldOz = 1 / (rateOf('xau') || 1);
    const silverOz = 1 / (rateOf('xag') || 1);
    let unitCost = 0, label = '';

    switch (sel) {
      case 'xau_g': unitCost = goldOz / 31.1034768; label = `${amt} g Gold (24K)`; break;
      case 'xau_10g': unitCost = (goldOz / 31.1034768) * 10; label = `${amt * 10} g Gold (Tola)`; break;
      case 'xau_oz': unitCost = goldOz; label = `${amt} Troy Oz Gold`; break;
      case 'xag_oz': unitCost = silverOz; label = `${amt} Troy Oz Silver`; break;
      case 'xag_g': unitCost = silverOz / 31.1034768; label = `${amt} g Silver`; break;
      case 'xpt': unitCost = 1 / (rateOf('xpt') || 1); label = `${amt} Oz Platinum`; break;
      case 'xpd': unitCost = 1 / (rateOf('xpd') || 1); label = `${amt} Oz Palladium`; break;
      case 'btc': unitCost = 1 / (rateOf('btc') || 1); label = `${amt} Bitcoin`; break;
      case 'eth': unitCost = 1 / (rateOf('eth') || 1); label = `${amt} Ethereum`; break;
      case 'sol': unitCost = 1 / (rateOf('sol') || 1); label = `${amt} Solana`; break;
      default: unitCost = goldOz; label = `${amt} Gold`;
    }
    return { label, result: fmt(amt * unitCost) };
  });

  const selectCalcAsset = (id) => {
    if (id === 'xau') calcAsset.value = 'xau_oz';
    else if (id === 'xag') calcAsset.value = 'xag_oz';
    else calcAsset.value = id;
  };

  return {
    goldUnit,
    calcAmt,
    calcAsset,
    ratesTab,
    goldMetrics,
    goldBadgeText,
    filteredAssetCards,
    quickCalc,
    getCountryAssetData,
    getCountryFuelData,
    selectCalcAsset
  };
}
