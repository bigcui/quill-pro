<template>
    <div>
        <quill-editor ref="myQuillEditor"
                class="myQuillEditor"
                :options="editorOption"
                @change="onEditorChang($event)"
                @focus="onEditorFocus"
                @blur="onEditorBlur">
                <template v-slot:toolbar>
                        <button class="ql-bold"></button>
                        <button class="ql-italic"></button>
                </template>
        </quill-editor>
    </div>
</template>

<script>
import quillEditor from "@/components/quill-editor/editor.vue";

export default {
    components: {
        quillEditor
    },
    data() {
        return {
            content: '<h2>I am Example</h2>',
            editorOption: {
              // Some Quill options...
                placeholder: '请输入',
                theme: 'snow',
                
                modules: {
                    toolbar: {
                        // container: '#toolbar',
                        // handlers: {
                        //     shadeBox: null
                        // }
                    }
                }
            }
        }
    },
    methods: {
        onEditorBlur(quill) {
            console.log('editor blur!', quill);
        },
        onEditorFocus(quill) {
            console.log('editor focus!', quill);
        },
        onEditorReady(quill) {
            console.log('editor ready!', quill);
        },
        onEditorChange({ quill, html, text }) {
            console.log('editor change!', quill, html, text);
            this.content = html;
        }
    },
    computed: {
        editor() {
            return this.$refs.myQuillEditor.quill;
        }
    },
    mounted() {
        console.log('this is current quill instance object', this.editor);
    }
};
</script>
