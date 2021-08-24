<template>
    <div class="quill-editor">
        <slot name="toolbar"></slot>
        <div ref="editor" class="quill-editor-container"></div>
    </div>
</template>

<script>
// require sources
import _Quill from "quill";

const Quill = window.Quill || _Quill;
const defaultOptions = {
    theme: "snow",
    boundary: document.body,
    modules: {
        toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image", "video"],
        ],
    },
    placeholder: "Insert text here ...",
    readOnly: false,
};

// pollfill
if (typeof Object.assign != "function") {
    Object.defineProperty(Object, "assign", {
        value(target) {
            if (target == null) {
                throw new TypeError(
                    "Cannot convert undefined or null to object"
                );
            }
            const to = Object(target);
            for (let index = 1; index < arguments.length; index++) {
                const nextSource = arguments[index];
                if (nextSource != null) {
                    for (const nextKey in nextSource) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                nextSource,
                                nextKey
                            )
                        ) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true,
    });
}
// export
export default {
    name: "quill-editor",
    data() {
        return {
            selfoptions: {},
            selfcontent: "",
            defaultOptions,
        };
    },
    props: {
        content: String,
        value: String,
        disabled: {
            type: Boolean,
            default: false,
        },
        options: {
            type: Object,
            required: false,
            default: () => ({}),
        },
        globalOptions: {
            type: Object,
            required: false,
            default: () => ({}),
        },
    },
    mounted() {
        this.initialize();
    },
    beforeDestroy() {
        this.quill = null;
        delete this.quill;
    },
    methods: {
        // Init Quill instance
        initialize() {
            if (this.$el) {
                // Options
                this.selfoptions = Object.assign(
                    {},
                    this.defaultOptions,
                    this.globalOptions,
                    this.options
                );

                // Instance
                this.quill = new Quill(this.$refs.editor, this.selfoptions);

                this.quill.enable(false);

                // Set editor content
                if (this.value || this.content) {
                    this.quill.pasteHTML(this.value || this.content);
                }

                // Disabled editor
                if (!this.disabled) {
                    this.quill.enable(true);
                }

                // Mark model as touched if editor lost focus
                this.quill.on("selection-change", (range) => {
                    if (!range) {
                        this.$emit("blur", this.quill);
                    } else {
                        this.$emit("focus", this.quill);
                    }
                });

                // Update model if text changes
                this.quill.on("text-change", (delta, oldDelta, source) => {
                    console.log(delta, oldDelta, source);
                    let html = this.$refs.editor.children[0].innerHTML;
                    const quill = this.quill;
                    const text = this.quill.getText();
                    if (html === "<p><br></p>") html = "";
                    this.selfcontent = html;
                    this.$emit("input", this.selfcontent);
                    this.$emit("change", { html, text, quill });
                });

                // Emit ready event
                this.$emit("ready", this.quill);
            }
        },
    },
    watch: {
        // Watch content change
        content(newVal) {
            if (this.quill) {
                if (newVal && newVal !== this.selfcontent) {
                    this.selfcontent = newVal;
                    this.quill.pasteHTML(newVal);
                } else if (!newVal) {
                    this.quill.setText("");
                }
            }
        },
        // Watch content change
        value(newVal) {
            if (this.quill) {
                if (newVal && newVal !== this.selfcontent) {
                    this.selfcontent = newVal;
                    this.quill.pasteHTML(newVal);
                } else if (!newVal) {
                    this.quill.setText("");
                }
            }
        },
        // Watch disabled change
        disabled(newVal) {
            if (this.quill) {
                this.quill.enable(!newVal);
            }
        },
    },
};
</script>
