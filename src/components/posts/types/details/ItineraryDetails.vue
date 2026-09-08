<!-- ItineraryDetails.vue -->
<template>
    <div>
        <h3>Itinerary</h3>
        <div>
            <button
                @click="emitEditRequest({
                field: 'itinerary',
                value: { day: '', location: '', description: '' },
                inputType: 'itineraries',
                index: -1,
                title: 'Add New Day'
                })">Add New Day
            </button>
            
            <div class="itinerary_days grid_inputs" v-for="(day, index) in itineraryCollection" :key="day.id">
            <div class="items">
                <div>
                <p><strong>{{ day.day }}</strong></p>
                <p>{{ day.location }}</p>
                <p>{{ day.description }}</p>
                </div>
                <div class="icons"
                    @click="emitEditRequest({
                    field: 'itinerary',
                    value: day,
                    inputType: 'itineraries',
                    index,
                    title: `Edit ${day.day}`
                    })">
                <i class="fas fa-edit"></i>
                </div>
            </div>
            </div>     
            
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    itineraryCollection: Array
});

const emit = defineEmits(['edit-request']);

function emitEditRequest({ field, value, inputType, title, index = null }) {
  emit('edit-request', { field, value, inputType, title: title, index });
}

</script>