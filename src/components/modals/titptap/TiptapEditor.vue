<template>
    <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="editor.chain().focus().toggleBold().run()" :disabled="!editor.can().chain().focus().toggleBold().run()" :class="{ 'is_active': editor.isActive('bold') }"><Bold /></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :disabled="!editor.can().chain().focus().toggleItalic().run()" :class="{ 'is_active': editor.isActive('italic') }"><Italic /></button>
        <button @click="editor.chain().focus().unsetAllMarks().run()"><FormatClear /></button>
        <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is_active': editor.isActive('paragraph') }"><Paragraph /></button>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is_active': editor.isActive('heading', { level: 1 }) }">H1</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is_active': editor.isActive('heading', { level: 2 }) }">H2</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is_active': editor.isActive('heading', { level: 3 }) }">H3</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 4 }).run()" :class="{ 'is_active': editor.isActive('heading', { level: 4 }) }">H4</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 5 }).run()" :class="{ 'is_active': editor.isActive('heading', { level: 5 }) }">H5</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 6 }).run()" :class="{ 'is_active': editor.isActive('heading', { level: 6 }) }">H6</button>

        <button @click="setLink" :class="{ 'is_active': editor.isActive('link') }"><AddLink /></button>
        <button @click="editor.chain().focus().unsetLink().run()" :disabled="!editor.isActive('link')"><RemoveLink /></button>
        <LinkTargetModal
          :visible="linkModalVisible"
          :href="linkHref"
          :target="linkTarget"
          @update:href="val => linkHref=val"
          @update:target="val => linkTarget=val"
          @confirm="applyLink"
          @cancel="linkModalVisible=false"
        />

        <button @click="toggleShortcodeSelector" :class="{ 'is_active': isShortcodeActive }">Shortcode</button>
          <ShortcodeSelector
            :visible="shortcodeSelectorVisible"
            :shortcodes="[
              { label: 'Cost', value: 'cost' },
              { label: 'Days', value: 'days' },
              { label: 'Nights', value: 'nights' },
              { label: 'Departure Date', value: 'departureDate' },
              { label: 'Departure Location', value: 'departureLocation' }
            ]"
            @select="insertShortcode"
            :active="activeShortcode"
            @close="shortcodeSelectorVisible = false"
          />

        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is_active': editor.isActive('bulletList') }"><BulletsUnOrdered /></button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is_active': editor.isActive('orderedList') }"><BulletsOrdered /></button>
        <button @click="editor.chain().focus().toggleCode().run()" :disabled="!editor.can().chain().focus().toggleCode().run()" :class="{ 'is_active': editor.isActive('code') }"><Code /></button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'is_active': editor.isActive('codeBlock') }"><CodeBlock /></button>
        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is_active': editor.isActive('blockquote') }"><QuoteBlock /></button>
        <button @click="editor.chain().focus().setHorizontalRule().run()"><SeparatorHr /></button>
        <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'is_active': editor.isActive({ textAlign: 'left' }) }"><AlignLeft /></button>
        <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'is_active': editor.isActive({ textAlign: 'center' }) }"><AlignCenter /></button>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()"><Undo /></button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()"><Redo /></button>
      </div>
 
      

    </div>
      <editor-content :editor="editor" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, watchEffect } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import Bold from '../../icons/Bold.vue'
import Italic from '../../icons/Italic.vue'
import Code from '../../icons/Code.vue'
import CodeBlock from '../../icons/CodeBlock.vue'
import Paragraph from '../../icons/Paragraph.vue'
import AddLink from '../../icons/AddLink.vue'
import RemoveLink from '../../icons/RemoveLink.vue'
import FormatClear from '../../icons/FormatClear.vue'
import BulletsUnOrdered from '../../icons/BulletsUnOrdered.vue'
import BulletsOrdered from '../../icons/BulletsOrdered.vue'
import QuoteBlock from '../../icons/QuoteBlock.vue'
import SeparatorHr from '../../icons/SeparatorHr.vue'
import AlignLeft from '../../icons/AlignLeft.vue'
import AlignCenter from '../../icons/AlignCenter.vue'
import Undo from '../../icons/Undo.vue'
import Redo from '../../icons/Redo.vue'
import ShortcodeMark from '../../../extensions/ShortcodeMark'; // Adjust the path as necessary
import ShortcodeSelector from '../titptap/ShortcodeSelector.vue';
import LinkTargetModal from '../titptap/LinkTargetModal.vue';

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue']);

