<template>
  <section id="metals-benchmarks" class="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 mt-1">
    <!-- Header with Live Ticker and Quick Visualizer -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">🪙</span>
        <div>
          <h2 class="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <span>Precious Metals & Reserve Benchmarks</span>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">Sovereign Standard</span>
          </h2>
          <p class="text-[11px] text-slate-400">Physical bullion valuation & purchasing power measured against {{ base }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button @click="$emit('visualize-fuel')" class="text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all cursor-pointer flex items-center gap-1.5">
          <span>⛽</span>
          <span>View Fuel Pump Heatmap</span>
        </button>
        <button @click="$emit('visualize-gold')" class="text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all cursor-pointer flex items-center gap-1.5">
          <span>🏅</span>
          <span>View Gold Heatmap</span>
        </button>
      </div>
    </div>

    <!-- 3-Column Responsive Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <!-- Column 1: Hero Gold Bullion Card -->
      <div class="rounded-2xl p-4 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950/90 shadow-xl flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏅</span>
              <div>
                <div class="text-sm font-black text-white flex items-center gap-1.5">
                  <span>GOLD BULLION</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-full">24K 99.9%</span>
                </div>
                <div class="text-[10px] text-slate-400">XAU Reserve Standard</div>
              </div>
            </div>

            <!-- Weight unit switcher -->
            <div class="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
              <button v-for="u in [ {id:'oz', label:'Oz'}, {id:'g', label:'1g'}, {id:'10g', label:'10g'}, {id:'kg', label:'1kg'} ]"
                      :key="u.id"
                      @click="$emit('update:goldUnit', u.id)"
                      class="text-[10px] font-bold py-0.5 px-2 rounded transition-all cursor-pointer"
                      :class="goldUnit === u.id ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'">
                {{ u.label }}
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-baseline gap-2 flex-wrap">
            <span class="text-2xl sm:text-3xl font-black text-amber-200 tracking-tight tabular-nums">{{ goldMetrics.mainPrice }} {{ base }}</span>
            <span class="text-xs text-slate-400 font-semibold">{{ goldMetrics.unitSuffix }}</span>
          </div>

          <!-- Breakdown pills -->
          <div class="mt-2.5 flex flex-wrap gap-1.5">
            <span class="text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 tabular-nums">1g: <b>{{ goldMetrics.pGram }} {{ base }}</b></span>
            <span class="text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 tabular-nums">10g: <b>{{ goldMetrics.p10g }} {{ base }}</b></span>
            <span class="text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-200 tabular-nums">1kg: <b>{{ goldMetrics.pKg }} {{ base }}</b></span>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 bg-slate-950/60 border border-white/5 rounded-xl p-2.5 leading-snug">
          Purchasing power: 1 <span class="font-bold text-sky-400">{{ base }}</span> buys <b class="text-amber-300">{{ goldMetrics.powerStr }}</b> of 24K pure gold.
        </div>
      </div>

      <!-- Column 2: Other Precious Metals Cards (Silver, Platinum, Palladium) -->
      <div class="flex flex-col gap-2.5">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Physical Noble Metals</span>
          <span class="text-[10px] text-slate-500">Per Troy Oz</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2 flex-1">
          <div v-for="c in filteredAssetCards" :key="c.id"
               @click="$emit('select-asset', c.id)"
               class="bg-slate-950/70 border border-slate-800/90 hover:border-amber-400/50 hover:bg-slate-800/60 rounded-xl p-2.5 flex flex-col justify-between gap-1 cursor-pointer transition-all shadow-sm">
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">{{ c.icon }} {{ c.name }}</span>
              <span class="text-[10px] text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded">{{ c.symbol }}</span>
            </div>
            <div class="flex items-baseline justify-between mt-1">
              <span class="text-sm font-extrabold text-amber-200 tabular-nums">{{ c.priceFormatted }} <span class="text-[10px] text-slate-400 font-normal">{{ base }}</span></span>
              <span class="text-[10px] text-slate-400 tabular-nums">{{ c.sub1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 3: Quick Asset Converter Calculator -->
      <div class="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm">
        <div class="flex flex-col gap-1">
          <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡</span>
            <span>Bullion Value Calculator</span>
          </div>
          <p class="text-[11px] text-slate-400 leading-snug">Calculate exact value of any physical weight in {{ base }}</p>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="flex items-center gap-2">
            <div class="w-24">
              <label class="text-[10px] text-slate-500 font-semibold block mb-0.5">Quantity</label>
              <input type="number"
                     :value="calcAmt"
                     @input="$emit('update:calcAmt', parseFloat($event.target.value) || 0)"
                     min="0" step="any" placeholder="Qty"
                     class="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-900 border border-slate-700 rounded-lg text-white tabular-nums focus:outline-none focus:border-amber-400">
            </div>
            <div class="flex-1">
              <label class="text-[10px] text-slate-500 font-semibold block mb-0.5">Bullion Asset & Weight</label>
              <select :value="calcAsset"
                      @change="$emit('update:calcAsset', $event.target.value)"
                      class="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer">
                <option value="xau_g">Gold (1 Gram)</option>
                <option value="xau_10g">Gold (10 Grams)</option>
                <option value="xau_oz">Gold (1 Troy Oz)</option>
                <option value="xag_oz">Silver (1 Troy Oz)</option>
                <option value="xag_g">Silver (1 Gram)</option>
                <option value="xpt">Platinum (1 Troy Oz)</option>
                <option value="xpd">Palladium (1 Troy Oz)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-between items-center px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <span class="text-slate-300 font-medium">{{ quickCalc.label }} =</span>
            <span class="font-black text-amber-300 text-sm tabular-nums">{{ quickCalc.result }} {{ base }}</span>
          </div>
        </div>

        <div class="text-[10px] text-slate-500 text-right">
          Rates update automatically with base currency
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'MetalsBenchmarks',
  props: {
    base: String,
    goldUnit: String,
    goldMetrics: Object,
    filteredAssetCards: Array,
    calcAmt: Number,
    calcAsset: String,
    quickCalc: Object
  },
  emits: [
    'update:goldUnit', 'update:calcAmt', 'update:calcAsset',
    'visualize-fuel', 'visualize-gold', 'select-asset'
  ]
};
</script>
