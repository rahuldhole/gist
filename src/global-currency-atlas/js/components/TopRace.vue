<template>
  <div class="flex flex-col gap-2.5">
    <div class="flex items-center justify-between gap-1">
      <span class="text-[11px] text-slate-400 font-medium">Ranked relative to 1 {{ base }}</span>
      <div class="flex gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800">
        <button @click="$emit('update:raceMode', 'strong')"
                class="text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                :class="raceMode === 'strong' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'">
          Highest Value
        </button>
        <button @click="$emit('update:raceMode', 'nominal')"
                class="text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                :class="raceMode === 'nominal' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'">
          Most Units
        </button>
      </div>
    </div>

    <!-- Animated Bar Rows Container -->
    <div class="race-stage max-h-[510px]">
      <div v-for="(item, idx) in sortedRace" :key="item.cur"
           class="race-row"
           :style="{ transform: `translateY(${idx * 42}px)` }">
        <span class="w-[20px] text-xs font-black text-right tabular-nums"
              :class="idx < 3 ? 'text-amber-300' : 'text-slate-400'">
          #{{ idx + 1 }}
        </span>
        <span class="text-base leading-none flex-none">{{ item.flag }}</span>
        <div @click="$emit('set-base', item.cur)" :title="'Click to make ' + item.cur + ' base'" class="race-track flex-1 h-7 bg-white/[0.04] rounded-lg relative overflow-hidden flex items-center border border-white/[0.06] cursor-pointer">
          <div class="absolute left-0 top-0 bottom-0 rounded-lg transition-all duration-350 opacity-90"
               :style="{ width: item.barPct + '%', background: item.barColor }"></div>
          <div class="relative z-10 pl-2 text-xs font-bold text-white flex items-center gap-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <span>{{ item.cur }}</span>
            <span class="text-[10px] opacity-75 font-medium truncate max-w-[90px]">{{ item.name }}</span>
          </div>
          <div class="ml-auto relative z-10 pr-2 text-xs font-black tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {{ item.valDisplay }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopRace',
  props: {
    base: String,
    raceMode: String,
    sortedRace: Array
  },
  emits: ['update:raceMode', 'set-base']
};
</script>