const editor = ref(null);
const shortcodeSelectorVisible = ref(false);

const linkModalVisible = ref(false)
const linkHref = ref('');
const linkTarget = ref('_self');

onMounted(() => {
  editor.value = new Editor({
  extensions: [
    StarterKit,
    Link.configure({
          openOnClick: false,
          defaultProtocol: 'https',
          HTMLAttributes: {
          target: '_self',
          rel: '',
        },
      }),
        ShortcodeMark,    
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  }
}); 
})


// SHORTCODES
const activeShortcode = ref(null);
const isShortcodeActive = computed(() => {
  return editor.value?.isActive('shortcode', { code: activeShortcode.value });
});

const toggleShortcodeSelector = () => {
  shortcodeSelectorVisible.value = !shortcodeSelectorVisible.value;
};

const insertShortcode = (shortcode) => {
  const { state } = editor.value;
  const { from, to } = state.selection;
  const hasShortcode = state.doc.rangeHasMark(from, to, state.schema.marks.shortcode);

  activeShortcode.value = shortcode;

  if (hasShortcode) {
    editor.value.commands.updateAttributes('shortcode', { code: shortcode });
  } else {
    editor.value.chain().focus().insertShortcode(shortcode).run();
  }

  shortcodeSelectorVisible.value = false;
};


const handleShortcodeClicked = (e) => {
  const code = e.detail.code;
  activeShortcode.value = code;
  shortcodeSelectorVisible.value = true;
};

onMounted(() => {
  editor.value.on('selectionUpdate', ({ editor }) => {
    const { state } = editor;
    const { from, to } = state.selection;
    const hasShortcode = state.doc.rangeHasMark(from, to, state.schema.marks.shortcode);

    if (!hasShortcode) {
      shortcodeSelectorVisible.value = false;
      activeShortcode.value = null;
    }
  });

  window.addEventListener('shortcode-clicked', (e) => {
    const code = e.detail.code;
    activeShortcode.value = code;
    shortcodeSelectorVisible.value = true;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('shortcode-clicked', handleShortcodeClicked);
});

// SETTING URL LINKS
const setLink = () => {
  const existingLink = editor.value.getAttributes('link');
  linkHref.value = existingLink.href || '';
  linkTarget.value = existingLink.target || '_self';
  linkModalVisible.value = true;
};

const applyLink = () => {
  editor.value.chain().focus().extendMarkRange('link').setLink({
    href: linkHref.value,
    target: linkTarget.value || '_self',
  }).run();
  linkModalVisible.value = false;
};




watchEffect(() => {
  if (!editor.value) return;

  const current = editor.value.getHTML();
  const incoming = props.modelValue;

  // Only update if incoming is different AND editor doesn't have focus
  if (incoming !== current && !editor.value.isFocused) {
    editor.value.commands.setContent(incoming, false);
  }
});

</script>

<style scoped>
.container {
    border: var(--borders);
    border-radius: var(--rounded);
    margin-top: var(--gap10);
    margin-bottom: var(--gap30);
}

.control-group {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: var(--padding15);

    button {
        background: var(--background);
        border-radius: var(--rounded);
        border: var(--borders);
        font-size: var(--fontSizeTiny);
        padding: 7px 10px;

        @media(max-width: 768px) {
          padding: 5px;
        }

        svg {
          height: 24px;
          fill: var(--accent);
        }

    }

    button.is_active, button.is_active:hover {
        border-color: var(--borders);
        background: var(--background-dark);
        color: var(--white);

          svg {
            height: 24px;
            fill: var(--white);
          }
        }
  
}

.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: .25rem;
}

</style>