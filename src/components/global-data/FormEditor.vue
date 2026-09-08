<!--FORM COLLECTION EDITOR-->
<template>
    <div class="global_editor">
      <div class="form_grid">
        <div class="form_grid_header">
          <h2>Edit {{ title }} Form</h2>
          <span class="status_button clickable" :class="{ 'published': published, 'draft': !published }"
            @click="togglePublished()">
            {{ published ? 'Published' : 'Draft' }} 
          </span>
        </div>
           
        <!-- PAGE TABS -->
        <div class="global_tabs">
          <button
            v-for="(page, i) in pages"
            :key="i"
            :class="{ active: activePage === i }"
            @click="activePage = i"
          >
            {{ page.title || `Page ${i + 1}` }}
          </button>
          <button @click="addPage" class="add_page">+ Add Page</button>
        </div>

      <!-- FIELDS for current page -->
      <div v-if="pages[activePage]" class="page_editor">
        <input
          v-model="pages[activePage].title"
          placeholder="Page title (e.g. Personal Info)"
          class="page_title_input"
        />

        <draggable
          class="grid_inputs"
          v-model="pages[activePage].fields"
          item-key="_id"
          handle=".drag-handle"
          @end="enforceUniqueKeysNow"
        >
          <template #item="{ element: field, index }">
            <div class="grid_inputs form_inputs">
              <div>
                <span class="drag-handle">⠿</span>
              </div>

              <div>
                <input
                  v-model="field.label"
                  placeholder="Label (e.g. First Name)"
                />
                <select v-model="field.type">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="address">Address</option>
                  <option value="textarea">Textarea</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="radio">Radio</option>
                  <option value="select">Dropdown</option>
                </select>

                <!-- Options editor (only visible for select, radio, checkbox) -->
                  <div v-if="['select', 'radio', 'checkbox'].includes(field.type)" class="options_editor">
                    <label>Options</label>
                    <div v-for="(opt, optIndex) in field.options || []" :key="optIndex" class="option_row">
                      <input v-model="field.options[optIndex]" placeholder="Enter option value" />
                      <button @click.prevent="field.options.splice(optIndex, 1)">-</button>
                    </div>
                    <button @click.prevent="addOption(field)">+ Add Option</button>
                  </div>

                  <details class="logic_block">
                    <summary>Conditional Logic</summary>
                    <div class="logic_inputs">
                      <label>
                        Show this field if
                        <select v-model="field.showIf.field">
                          <option value="">Select field…</option>
                          <option v-for="f in pages[activePage].fields" :key="f.key" :value="f.key">{{ f.label }}</option>
                        </select>
                      </label>

                      <select v-model="field.showIf.operator">
                        <option value="==">equals</option>
                        <option value="!=">not equal</option>
                        <option value=">">greater than</option>
                        <option value="<">less than</option>
                        <option value=">=">greater or equal</option>
                        <option value="<=">less or equal</option>
                        <option value="includes">includes</option>
                      </select>

                      <input v-model="field.showIf.value" placeholder="Value" />
                    </div>
                  </details>

                  <div class="checkboxes required">
                    <label>
                      Full Width <input type="checkbox" v-model="field.fullWidth"
                      :true-value="true"
                      :false-value="false" />
                    </label>
                    <label >
                      Required <input type="checkbox" v-model="field.required" />
                    </label>
                  </div>
                
              </div>

              <button @click="removeField(index)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </template>
        </draggable>

            <div>
                <button @click="addField">Add Field</button>
            </div>
        </div>

            <div class="grid_inputs form_inputs">
                <label class="checkboxes">AI Assist<input type="checkbox" v-model="aiAssist" /></label>
            </div>

            <button class="buttons" @click="saveForm">Save Form</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted  } from 'vue'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '../../firebase/firebase';
import draggable from "vuedraggable";

const props = defineProps({
  title: String,
  collectionName: String,
  formId: String
})

const pages = ref([]);
const activePage = ref(0);
const fields = ref([]);
const aiAssist = ref(false);
const published = ref(false);

onMounted(async () => {
  const refDoc = doc(firestore, props.collectionName, props.formId);
  const snap = await getDoc(refDoc);
  if (snap.exists()) {
  const data = snap.data();

  // Normalize all fields to ensure backward compatibility
  pages.value = ensureIdsGlobal(dedupeKeys(data.pages || [{ title: "Page 1", fields: [] }])).map(page => ({
    ...page,
    fields: (page.fields || []).map(f => ({
      ...f,
      options: f.options || [],
      fullWidth: f.fullWidth === true,
      required: f.required === true,
      showIf: f.showIf || { field: "", operator: "==", value: "" },
    }))
  }));

  aiAssist.value = data.aiAssist || false;
  published.value = data.published ?? false;
  
} else {
  pages.value = [{ title: "Page 1", fields: [] }];
}
});

