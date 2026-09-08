<template>
  <div v-if="postData">        
    
    <h3 v-if="groupTour">Group Details</h3>
    <div v-if="groupTour" class="two_columns">
      <div>
        <small>Group Size</small>
        <div class="items_double">
          <div class="items">
          <p>Min {{ postData.groupSizeMin }}</p>
          <div class="icons"
            @click="emitEditRequest({
              title: 'Edit groupSizeMin',
              inputType: 'number',
              value: postData.groupSizeMin,
              field: 'groupSizeMin',
              index: null
              })">
            <i class="fas fa-edit"></i>
          </div>
          </div>
          <div class="items">
            <p>Max {{ postData.groupSizeMax }}</p>
            <div class="icons"
              @click="emitEditRequest({
                title: 'Edit groupSize',
                inputType: 'number',
                value: postData.groupSizeMax,
                field: 'groupSizeMax',
                index: null
                })">
              <i class="fas fa-edit"></i>
            </div>
          </div>
        </div>
      </div>

      <div>
        <small>Tour Escort</small>
        <div class="items">
          <p>{{ StaffBioName }}</p>
          <div class="icons"
            @click="emitEditRequest({
              title: 'Edit tour escort',
              inputType: 'staffBios',
              field: 'staffBios',
              value: postData.staffBios,
              index: null
              })">
            <i class="fas fa-edit"></i>
          </div>
        </div>
      </div>
      
    </div>
        
    


  <div class="items_multiple" style="position: relative; margin-block: 20px;">
    <h3>Departure Details</h3>
    
    <div class="flex">
      <small>{{ postData.hideDepartures ? 'No Departures' : 'Departure dates & length' }}</small>
      <div class="no_departures">
        <small>{{ postData.hideDepartures ? 'No Departures' : 'No Departures?' }}</small>
        <input type="checkbox" v-model="hideDeparturesModel" />
      </div>
    </div>

    <div v-if="!postData.hideDepartures">

      <div v-for="(departure, index) in postData.departures"
        :key="index"
        class="items">
        
        <div class="departures">
          <div>
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDateVerbose(departure.date)}}</span>
            <span>ex {{ departure.locationStart }}</span>
          </div>
          <div class="hyphen">
            <span>-</span>
          </div>
          <div>
            <span>{{ departure.days }} days/{{ departure.nights }} nights</span>
          </div>

          <div class="hyphen">
            <span>-</span>
          </div>

          <div>
            <span v-if="departure.dateSeason">{{ departure.dateSeason }} Pricing</span>
          </div>
          
          <div class="hyphen">
            <span>-</span>
          </div>
          
          <div class="departure_items">
              <div v-for="([currency, data]) in Object.entries(departure.pricing)" :key="currency">
                <span>
                  {{ currency }} ${{ formatPrice(data.cost) }} /{{ departure.pricingPer }}     
                </span>
              </div>
          </div>
          
          <div class="hyphen">
            <span>-</span>
          </div>

          <div class="departure_items">
              <div v-for="([currency, data]) in Object.entries(departure.pricing)" :key="currency">
                <span v-if="data.saving && data.saving > 0">
                  {{ departure.savingBefore }} ${{ formatPrice(data.saving) }} <span v-if="departure.savingAfter">{{ departure.savingAfter }}</span>
                </span>
              </div>
          </div>

          <div class="hyphen">
            <span>-</span>
          </div>

          <div>
            <span v-if="departure.noSpaceLeft">Departure Now Full</span>
            <span v-else="departure.spaceLeft">{{ departure.spaceLeft }}</span>
          </div>

        </div>
        
        <div class="icons"
          @click="emitEditRequest({
            title: `Edit departure #${index + 1}`,
            inputType: 'departures',
            field: 'departures',
            value: departure,
            index,
          })">
          <i class="fas fa-edit"></i>
        </div>
      </div>
      <div class="items">
        <p v-if="!postData.departures || postData.departures.length === 0" class="text-muted">No departures yet</p>
        <p v-else class="text-muted">Add another departure</p>
        <div class="icons"
          @click="emitEditRequest({
            title: 'New departure',
            inputType: 'departures',
            field: 'departures',
            value: {
              date: '',
              noDate: false,
              dateSeason: '',
              locationStart: '',
              locationEnd: '',
              days: 0,
              nights: 0,
              pricingPer: 'pp',
              pricing: {
                AUD: { cost: 0, singleSupplement: 0, saving: 0, savingAfter: '' },
                USD: { cost: 0, singleSupplement: 0, saving: 0, savingAfter: '' },
                EUR: { cost: 0, singleSupplement: 0, saving: 0, savingAfter: '' },
              },
              savingBefore: '',
              savingAfter: '',
            },
            index: -1,
          })">
          <i class="fas fa-plus-circle"></i>
        </div>
      </div>
    </div>
  </div>

    <div v-if="specialOffer">
      <div>
        <small>Saving Text General</small>
        <div class="items">
          <p>{{ postData.savingTextGeneral }}</p>
          <div class="icons"
            @click="emitEditRequest({
              title: 'Edit saving text general',
              inputType: 'text',
              field: 'savingTextGeneral',
              value: postData.savingTextGeneral,
              index: null
              })">
            <i class="fas fa-edit"></i>
          </div>
        </div>
      </div>
      
    </div>

    <small>Conditions Short</small>
      <div class="items">
        <p>{{ postData.conditionsShort }}</p>
        <div class="icons"
          @click="emitEditRequest({
            title: 'Edit conditionsShort',
            inputType: 'text',
            value: postData.conditionsShort,
            field: 'conditionsShort',
            index: null
            })">
          <i class="fas fa-edit"></i>
        </div>
      </div>

    <small>Conditions Long</small>
      <div class="items">
        <p>{{ postData.conditionsLong }}</p>
        <div class="icons"
          @click="emitEditRequest({
            title: 'Edit conditionsLong',
            inputType: 'text',
            value: postData.conditionsLong,
            field: 'conditionsLong',
            index: null
            })">
          <i class="fas fa-edit"></i>
        </div>
      </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatPrice } from '../../../../utils/formatPrice';
import { formatDateVerbose } from '../../../../utils/formatDateVerbose';
import { useLookupStore } from '../../../../store/lookups';

const props = defineProps({
 postData: Object
});

const emit = defineEmits(['edit-request', 'field-update']);

function emitEditRequest({ field, value, inputType, title, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, index });
}

// LOOKUPS - GETTING THERE
const lookupStore = useLookupStore()

const StaffBioName = computed(() => {
  const id = props.postData?.staffBios
  if (!id) return ''
  return lookupStore.lookupMaps.staffBios?.[id]?.name || 'Unknown'
})

const hideDeparturesModel = computed({
  get: () => props.postData?.hideDepartures ?? false,
  set: (val) => {
    emit('field-update', { field: 'hideDepartures', value: val });
  }
});

const groupTour = computed(() => props.postData.groupTour === true)
const specialOffer = computed(() => props.postData.specialOffer === true)

</script>

<style>
.no_date, .no_departures {
  position: absolute;
  right: 0;
  display: flex;
  gap: var(--gap5);
  white-space: nowrap;
}
</style>