<template>
  <div class="flex flex-col gap-2.5">
    <!-- Sub-controls: Table Filter + Live Search -->
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800">
        <button @click="$emit('update:tableFilter', 'all')"
                class="text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                :class="tableFilter === 'all' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'">
          All FX
        </button>
        <button @click="$emit('update:tableFilter', 'commodities')"
                class="text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                :class="tableFilter === 'commodities' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'">
          🪙 Metals & Assets
        </button>
      </div>

      <div class="relative flex-1 min-w-[130px]">
        <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] pointer-events-none">🔍</span>
        <input type="text"
               :value="tableSearch"
               @input="$emit('update:tableSearch', $event.target.value)"
               placeholder="Filter..."
               class="w-full bg-slate-950/90 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors">
      </div>
    </div>

    <!-- Scrollable Table Container -->
    <div class="max-h-[510px] overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/50">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-10">
          <tr>
            <th @click="$emit('sort-table', 'country')" class="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
              Market {{ sortCol === 'country' ? (sortAsc ? '▲' : '▼') : '' }}
            </th>
            <th @click="$emit('sort-table', 'rate')" class="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors text-right">
              Rate {{ sortCol === 'rate' ? (sortAsc ? '▲' : '▼') : '' }}
            </th>
            <th @click="$emit('sort-table', 'inverse')" class="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors text-right hidden sm:table-cell">
              Inverse
            </th>
            <th class="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Tier
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <tr v-for="c in filteredTable" :key="c.cur"
              @click="$emit('row-click', c)"
              :class="{'selected-row': c.cur === base}">
            <td class="p-2">
              <div class="flex items-center gap-1.5 font-semibold">
                <span class="text-sm">{{ c.flag }}</span>
                <div class="truncate max-w-[120px] sm:max-w-[150px]">
                  <div class="text-white text-xs truncate">{{ c.name }}</div>
                  <div class="text-[10px] text-slate-500 truncate">{{ c.cur }}</div>
                </div>
              </div>
            </td>
            <td class="p-2 font-bold tabular-nums text-right text-xs"
                :style="{ color: c.cur === base ? '#38bdf8' : (c.isCommodity ? '#fef08a' : '#f1f5f9') }">
              {{ c.rateText }}
            </td>
            <td class="p-2 text-slate-400 tabular-nums text-right text-[11px] hidden sm:table-cell">
              {{ c.invText }}
            </td>
            <td class="p-2 text-center">
              <span class="inline-block w-2.5 h-2.5 rounded-full" :style="{ background: c.tierColor, boxShadow: '0 0 5px ' + c.tierColor }"></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LedgerTable',
  props: {
    base: String,
    filteredTable: Array,
    tableFilter: String,
    tableSearch: String,
    sortCol: String,
    sortAsc: Boolean
  },
  emits: ['update:tableFilter', 'update:tableSearch', 'sort-table', 'row-click']
};
</script>