async function togglePublished() {
  published.value = !published.value;

  await updateDoc(
    doc(firestore, props.collectionName, props.formId),
    { published: published.value, updatedAt: Date.now() }
  );
}

function addPage() {
  pages.value.push({ title: `Page ${pages.value.length + 1}`, fields: [] });
  activePage.value = pages.value.length - 1;
}

function nextSequentialIdGlobal(pagesArr) {
  const nums = (pagesArr || [])
    .flatMap(p => p.fields || [])
    .map(f => String(f._id || ""))
    .map(id => {
      const m = id.match(/^f_(\d{3})$/);
      return m ? Number(m[1]) : null;
    })
    .filter(n => n !== null);

  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `f_${String(next).padStart(3, "0")}`;
}

function ensureIdsGlobal(pagesArr) {
  const pagesCopy = (pagesArr || []).map(p => ({ ...p, fields: (p.fields || []).map(f => ({ ...f })) }));

  for (const page of pagesCopy) {
    for (const f of page.fields) {
      if (!f._id) {
        f._id = nextSequentialIdGlobal(pagesCopy);
      }
    }
  }
  return pagesCopy;
}

function addField() {
  const page = pages.value[activePage.value];
  if (!page) return;

  const newId = nextSequentialIdGlobal(pages.value);

  pages.fields.push({
    _id: newId,
    label: "",
    key: `field_${newId}`, // stable
    type: "text",
    required: false,
    fullWidth: false,
    options: [],
    showIf: { field: "", operator: "==", value: "" },
  });

  enforceUniqueKeysNow(); 
}

function addOption(field) {
  if (!field.options) field.options = [];
  field.options.push("");
}

function ensureShowIf(field) {
  if (!field.showIf) field.showIf = { field: "", operator: "==", value: "" };
}

function removeField(i) {
  pages.value[activePage.value].fields.splice(i, 1);
}

function dedupeKeys(pages) {
  return (pages || []).map((page) => {
    const seen = new Map(); // per page

    const fields = (page.fields || []).map((f) => {
      const original = (f.key || "").trim();
      const base = original || `field_${Math.random().toString(36).slice(2, 9)}`;

      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);

      const uniqueKey = count === 1 ? base : `${base}__${count}`;

      return { ...f, key: uniqueKey };
    });

    return { ...page, fields };
  });
}

function enforceUniqueKeysNow() {
  pages.value = dedupeKeys(pages.value);
}

async function saveForm() {
  const withIds = ensureIdsGlobal(pages.value);
  const safePages = dedupeKeys(withIds)
  
  const preparedPages = safePages.map((p) => ({
    title: p.title,
    fields: (p.fields || []).flatMap((f) => {
      const stableKey = (f.key || "").trim() || `field_${f._id}`;

      if (f.type === "address") {
        const fw = f.fullWidth === true;
        return [
          { label: "Street Address", key: `${stableKey}_street`, type: "text", required: true,  fullWidth: fw },
          { label: "City",           key: `${stableKey}_city`,   type: "text", required: true,  fullWidth: fw },
          { label: "State / Province / Region", key: `${stableKey}_state`, type: "text", required: false, fullWidth: fw },
          { label: "Post Code",      key: `${stableKey}_postcode`, type: "text", required: true, fullWidth: fw },
        ];
      }

      return [{
        ...f,
        key: stableKey,
        required: f.required === true,
        fullWidth: f.fullWidth === true,
        options: f.options || [],
        showIf: f.showIf || { field: "", operator: "==", value: "" },
      }];
    }),
  }));
  
  await setDoc(doc(firestore, props.collectionName, props.formId), {
    name: props.title,
    slug: props.formId,
    pages: preparedPages,
    aiAssist: aiAssist.value,
    published: published.value, 
    updatedAt: Date.now(),
  },
    { merge: true }
  );
  alert("Form saved!");
}

</script>

<style scoped>
h2 {
  margin-top: 0;
}

.global-editor {
  display: grid;
  justify-items: stretch;
  gap: var(--gap5);
}

.form_grid {
    display: grid;
    gap: var(--gap10);
}

.form_grid_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page_title_input {
  margin-bottom: 20px;
}

.grid_inputs .form_inputs {
    grid-template-columns: min-content auto min-content;
        align-items: start;
}
.options_editor .option_row {
  display: flex;
}

.checkboxes {
    display: inline-flex;
    gap: var(--gap5);
    width: 100%;

    &.required {
        justify-content: flex-end;
    }

    input {
        width: auto;
    }
}

</style>
