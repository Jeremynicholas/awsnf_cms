<!-- DepartureField.vue -->
<template>
  <div class="departures_input">
    <div class="row_one">
      <div style="position: relative;">
        <div class="no_date">
          <small>No date:</small>
          <input type="checkbox" v-model="model.noDate" />
        </div>
        <small>Date:</small>
        <input type="date" v-model="model.date" :disabled="model.noDate"/>
      </div>

      <div>
        <div>
          <small>Date Range or Season</small>
          <input type="text" v-model="model.dateSeason" />
        </div>
      </div>

      <div>
        <small>Location start:</small>
        <input type="text" v-model="model.locationStart" />
      </div>
      
      <div>
        <small>Location end:</small>
        <input type="text" v-model="model.locationEnd" />
      </div>
    </div>

    <div class="row_two">
      <div class="days">
        <small>Days:</small>
        <input type="number" v-model="model.days" min="1" />
      </div>

      <div class="days">
        <small>Nights:</small>
        <input type="number" v-model="model.nights" min="0" />
      </div>

      <div>
        <small>Pricing Per:</small>
        <select v-model="model.pricingPer">
          <option value="pp">Per Person</option>
          <option value="pc">Per Couple</option>
        </select>
      </div>

      <div class="grow">
        <small>Saving Text Before:</small>
        <input type="text" v-model.number="model.savingBefore" />
      </div>

      <div class="grow">
        <small>Saving Text After:</small>
          <input type="text" v-model.number="model.savingAfter" />
      </div>
    </div>

    <div class="departure_items">
      <h3>Pricing details</h3>
      <div v-for="currency in currencies" :key="currency.code" class="currency_block">
        <div>
          <small>{{ currency.code }} pricing</small>
          <input :value="formatPrice(model.pricing[currency.code].cost)"
            @input="updatePrice(currency.code, 'cost', $event.target.value)"/>
        </div>
        <div>
          <small>Single Supplement:</small>
          <input :value="formatPrice(model.pricing[currency.code].singleSupplement)"
            @input="updatePrice(currency.code, 'singleSupplement', $event.target.value)"/>
        </div>

        <div>
          <small>Saving:</small>
          <input :value="formatPrice(model.pricing[currency.code].saving)"
            @input="updatePrice(currency.code, 'saving', $event.target.value)"/>
        </div>
      </div>
    </div>
    <div style="position: relative;">
      <div class="no_date">
        <small>No space left:</small>
        <input type="checkbox" v-model="model.noSpaceLeft" />
      </div>
       <small>Space Left:</small>
      <input type="text" v-model="model.spaceLeft" :disabled="model.noSpaceLeft" />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { formatPrice } from '../../../utils/formatPrice'

// currencies you want to support
const currencies = [
  { code: 'AUD', symbol: '$' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
]


const model = defineModel()

function updatePrice(code, field, val) {
  const numeric = parseFloat(val.toString().replace(/[^\d.]/g, ''))
  model.value.pricing[code][field] = isNaN(numeric) ? 0 : numeric
}

watch(
  () => model.value.noDate,
  (val) => {
    if (val) {
      model.value.date = ''    // ensures no accidental date stored
    }
  }
)

watch(
  () => model,
  (val) => {
    if (!val.pricing) {
      val.pricing = {}
    }
    currencies.forEach(({ code }) => {
      if (!val.pricing[code]) {
        val.pricing[code] = { cost: 0, saving: 0 }
      }
    })
  },
  { deep: true, immediate: true }
)

</script>

<style>

input:disabled {
  opacity: .4;
}

.departures_input {
  position: relative;
  display: grid;
  gap: var(--gap5);

  .row_one {
    display: grid;
    gap: var(--gap5);
    grid-template-columns: auto auto auto auto;

    @media(max-width: 1100px) {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }

    @media(max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .row_two {
    display: grid;
    gap: var(--gap5);
    grid-template-columns: 70px 70px auto auto auto;

    @media(max-width: 1100px) {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }

    @media(max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .departure_items {
    flex: 1;

    .currency_block {
      display: grid;
      gap: var(--gap5);
      grid-template-columns: repeat(3, 1fr);

      @media(max-width: 1100px) {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
    }
  }
}
</style>