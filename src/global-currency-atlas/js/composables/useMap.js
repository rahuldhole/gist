import * as d3 from 'd3';
import { ref } from 'vue';
import { MAP_DIMENSIONS, COLOR_STOPS } from '../config.js';
import { COUNTRIES, fmt, cname } from '../utils.js';

export function useMap(base, rates, mapMode, metalWeight, metalDisplayCur, rateOf, getCountryAssetData, getCountryFuelData, setBase) {
  const k = ref(1);
  const legendLabels = ref({ min: 'High unit value', max: 'High nominal' });

  const heat = d3.interpolateRgbBasis(COLOR_STOPS);

  let feats = [], labelFeats = [], paths, labelSel, svg, root, zoomBehavior;

  const showTip = (e, f) => {
    const c = COUNTRIES[f.id], tip = document.getElementById('tip');
    if (!tip) return;
    const name = c ? `${c.flag} ${c.name}` : f.properties.name;
    let html = `<b>${name}</b>`;

    if (c && mapMode.value === 'fuel') {
      const fuel = f._fuel || (getCountryFuelData ? getCountryFuelData(c.a3, c.cur) : null);
      if (fuel) {
        const tag = fuel.isSubsidized
          ? '<span style="color:#22c55e;background:rgba(34,197,94,0.15);padding:1px 5px;border-radius:4px;font-size:10px;">⚡ State Subsidized</span>'
          : (fuel.isHighTax ? '<span style="color:#f87171;background:rgba(239,68,68,0.15);padding:1px 5px;border-radius:4px;font-size:10px;">🏷️ High Fuel Tax</span>' : '');
        html += `
          <div class="r" style="color:#f59e0b;display:flex;align-items:center;justify-content:space-between;gap:6px;">
            <span>⛽ Retail Gasoline / Petrol</span>
            ${tag}
          </div>
          <div style="margin-top:4px;font-size:12px;line-height:1.4;">
            <div>• Pump Price: <b>$${fuel.priceUsd.toFixed(2)} USD</b> / Liter</div>
            <div>• Local Cost: <b>${fmt(fuel.localPricePerLiter)} ${c.cur}</b> / Liter</div>
            <div>• In ${base.value}: <b>${fmt(fuel.basePricePerLiter)} ${base.value}</b> / Liter</div>
          </div>
          <div class="m" style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px;">
            1 ${base.value} buys <b style="color:#facc15;">${fuel.litersPerBaseUnit.toFixed(2)} Liters</b> of fuel here.
          </div>
        `;
      }
    } else if (c && mapMode.value === 'gold') {
      const a = f._asset || getCountryAssetData(c.cur, 'xau');
      if (a) {
        html += `
          <div class="r" style="color:#facc15;">🏅 24K Pure Gold Rates</div>
          <div style="margin-top:4px;font-size:12px;line-height:1.4;">
            <div>• 1 Gram: <b>${fmt(a.localPricePerGram)} ${c.cur}</b> <span style="color:var(--mut);">(${fmt(a.basePricePerGram)} ${base.value})</span></div>
            <div>• 10 Grams (Tola): <b>${fmt(a.localPricePer10G)} ${c.cur}</b></div>
            <div>• 1 Troy Oz (31.1g): <b>${fmt(a.localPricePerUnit)} ${c.cur}</b></div>
          </div>
          <div class="m" style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px;">
            Purchasing power: 1 ${c.cur} buys <b>${a.mgPerLocalUnit >= 1000 ? (a.mgPerLocalUnit / 1000).toFixed(2) + 'g' : a.mgPerLocalUnit.toFixed(2) + 'mg'}</b> gold.
          </div>
        `;
      }
    } else if (c && mapMode.value === 'silver') {
      const a = f._asset || getCountryAssetData(c.cur, 'xag');
      if (a) {
        html += `
          <div class="r" style="color:#cbd5e1;">🥈 Silver Bullion Rates</div>
          <div style="margin-top:4px;font-size:12px;line-height:1.4;">
            <div>• 1 Gram: <b>${fmt(a.localPricePerGram)} ${c.cur}</b> <span style="color:var(--mut);">(${fmt(a.basePricePerGram)} ${base.value})</span></div>
            <div>• 1 Troy Oz: <b>${fmt(a.localPricePerUnit)} ${c.cur}</b></div>
          </div>
        `;
      }
    } else if (c && f._r != null) {
      html += c.cur === base.value
        ? `<div class="r">Base Currency (1.00)</div>`
        : `<div class="r">1 ${base.value} = ${fmt(f._r)} ${c.cur}</div><div class="m">1 ${c.cur} = ${fmt(1 / f._r)} ${base.value}</div>`;
      html += `<div class="m">${cname(c.cur)}</div>`;
    } else {
      html += `<div class="m">No rate data available</div>`;
    }

    tip.innerHTML = html;
    tip.style.display = 'block';
    const r = document.getElementById('stage').getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 6) + 'px';
    tip.style.top = Math.min(e.clientY - r.top + 14, r.height - tip.offsetHeight - 6) + 'px';
  };

  const layoutLabels = (scale) => {
    if (!labelSel) return;
    const fs = 10 / Math.sqrt(scale), vis = new Set(), boxes = [];
    for (const f of labelFeats) {
      if (f._r == null || f._a * scale * scale < 240) continue;
      const [cx, cy] = f._c, w = fs * 3.9, h = fs * 2.6;
      const b = [cx - w / 2, cy - h * .45, cx + w / 2, cy + h * .55];
      if (boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) continue;
      boxes.push(b);
      vis.add(f.id);
    }
    labelSel.attr('display', f => vis.has(f.id) ? null : 'none').attr('font-size', fs).attr('stroke-width', fs * .22);
  };

  const buildMap = (geo) => {
    feats = geo.features.filter(f => f.id !== 'ATA' && f.id !== '-99');
    const { W, H } = MAP_DIMENSIONS;
    const proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'FeatureCollection', features: feats });
    const path = d3.geoPath(proj);

    feats.forEach(f => {
      let g = f.geometry;
      if (g.type === 'MultiPolygon') {
        let best = null, ba = -1;
        g.coordinates.forEach(c => {
          const p = { type: 'Polygon', coordinates: c };
          const a = d3.geoArea(p);
          if (a > ba) { ba = a; best = p; }
        });
        g = best;
      }
      f._c = path.centroid(g);
      f._a = path.area(g);
    });

    svg = d3.select('#map').attr('font-family', "'Twemoji Country Flags',system-ui,sans-serif");
    root = svg.append('g');

    const landLayer = root.append('g').attr('class', 'land-layer');
    paths = landLayer.selectAll('path').data(feats).join('path')
      .attr('d', path).attr('fill', '#1b2440')
      .style('cursor', 'pointer')
      .on('mousemove', showTip)
      .on('mouseleave', () => {
        const tip = document.getElementById('tip');
        if (tip) tip.style.display = 'none';
      })
      .on('click', (e, f) => {
        const c = COUNTRIES[f.id];
        if (c && f._r != null) setBase(c.cur);
      });

    root.append('g').attr('class', 'borders-layer').attr('pointer-events', 'none')
      .selectAll('path').data(feats).join('path')
      .attr('d', path).attr('fill', 'none')
      .attr('stroke', '#0a0f1e').attr('stroke-width', .55)
      .attr('stroke-linejoin', 'round').attr('vector-effect', 'non-scaling-stroke');

    labelFeats = feats.filter(f => COUNTRIES[f.id]).sort((a, b) => b._a - a._a);
    labelSel = root.append('g').attr('pointer-events', 'none').selectAll('text').data(labelFeats).join('text')
      .attr('transform', f => `translate(${f._c[0]},${f._c[1]})`)
      .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-weight', 700)
      .attr('stroke', 'rgba(8,12,24,.8)').attr('stroke-linejoin', 'round')
      .style('paint-order', 'stroke');
    labelSel.append('tspan').attr('x', 0).attr('font-size', '1.25em').text(f => COUNTRIES[f.id].flag);
    labelSel.append('tspan').attr('class', 'v').attr('x', 0).attr('dy', '1.15em');

    let queued = false;
    zoomBehavior = d3.zoom().scaleExtent([1, 14])
      .extent([[0, 0], [W, H]]).translateExtent([[0, 0], [W, H]])
      .on('zoom', e => {
        root.attr('transform', e.transform);
        k.value = e.transform.k;
        if (!queued) {
          queued = true;
          requestAnimationFrame(() => {
            queued = false;
            layoutLabels(k.value);
          });
        }
      });
    svg.call(zoomBehavior).on('dblclick.zoom', null);
  };

  const paintMap = () => {
    if (!rates.value || !paths) return;
    const isFuel = mapMode.value === 'fuel';
    const isMetal = mapMode.value === 'gold' || mapMode.value === 'silver';
    const assetKey = mapMode.value === 'gold' ? 'xau' : (mapMode.value === 'silver' ? 'xag' : null);
    const vals = [];

    feats.forEach(f => {
      const c = COUNTRIES[f.id];
      if (!c) { f._r = null; f._asset = null; f._fuel = null; return; }
      f._r = rateOf(c.cur);
      if (isFuel) {
        f._fuel = getCountryFuelData ? getCountryFuelData(c.a3, c.cur) : null;
        if (f._fuel && f._fuel.priceUsd > 0) {
          vals.push(f._fuel.priceUsd);
        }
      } else if (isMetal) {
        f._asset = getCountryAssetData(c.cur, assetKey);
        if (f._asset) {
          const v = f._asset.localPricePerGram || f._asset.localPricePerUnit;
          if (v > 0) vals.push(Math.log10(v));
        }
      } else {
        if (f._r != null && c.cur !== base.value) vals.push(Math.log10(f._r));
      }
    });

    const s = vals.sort(d3.ascending);
    const mn = s.length ? s[0] : 0, mx = s.length ? s[s.length - 1] : 1;
    const rank = v => d3.bisectLeft(s, v) / Math.max(1, s.length - 1);

    paths.interrupt().transition().duration(280).attr('fill', f => {
      const c = COUNTRIES[f.id];
      if (!c) return '#1b2440';
      if (isFuel) {
        if (!f._fuel) return '#1b2440';
        const v = f._fuel.priceUsd;
        // Green for cheaper/subsidized gas, red for highly taxed expensive gas
        const t = .5 * rank(v) + .5 * ((v - mn) / ((mx - mn) || 1));
        return heat(Math.max(0, Math.min(1, t)));
      } else if (isMetal) {
        if (!f._asset) return '#1b2440';
        const v = Math.log10(f._asset.localPricePerGram || f._asset.localPricePerUnit);
        const t = .5 * rank(v) + .5 * ((v - mn) / ((mx - mn) || 1));
        return heat(Math.max(0, Math.min(1, t)));
      } else {
        if (f._r == null) return '#1b2440';
        if (c.cur === base.value) return '#38bdf8';
        const v = Math.log10(f._r);
        const t = .5 * rank(v) + .5 * ((v - mn) / ((mx - mn) || 1));
        return heat(Math.max(0, Math.min(1, t)));
      }
    });

    labelSel.select('.v').text(f => {
      const c = COUNTRIES[f.id];
      if (!c) return '';
      if (isFuel) {
        if (!f._fuel) return '';
        if (metalDisplayCur.value === 'local') {
          return fmt(f._fuel.localPricePerLiter);
        } else if (metalDisplayCur.value === 'usd') {
          return `$${f._fuel.priceUsd.toFixed(2)}`;
        } else {
          return `${fmt(f._fuel.basePricePerLiter)}`;
        }
      } else if (isMetal) {
        if (!f._asset) return '';
        if (metalDisplayCur.value === 'local') {
          let val = f._asset.localPricePerGram;
          if (metalWeight.value === '10g') val = f._asset.localPricePer10G;
          else if (metalWeight.value === 'oz') val = f._asset.localPricePerUnit;
          return fmt(val);
        } else {
          return f._asset.mgPerLocalUnit >= 1000
            ? `${(f._asset.mgPerLocalUnit / 1000).toFixed(2)}g`
            : `${fmt(f._asset.mgPerLocalUnit)}mg`;
        }
      } else {
        return f._r == null ? '' : (c.cur === base.value ? '1.00' : fmt(f._r));
      }
    });

    const lMin = isFuel ? mn : 10 ** mn, lMax = isFuel ? mx : 10 ** mx;
    if (mapMode.value === 'fuel') {
      legendLabels.value = { min: `Lowest Pump Price · $${mn.toFixed(2)}/L`, max: `Highest Duty/Price · $${mx.toFixed(2)}/L` };
    } else if (mapMode.value === 'gold') {
      legendLabels.value = { min: `Strongest Gold Value · ${fmt(lMin)}`, max: `High Nominal Units/g · ${fmt(lMax)}` };
    } else if (mapMode.value === 'silver') {
      legendLabels.value = { min: `Strongest Silver Value · ${fmt(lMin)}`, max: `High Nominal Units · ${fmt(lMax)}` };
    } else {
      legendLabels.value = { min: `High unit value · ${fmt(lMin)}`, max: `High nominal · ${fmt(lMax)}` };
    }
  };

  const resetMapZoom = () => {
    if (svg && zoomBehavior) svg.transition().duration(400).call(zoomBehavior.transform, d3.zoomIdentity);
  };

  const savePNG = async (formattedDate, dateVal) => {
    const CW = 1600, CH = 1000, c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    const x = c.getContext('2d');
    const bg = x.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, '#16224a'); bg.addColorStop(1, '#080c18');
    x.fillStyle = bg; x.fillRect(0, 0, CW, CH);

    const clone = svg.node().cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', 1600); clone.setAttribute('height', 800);
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    await img.decode();
    x.drawImage(img, 0, 110, 1600, 800);

    let mapTitle = `What's 1 ${base.value} worth around the world?`;
    let filePrefix = `exchange-heatmap-${base.value.toLowerCase()}`;
    if (mapMode.value === 'fuel') {
      mapTitle = `Global Fuel & Petrol Pump Prices (${metalDisplayCur.value === 'usd' ? 'USD/L' : (metalDisplayCur.value === 'local' ? 'Local/L' : `${base.value}/L`)})`;
      filePrefix = `fuel-prices-${metalDisplayCur.value}`;
    } else if (mapMode.value === 'gold') {
      const wLabel = metalWeight.value === '10g' ? '10g' : (metalWeight.value === 'oz' ? '1 oz' : '1g');
      mapTitle = `World Pure Gold (24K) Rates · ${wLabel} (${metalDisplayCur.value === 'local' ? 'Local' : `In ${base.value}`})`;
      filePrefix = `gold-rates-${metalWeight.value}-${metalDisplayCur.value}`;
    } else if (mapMode.value === 'silver') {
      const wLabel = metalWeight.value === '10g' ? '10g' : (metalWeight.value === 'oz' ? '1 oz' : '1g');
      mapTitle = `World Fine Silver Rates · ${wLabel} (${metalDisplayCur.value === 'local' ? 'Local' : `In ${base.value}`})`;
      filePrefix = `silver-rates-${metalWeight.value}-${metalDisplayCur.value}`;
    }

    x.fillStyle = '#fff'; x.font = '800 46px system-ui,sans-serif'; x.textAlign = 'left';
    x.fillText(mapTitle, 48, 76);
    x.fillStyle = '#8b95b1'; x.font = '500 24px system-ui,sans-serif'; x.textAlign = 'right';
    x.fillText(formattedDate, CW - 48, 72);

    const lg = x.createLinearGradient(300, 0, CW - 300, 0);
    COLOR_STOPS.forEach((col, i) => lg.addColorStop(i / (COLOR_STOPS.length - 1), col));
    x.fillStyle = lg; x.beginPath(); x.roundRect(300, 944, CW - 600, 14, 7); x.fill();
    x.fillStyle = '#8b95b1'; x.font = '500 22px system-ui,sans-serif';
    x.textAlign = 'right'; x.fillText(legendLabels.value.min, 280, 958);
    x.textAlign = 'left'; x.fillText(legendLabels.value.max, CW - 280, 958);

    c.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = `${filePrefix}-${dateVal}.png`;
      a.click();
    });
  };

  return {
    k,
    legendLabels,
    heat,
    buildMap,
    paintMap,
    layoutLabels,
    resetMapZoom,
    savePNG
  };
}
