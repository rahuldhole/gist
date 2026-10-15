<template>
  <div id="app" class="w-full max-w-[1600px] flex flex-col gap-2.5" v-cloak>

    <!-- Ultra-Compact Streamlined Navigation Bar -->
    <Navbar
      v-model:base="base"
      v-model:mapMode="mapMode"
      :formatted-date="formattedDate"
      :date="date"
      :currency-options="currencyOptions"
      :show-time-popover="showTimePopover"
      :playing="playing"
      :slider-pos="sliderPos"
      :max-back="maxBack"
      :selected-date="selectedDate"
      :min-date-str="minDateStr"
      :max-date-str="maxDateStr"
      @base-change="onBaseChange"
      @set-map-mode="setMapMode"
      @toggle-time-popover="toggleTimePopover"
      @close-time-popover="showTimePopover = false"
      @toggle-play="togglePlay"
      @slider-input="onSliderInput"
      @slider-change="onSliderChange"
      @date-change="onDateChange"
      @go-to-today="goToToday"
      @go-to-1y-ago="goTo1YAgo"
    />

    <!-- Main 65% / 35% Side-By-Side Executive Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-100 gap-3.5 items-start">

      <!-- Left 65% Section: Interactive Map Stage -->
      <div class="lg:col-span-65">
        <MapStage
          :base="base"
          :map-mode="mapMode"
          v-model:metal-weight="metalWeight"
          v-model:metal-display-cur="metalDisplayCur"
          :legend-labels="legendLabels"
          :toast-msg="toastMsg"
          :toast-bg="toastBg"
          :is-fullscreen="isFullscreen"
          :show-map-configs="showMapConfigs"
          @reset-zoom="resetMapZoom"
          @save-png="savePNG"
          @copy-link="copyLink"
          @toggle-fullscreen="toggleFullscreen"
          @toggle-map-configs="showMapConfigs = !showMapConfigs"
        />
      </div>

      <!-- Right 35% Section: Contextual Tabbed Intelligence Panels -->
      <div class="lg:col-span-35 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col gap-3">
        <!-- Segmented View Switcher Tabs -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
          <div class="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 flex-1">
            <button @click="rightPanelTab = 'ledger'"
                    class="flex-1 text-xs font-bold py-1 px-2 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    :class="rightPanelTab === 'ledger' ? 'bg-slate-800 text-sky-400 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'">
              <span>📊</span>
              <span>Ledger</span>
              <span class="text-[10px] text-slate-500 bg-white/5 px-1 rounded">{{ filteredTable.length }}</span>
            </button>
            <button @click="rightPanelTab = 'race'"
                    class="flex-1 text-xs font-bold py-1 px-2 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    :class="rightPanelTab === 'race' ? 'bg-slate-800 text-amber-300 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'">
              <span>🏁</span>
              <span>Top 10 Race</span>
            </button>
          </div>
        </div>

        <!-- TAB 1: World Currency Ledger Table -->
        <LedgerTable
          v-show="rightPanelTab === 'ledger'"
          :base="base"
          :filtered-table="filteredTable"
          v-model:table-filter="tableFilter"
          v-model:table-search="tableSearch"
          :sort-col="sortCol"
          :sort-asc="sortAsc"
          @sort-table="sortTable"
          @row-click="onRowClick"
        />

        <!-- TAB 2: Top 10 Currency Race -->
        <TopRace
          v-show="rightPanelTab === 'race'"
          :base="base"
          v-model:race-mode="raceMode"
          :sorted-race="sortedRace"
          @set-base="setBase"
        />
      </div>

    </div>

    <!-- Permanent Bottom Executive Section -->
    <MetalsBenchmarks
      :base="base"
      v-model:gold-unit="goldUnit"
      :gold-metrics="goldMetrics"
      :filtered-asset-cards="filteredAssetCards"
      v-model:calc-amt="calcAmt"
      v-model:calc-asset="calcAsset"
      :quick-calc="quickCalc"
      @visualize-fuel="visualizeFuelOnMap"
      @visualize-gold="visualizeGoldOnMap"
      @select-asset="selectCalcAsset"
    />

  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import MapStage from './components/MapStage.vue';
import LedgerTable from './components/LedgerTable.vue';
import TopRace from './components/TopRace.vue';
import MetalsBenchmarks from './components/MetalsBenchmarks.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    MapStage,
    LedgerTable,
    TopRace,
    MetalsBenchmarks
  },
  setup(props, { attrs }) {
    // AppLogic is supplied cleanly through root context
    const logic = window.__APP_LOGIC__;
    return logic ? logic.setup() : {};
  }
};
</script>
