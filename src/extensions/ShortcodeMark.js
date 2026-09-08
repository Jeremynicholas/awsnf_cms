import { Mark, mergeAttributes, markInputRule } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';

const ShortcodeMark = Mark.create({
  name: 'shortcode',
  inclusive: false,

  addOptions() {
    return {
      inclusive: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      code: {
        default: null,
        parseHTML: el => el.getAttribute('data-code'),
        renderHTML: attrs => ({ 'data-code': attrs.code }),
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.shortcode',
        getAttrs: el => {
          const code = el.getAttribute('data-code');
          return code ? { code } : false;
        }
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, {
        class: 'shortcode',
        'data-code': HTMLAttributes.code,
      }),
      0, // This tells Tiptap to use the actual content inside the mark
    ];
  },

  addCommands() {
    return {
      insertShortcode: code => ({ chain }) => {
        return chain()
          .focus()
          .insertContent({
            type: 'text',
            text: `${code}`,
            marks: [
              {
                type: this.name,
                attrs: { code },
              },
            ],
          })
          .run();
      },
    };
  },  
  
  addKeyboardShortcuts() {
    return {
      Space: ({ editor }) => {
        if (editor.isActive('shortcode')) {
          editor.commands.unsetMark('shortcode')
          // Insert the space as normal text
          editor.commands.insertContent(' ')
          return true // prevent default space handling
        }
        return false // let TipTap handle it normally
      },
    }
  },
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClick(view, pos, event) {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.code) {
              const code = target.dataset.code;

              // You can emit a custom event
              window.dispatchEvent(
                new CustomEvent('shortcode-clicked', {
                  detail: { code },
                }),
              );

              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export default ShortcodeMark;
