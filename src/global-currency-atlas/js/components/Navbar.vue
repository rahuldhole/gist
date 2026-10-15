<template>
  <header class="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-xl px-3 py-1.5 sm:py-2 shadow-lg flex flex-wrap items-center justify-between gap-2 relative z-50">
    <!-- Left: Brand + Dynamic Title inline -->
    <div class="flex items-center gap-2 min-w-0 flex-wrap">
      <div class="flex items-center gap-1.5 flex-none">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-black tracking-wider uppercase text-slate-200">CURRENCY ATLAS</span>
      </div>
      <div class="h-3 w-px bg-slate-700 hidden sm:block"></div>
      <h1 class="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate">
        What's
        <span v-if="mapMode === 'fuel'" class="hl-oil">1 Liter Fuel (Petrol)</span>
        <span v-else-if="mapMode === 'gold'" class="hl-gold">Gold (24K)</span>
        <span v-else-if="mapMode === 'silver'" class="hl-silver">Silver</span>
        <span v-else class="hl">1 {{ base }}</span>
        worth?
      </h1>
      <span class="text-[11px] text-slate-400 hidden md:inline truncate">• {{ formattedDate }}</span>
    </div>

    <!-- Right: Contextual Global Controls -->
    <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap relative z-50 popover-menu-container">
      <!-- Base Currency Pill Dropdown -->
      <div class="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-bold text-white shadow-sm">
        <span class="text-slate-400 text-[11px]">Base:</span>
        <select :value="base" @change="$emit('update:base', $event.target.value); $emit('base-change')" aria-label="Base currency" class="bg-transparent text-white font-black cursor-pointer focus:outline-none">
          <option v-for="cur in currencyOptions" :key="cur.code" :value="cur.code" class="bg-slate-900 text-white">
            {{ cur.code }} · {{ cur.name }}
          </option>
        </select>
      </div>

      <!-- Layer Mode Dropdown in Navbar -->
      <div class="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-bold text-white shadow-sm">
        <span class="text-slate-400 text-[11px]">Layer:</span>
        <select :value="mapMode" @change="$emit('update:mapMode', $event.target.value); $emit('set-map-mode', $event.target.value)" aria-label="Map layer" class="bg-transparent text-white font-black cursor-pointer focus:outline-none">
          <option value="fx" class="bg-slate-900 text-white">🌐 Exchange Rates</option>
          <option value="fuel" class="bg-slate-900 text-white">⛽ Fuel / Petrol</option>
          <option value="gold" class="bg-slate-900 text-white">🏅 Gold (24K)</option>
          <option value="silver" class="bg-slate-900 text-white">🥈 Silver</option>
        </select>
      </div>

      <!-- Time Travel Compact Pill -->
      <button class="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5"
              :class="showTimePopover ? 'bg-sky-950/80 text-sky-400 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.25)]' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-sky-400'"
              @click="$emit('toggle-time-popover')" title="Time travel playback & history">
        <span>⏱️</span>
        <span class="hidden sm:inline">{{ date ? date.slice(0,7) : 'Date' }}</span>
      </button>

      <!-- Time Travel Floating Popover Menu -->
      <div v-if="showTimePopover" class="absolute top-[calc(100%+8px)] right-0 z-[100] w-[min(380px,96vw)] bg-slate-900/95 border border-sky-500/40 backdrop-blur-2xl rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5">
        <div class="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-bold text-slate-100">
          <div class="flex items-center gap-1.5">
            <span>⏱️</span>
            <span>Historical Rates Timelapse</span>
          </div>
          <button @click="$emit('close-time-popover')" class="text-xs px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer">✕</button>
        </div>

        <div class="flex items-center gap-2.5">
          <button @click="$emit('toggle-play')" class="w-8 h-8 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-sm cursor-pointer flex items-center justify-center transition-transform hover:scale-105 shadow-md flex-none">
            {{ playing ? '⏸' : '▶' }}
          </button>
          <input type="range" :value="sliderPos" :min="0" :max="maxBack" @input="$emit('slider-input', $event)" @change="$emit('slider-change', $event)" aria-label="Time travel" class="flex-1 accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer">
        </div>

        <div class="flex justify-between items-center gap-2">
          <input type="date" :value="selectedDate" :min="minDateStr" :max="maxDateStr" @change="$emit('date-change', $event)" class="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white">
          <div class="flex gap-1">
            <button @click="$emit('go-to-today')" class="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer">Today</button>
            <button @click="$emit('go-to-1y-ago')" class="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 cursor-pointer">1Y Ago</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    base: String,
    mapMode: String,
    formattedDate: String,
    date: String,
    currencyOptions: Array,
    showTimePopover: Boolean,
    playing: Boolean,
    sliderPos: Number,
    maxBack: Number,
    selectedDate: String,
    minDateStr: String,
    maxDateStr: String
  },
  emits: [
    'update:base', 'update:mapMode', 'base-change', 'set-map-mode',
    'toggle-time-popover', 'close-time-popover', 'toggle-play',
    'slider-input', 'slider-change', 'date-change', 'go-to-today', 'go-to-1y-ago'
  ]
};
</script>
