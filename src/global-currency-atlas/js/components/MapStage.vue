<template>
  <div class="flex flex-col gap-2.5">
    <!-- Integrated Heat Legend Bar (Above Map) -->
    <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800/70 rounded-xl px-3.5 py-2 grid grid-cols-[auto_1fr_auto] gap-3 items-center text-[11px] text-slate-400 shadow-sm">
      <span class="font-semibold text-slate-300 truncate max-w-[170px] sm:max-w-none">{{ legendLabels.min }}</span>
      <div class="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-400 to-red-500 shadow-[0_0_10px_rgba(250,204,21,0.2)]"></div>
      <span class="font-semibold text-slate-300 truncate max-w-[170px] sm:max-w-none">{{ legendLabels.max }}</span>
    </div>

    <!-- Interactive Map Stage Card -->
    <div class="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 shadow-2xl backdrop-blur-sm group/stage" id="stage">
      <svg id="map" viewBox="0 0 1000 500"></svg>
      <div id="tip"></div>
      <div id="msg" v-if="toastMsg" class="absolute left-1/2 top-3 -translate-x-1/2 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xl z-30" :style="{background: toastBg}">
        {{ toastMsg }}
      </div>

      <!-- Sleek Floating Vertical Icon Dock Inside Map Stage (Top-Right) -->
      <div class="absolute top-3 right-3 z-20 flex flex-col items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl">
        <!-- Reset Zoom -->
        <div class="relative group/btn flex items-center">
          <button @click="$emit('reset-zoom')" title="Reset Zoom" class="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
            <span>⟲</span>
          </button>
          <span class="absolute right-full mr-2 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-[10px] font-semibold text-slate-200 whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity">
            Reset Zoom
          </span>
        </div>

        <!-- Save PNG -->
        <div class="relative group/btn flex items-center">
          <button @click="$emit('save-png')" title="Save Image" class="w-7 h-7 flex items-center justify-center text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer">
            <span>📸</span>
          </button>
          <span class="absolute right-full mr-2 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-[10px] font-semibold text-slate-200 whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity">
            Save Image
          </span>
        </div>

        <!-- Share Link -->
        <div class="relative group/btn flex items-center">
          <button @click="$emit('copy-link')" title="Share Link" class="w-7 h-7 flex items-center justify-center text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
            <span>🔗</span>
          </button>
          <span class="absolute right-full mr-2 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-[10px] font-semibold text-slate-200 whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity">
            Share Link
          </span>
        </div>

        <div class="w-4 h-px bg-slate-700/70 my-0.5"></div>

        <!-- Fullscreen Toggle -->
        <div class="relative group/btn flex items-center">
          <button @click="$emit('toggle-fullscreen')" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'" class="w-7 h-7 flex items-center justify-center text-xs text-sky-300 hover:text-white hover:bg-sky-500/10 rounded-lg transition-all cursor-pointer">
            <svg v-if="!isFullscreen" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span class="absolute right-full mr-2 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-[10px] font-semibold text-slate-200 whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity">
            {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
          </span>
        </div>
      </div>

      <!-- Floating Bottom-Left Contextual Config Drawer Inside Map Stage -->
      <div v-if="mapMode !== 'fx'" class="absolute bottom-3 left-3 z-20 flex flex-col gap-1 items-start">
        <!-- Toggle reveal button for small screens -->
        <button @click="$emit('toggle-map-configs')"
                class="sm:hidden text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center gap-1 cursor-pointer">
          <span>⚙️</span>
          <span>{{ showMapConfigs ? 'Hide Options' : 'Unit Options' }}</span>
        </button>

        <!-- Drawer Body -->
        <div v-show="showMapConfigs" class="flex items-center gap-1.5 flex-wrap bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl">
          <!-- Physical metals: Gold & Silver -->
          <template v-if="mapMode === 'gold' || mapMode === 'silver'">
            <div class="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button v-for="w in [ {id:'g', label:'1g'}, {id:'10g', label:'10g'}, {id:'oz', label:'1 Oz'} ]"
                      :key="w.id"
                      @click="$emit('update:metalWeight', w.id)"
                      class="px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer"
                      :class="metalWeight === w.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'">
                {{ w.label }}
              </button>
            </div>

            <div class="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button @click="$emit('update:metalDisplayCur', 'base')"
                      class="px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer"
                      :class="metalDisplayCur === 'base' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'">
                In {{ base }}
              </button>
              <button @click="$emit('update:metalDisplayCur', 'local')"
                      class="px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer"
                      :class="metalDisplayCur === 'local' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'">
                Local
              </button>
            </div>
          </template>

          <!-- Fuel Mode: Base Currency vs Local Currency vs USD -->
          <template v-else-if="mapMode === 'fuel'">
            <div class="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button @click="$emit('update:metalDisplayCur', 'base')"
                      class="px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                      :class="metalDisplayCur === 'base' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'">
                In {{ base }} / L
              </button>
              <button @click="$emit('update:metalDisplayCur', 'usd')"
                      class="px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                      :class="metalDisplayCur === 'usd' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'">
                $ USD / Liter
              </button>
              <button @click="$emit('update:metalDisplayCur', 'local')"
                      class="px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                      :class="metalDisplayCur === 'local' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'">
                Local / Liter
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapStage',
  props: {
    base: String,
    mapMode: String,
    metalWeight: String,
    metalDisplayCur: String,
    legendLabels: Object,
    toastMsg: String,
    toastBg: String,
    isFullscreen: Boolean,
    showMapConfigs: Boolean
  },
  emits: [
    'reset-zoom', 'save-png', 'copy-link', 'toggle-fullscreen',
    'toggle-map-configs', 'update:metalWeight', 'update:metalDisplayCur'
  ]
};
</script>
