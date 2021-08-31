<template>
    <div>
        <div id="toolbar">
            <button class="ql-bold">加粗1</button>
            <button class="ql-italic">字体</button>
            <button style="margin-right:20px;" @click="insertIMG('https://biz-crm-wechat-applet.cdn.bcebos.com/biz-crm-wechat-applet/generic/32621050/yoda/companyproduct/2021-08-05/c7b9630576ad461190395c8f0fe64662.jpeg')">image</button>
            <button @click="insertLinks('https://biz-crm-wechat-applet.cdn.bcebos.com', '链接')">link</button>
            <button style="margin-left:20px;" @click="insertSeclect">insertSeclect</button>
        </div>
        <quill-editor ref="myQuillEditor" class="myQuillEditor" :content="content" :options="editorOption" @change="onEditorChange" @focus="onEditorFocus" @blur="onEditorBlur">
        </quill-editor>
    </div>
</template>

<script>
import { Quill, quillEditor, Popper } from '@/components/quill-editor/index.js';
import { addEventPopper} from '@/components/quill-editor/util';
import Vue from "vue";
let getName = (list, value) => {
    let result = '';
    function getValo2(list, value) {
        for (var k = 0; k < list.length; k++) {
            var el = list[k];
            if (el.code === value) {
                result = el.name;
                break;
            } else {
                if (el.children) {
                    getValo2(el.children, value);
                }
            }
        }
        return result;
    }
    return getValo2(list, value);
};
let eventHub = new Vue();
export default {
    components: {
        quillEditor
    },
    data() {
        return {
            content: '',
            size: 0,
            currentIndex: 0,
            popperJS: null,
            editorOption: {
                // Some Quill options...
                placeholder: '请输入',
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: '#toolbar',
                        handlers: {
                            shadeBox: null
                        }
                    }
                }
            }
        };
    },
    methods: {
        // 富文本image添加默认属性
        addImgAttr() {
            let BlockEmbed = Quill.imports['blots/embed'];
            class ImageBlot extends BlockEmbed {
                static create(value) {
                    let node = super.create();
                    node.setAttribute('src', value.src);
                    node.setAttribute('width', value.width || '100%');
                    node.setAttribute('max-width', '100%');
                    return node;
                }
                static value(node) {
                    return {
                        src: node.getAttribute('src'),
                        width: node.getAttribute('width'),
                        maxWidth: node.getAttribute('max-width')
                    };
                }
            }
            ImageBlot.blotName = 'image';
            ImageBlot.tagName = 'img';
            Quill.register(ImageBlot);
        },
        addSelectAttr() {
            let BlockEmbed = Quill.imports['blots/embed'];
            let popperFn = (electDiv, selectWraperALL, obj = {}) => {
                 if (this.popperJS) return;
                 this.popperJS = new Popper(electDiv, selectWraperALL,  obj);
                 this.popperJS.onCreate(_ => {
                    this.popperJS.update();
                });
            };
            let popperFnUpdate = ()=> {
                if (!this.popperJS) {
                    popperFn();
                }
                else {
                    this.popperJS.update();
                }
            };
            let that = this;
            class SelectBlot extends BlockEmbed {
                static create(value) {
                    let node = super.create();
                    let levelIndex = 0;
                    let input = document.createElement('span');
                    let inputData = document.createElement('e');
                    let selectDiv = document.createElement('div');
                    let selectWraperALL = document.createElement('div'); // 所有下拉包
                    let elCascaderpanel = document.createElement('div');
                    let selectTxt = document.createElement('div');
                    input.className = 'input-inner';
                    selectTxt.className = 'input-wraper';
                    elCascaderpanel.className = 'el-cascader-panel';
                    selectWraperALL.className = 'el-cascader__dropdown';
                    selectDiv.className = 'select-input-value';
                    inputData.className = 'data-list-wraper';
                    inputData.innerHTML = JSON.stringify(value.list);
                    selectDiv.appendChild(inputData);
                    selectTxt.appendChild(input);
                    selectDiv.appendChild(selectTxt);
                    input.innerText = '请选择';
                    node.appendChild(selectDiv);
                    let popperJSmode = null;
                    // 关闭所有
                    selectDiv.onclick = ()=> {
                         document.querySelectorAll('.el-cascader__dropdown').forEach(
                            el => {
                                el.style.display = 'none';
                            }
                        );
                        selectWraperALL.style.display = 'block';
                        setTimeout(()=>{
                           eventHub.$emit('updatepopperJS', 'dd')
                        },100);
                    };
                    /**
                     * 1 回填数据 展开弹窗 显示选中的数据
                     */
                    let activedCode = '';
                    let selectVavList = value.value.split('/');
                    let str = [];
                    selectVavList.forEach(el => {
                        str.push(getName(value.list, el));
                    });
                    input.innerText = str.length > 1 ? str.join('/') : str.join('');
                    const PanelArr = document.createElement('div');
                    // level 指定output下一级
                    let createPanel = (list, level) => {
                        levelIndex++;
                        if (level) {
                            levelIndex = level;
                        }
                        let ul = document.createElement('ul');
                        let len = list || [];
                        let selectWraper = document.createElement('div');
                        let selectDropDown = document.createElement('div');
                        ul.className = 'el-scrollbar__view el-cascader-menu__list';
                        selectWraper.className = 'el-scrollbar el-cascader-menu';
                        selectDropDown.className = 'el-cascader-menu__wrap el-scrollbar__wrap';

                        for (let i = 0; i < len.length; i++) {
                            let keyData = len[i];
                            let li = document.createElement('li');
                            let span = document.createElement('span');
                            span.innerHTML = keyData.name;
                            span.className = 'el-cascader-node__label';
                            li.setAttribute('code', keyData.code);
                            li.setAttribute('level', levelIndex);
                            li.appendChild(span);
                            li.className = 'el-cascader-node';
                            if (Object.keys(keyData.children || []).length) {
                                let after = document.createElement('i');
                                after.className = 'el-icon-check el-cascader-node__prefix';
                                li.appendChild(after);
                            }
                            if (selectVavList.includes(keyData.code)) {
                                li.classList.add('in-active-path');
                            }
                            // 历史数据回填
                            if (value.value && selectVavList.length) {
                                activedCode = selectVavList[levelIndex - 1];
                                if (keyData.code === activedCode) {
                                    let subList = list.find(el => el.code == activedCode);
                                    // 二级回填 自动展开
                                    if (subList.children && subList.children.length && selectVavList.length > 1) {
                                        Promise.resolve(1).then(() => {
                                            createPanel(subList.children);
                                        });
                                    }
                                }
                            }
                            li.onclick = function() {
                                // clear当前
                                ul.children.forEach(el => {
                                    el.classList.remove('in-active-path');
                                });
                                li.classList.add('in-active-path');
                                if (Object.keys(keyData.children || []).length) {
                                    // 点击的时候需要判断 是右侧更新数据 还是在右侧创建panel？看levelIndex是
                            // 是否比自己大
                                    createPanel(keyData.children, +li.getAttribute('level') + 1);
                                    setTimeout(()=>{
                                         eventHub.$emit('updatepopperJS', 'dd')
                                    },100)
                                } else {
                                    value.value = this.innerText;
                                    let selectVal = [];
                                    let selectCode = [];
                                    let thisLevel = +li.getAttribute('level');
                                    if (thisLevel < levelIndex) {
                                        for (let l = elCascaderpanel.children.length; l>=0; l--) {
                                        // debugger
                                            if (l > (levelIndex - thisLevel)) {
                                                elCascaderpanel.children[l] && elCascaderpanel.removeChild(elCascaderpanel.children[l]);
                                            }
                                        }
                                    }
                                    Promise.resolve(1).then(()=>{
                                        selectWraperALL.querySelectorAll('.in-active-path').forEach(el => {
                                            selectVal.push(el.innerText);
                                            selectCode.push(el.getAttribute('code'));
                                        });
                                        input.innerText = selectVal.join('/');
                                        node.setAttribute('value', selectCode.join('/'));
                                        selectWraperALL.style.display = 'none';
                                        this.popperJS && this.popperJS.destroy();
                                    })
                                }
                                setTimeout(()=>{
                                    
                                    eventHub.$emit('updatepopperJS', 'dd')
                                })
                            };
                            ul.append(li);
                        }
                        selectDropDown.appendChild(ul);
                        //创建下级子节点
                        if (level) {
                            elCascaderpanel.childNodes[level - 1] && elCascaderpanel.removeChild(elCascaderpanel.childNodes[level - 1]);
                        }
                        // 删除创建 当前elCascaderpanel.childNodes.length 大于 levelIndex的 节点clear掉
                        // if (elCascaderpanel && elCascaderpanel.childNodes.length > 1) {
                        //     levelIndex--;
                        //     // 删除当前层级的历史数据 重新创建
                        //     elCascaderpanel.removeChild(elCascaderpanel.childNodes[levelIndex - 1]);
                        // }
                        for (let l = elCascaderpanel.children.length; l>=0; l--) {
                            // debugger
                            if (l > levelIndex-2) {
                                elCascaderpanel.children[l] && elCascaderpanel.removeChild(elCascaderpanel.children[l]);
                            }
                        }
                        selectWraper.appendChild(selectDropDown);
                        elCascaderpanel.appendChild(selectWraper);
                        console.log('levelIndex', levelIndex,elCascaderpanel.children.length);
                    };
                    popperJSmode = new Popper(selectDiv, selectWraperALL, {});
                    popperJSmode.onCreate(_ => {
                        popperJSmode.update();
                    });
                    eventHub.$on('updatepopperJS', _ =>{
                        popperJSmode.update();
                     });
                    createPanel(value.list);
                    selectWraperALL.appendChild(elCascaderpanel);
                    node.appendChild(selectWraperALL);
                    node.className = 'el-cascader';
                    node.setAttribute('value', value.value || '');
                    node.setAttribute('code', value.value || '');
                    node.setAttribute('width', value.width || '100%');
                    node.setAttribute('max-width', '100%');
                    node.setAttribute('max-width', '100%');
                    addEventPopper(node, () => {

                        // setTimeout(()=> {
                        //     selectWraperALL.style.display = 'none';
                        //     this.popperJS && this.popperJS.destroy();
                        // })
                    });
                    return node;
                }
                static value(node) {
                    let list = [];
                    try {
                        let listOwn = node.querySelector('e');
                        if (listOwn) {
                            list = JSON.parse(listOwn.innerText);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                    return {
                        value: node.getAttribute('value'),
                        code: node.getAttribute('code'),
                        width: node.getAttribute('width'),
                        maxWidth: node.getAttribute('max-width'),
                        list: list,
                        type: 2
                    };
                }
            }
            SelectBlot.blotName = 'selectSection';
            SelectBlot.tagName = 'div';
            Quill.register(SelectBlot);
        },
        insertLinks(url, displayText) {
            this.linkHandler(url, displayText);
        },
        insertIMG(URL) {
            this.imageHandler(URL);
        },
        insertSeclect(URL) {
            let ss = [{
                "name": "基本信息",
                "code": "2",
                "children": [{
                    "name": "省份",
                    "code": "province",
                    "children":[
                            {
                            "name": "s地址",
                            "code": "address",
                            "children": null
                        }, {
                            "name": "s职业",
                            "code": "profession",
                            "children": null
                        }, {
                            "name": "s姓名",
                            "code": "name",
                            "children": null
                        }
                    ]
                }, {
                    "name": "生日",
                    "code": "birthday",
                    "children": null
                }, {
                    "name": "性别",
                    "code": "gender",
                    "children": null
                }, {
                    "name": "参与活动",
                    "code": "participate_activity_detail",
                    "children": null
                }, {
                    "name": "潜客来源",
                    "code": "source_type_detail",
                    "children": null
                }]
            }, {
                "name": "微信信息",
                "code": "3",
                "children": [{
                    "name": "微信昵称",
                    "code": "nickname",
                    "children": null
                }]
            }, {
                "name": "线索信息",
                "code": "5",
                "children": [{
                    "name": "线索来源",
                    "code": "leadsSource",
                    "children": null
                }, {
                    "name": "培育状态",
                    "code": "nurtureState",
                    "children": null
                }, {
                    "name": "线索创建时间",
                    "code": "collectTime",
                    "children": null
                }, {
                    "name": "分配状态",
                    "code": "hasOwner",
                    "children": null
                }, {
                    "name": "线索状态",
                    "code": "potCustStatus",
                    "children": null
                }, {
                    "name": "线索池",
                    "code": "leadsPool",
                    "children": null
                }, {
                    "name": "备注",
                    "code": "remark",
                    "children": null
                }, {
                    "name": "入池方式",
                    "code": "entryWay",
                    "children": null
                }, {
                    "name": "微信号",
                    "code": "wechatNumber",
                    "children": null
                }, {
                    "name": "企业潜客挖掘",
                    "code": "opptyFlag",
                    "children": null
                }, {
                    "name": "lxl下拉多选",
                    "code": "col_dynamic_magic_varchar200_0",
                    "children": null
                }, {
                    "name": "日期赫",
                    "code": "col_dynamic_magic_bigint_1",
                    "children": null
                }, {
                    "name": "lxl下拉多选",
                    "code": "col_dynamic_magic_varchar200_1",
                    "children": null
                }, {
                    "name": "下拉多选",
                    "code": "col_dynamic_magic_varchar200_2",
                    "children": null
                }, {
                    "name": "来自哪里",
                    "code": "col_dynamic_magic_varchar30_12",
                    "children": null
                }, {
                    "name": "sz测试",
                    "code": "col_dynamic_magic_varchar30_11",
                    "children": null
                }, {
                    "name": "lxl单选按钮",
                    "code": "col_dynamic_magic_varchar10_0",
                    "children": null
                }, {
                    "name": "第一次测试",
                    "code": "col_dynamic_magic_varchar30_14",
                    "children": null
                }, {
                    "name": "lxl下拉单选",
                    "code": "col_dynamic_magic_varchar10_1",
                    "children": null
                }, {
                    "name": "测试映射",
                    "code": "col_dynamic_magic_varchar30_13",
                    "children": null
                }, {
                    "name": "userId",
                    "code": "col_dynamic_magic_varchar30_1",
                    "children": null
                }, {
                    "name": "lxl单行文本",
                    "code": "col_dynamic_magic_varchar30_0",
                    "children": null
                }, {
                    "name": "haha",
                    "code": "col_dynamic_magic_varchar200_19",
                    "children": null
                }, {
                    "name": "多行文本赫",
                    "code": "col_dynamic_magic_varchar200_18",
                    "children": null
                }, {
                    "name": "多选赫",
                    "code": "col_dynamic_magic_varchar200_17",
                    "children": null
                }, {
                    "name": "榴莲多行文本",
                    "code": "col_dynamic_magic_varchar200_16",
                    "children": null
                }, {
                    "name": "榴莲0601新增",
                    "code": "col_dynamic_magic_varchar200_15",
                    "children": null
                }, {
                    "name": "参与的活动",
                    "code": "col_dynamic_magic_varchar200_14",
                    "children": null
                }, {
                    "name": "28新增",
                    "code": "col_dynamic_magic_varchar200_13",
                    "children": null
                }, {
                    "name": "参与的活动",
                    "code": "col_dynamic_magic_varchar200_12",
                    "children": null
                }, {
                    "name": "28新增",
                    "code": "col_dynamic_magic_varchar200_11",
                    "children": null
                }, {
                    "name": "多选按钮",
                    "code": "col_dynamic_magic_varchar200_10",
                    "children": null
                }, {
                    "name": "0721lxl",
                    "code": "col_dynamic_magic_varchar10_12",
                    "children": null
                }, {
                    "name": "您的身份",
                    "code": "col_dynamic_magic_varchar10_10",
                    "children": null
                }, {
                    "name": "身高",
                    "code": "col_dynamic_magic_decimal_1",
                    "children": null
                }]
            }, {
                "name": "企业微信",
                "code": "18",
                "children": [{
                    "name": "是否为企微客户",
                    "code": "enterpriseWxFlag",
                    "children": null
                }, {
                    "name": "所属销售",
                    "code": "enterpriseWxUserID",
                    "children": null
                }, {
                    "name": "客户名称",
                    "code": "enterpriseWxName",
                    "children": null
                }, {
                    "name": "客户类型",
                    "code": "enterpriseWxType",
                    "children": null
                }, {
                    "name": "客户企业简称",
                    "code": "corpName",
                    "children": null
                }, {
                    "name": "客户企业名称",
                    "code": "corpFullName",
                    "children": null
                }, {
                    "name": "客户职位",
                    "code": "enterpriseWxPosition",
                    "children": null
                }, {
                    "name": "客户备注",
                    "code": "enterpriseWxRemark",
                    "children": null
                }, {
                    "name": "客户备注公司",
                    "code": "enterpriseWxRemarkCorpName",
                    "children": null
                }]
            }, {
                "name": "身份信息",
                "code": "26",
                "children": [{
                    "name": "微信UnionId",
                    "code": "union_id",
                    "children": null
                }, {
                    "name": "手机号",
                    "code": "phone",
                    "children": null
                }, {
                    "name": "线索Id",
                    "code": "leads_id",
                    "children": null
                }, {
                    "name": "微信OpenId",
                    "code": "open_id",
                    "children": null
                }, {
                    "name": "邮箱",
                    "code": "email",
                    "children": null
                }, {
                    "name": "QQ",
                    "code": "qq",
                    "children": null
                }, {
                    "name": "座机",
                    "code": "fixed_phone",
                    "children": null
                }, {
                    "name": "神策Id",
                    "code": "distinct_id",
                    "children": null
                }, {
                    "name": "企微userId",
                    "code": "external_userid",
                    "children": null
                }, {
                    "name": "自用CrmId",
                    "code": "own_crm_id",
                    "children": null
                }, {
                    "name": "抖音OpenId",
                    "code": "dy_open_id",
                    "children": null
                }, {
                    "name": "百度小程序OpenId",
                    "code": "smart_program_open_id",
                    "children": null
                }]
            }, {
                "name": "自有系统",
                "code": "28",
                "children": [{
                    "name": "32621050lxl_0804_01_更新字符串_toc",
                    "code": "32621050_lxl_0804_01",
                    "children": null
                }, {
                    "name": "32621050lxl_0804_02_更新数值_toc",
                    "code": "32621050_lxl_0804_02",
                    "children": null
                }, {
                    "name": "32621050lxl_0804_03_更新多值_toc",
                    "code": "32621050_lxl_0804_03",
                    "children": null
                }, {
                    "name": "抖音昵称",
                    "code": "dyNickname",
                    "children": null
                }, {
                    "name": "是否抖音粉丝",
                    "code": "dyFlag",
                    "children": null
                }]
            }];
            this.seclectHandler(ss, 'tet');
        },
        seclectHandler(list, value) {
            let quill = this.editor; // 获取到编辑器本身
            let cursorPosition = (quill.getSelection() || {}).index || this.currentIndex; // 获取当前光标位置
            quill.insertEmbed(cursorPosition, 'selectSection', { list: list, value: value }); // 插入links
            quill.setSelection(cursorPosition + 1); // 光标位置加1
            this.currentIndex = cursorPosition + 1;
            console.log('光标的位置' + this.currentIndex);
        },
        imageHandler(url) {
            let quill = this.editor; // 获取到编辑器本身
            const cursorPosition = (quill.getSelection() || {}).index || this.currentIndex; // 获取当前光标位置
            quill.insertEmbed(cursorPosition, 'image', { src: url, width: 'auto' }); // 插入图片
            quill.setSelection(cursorPosition + 1); // 光标位置加1
            this.currentIndex = cursorPosition + 1;
            console.log('光标的位置image' + this.currentIndex, quill);
        },
        linkHandler(url, displayText) {
            let quill = this.editor; // 获取到编辑器本身
            let cursorPosition = (quill.getSelection() || {}).index || this.currentIndex; // 获取当前光标位置
            quill.insertEmbed(cursorPosition, 'A', { href: url, text: displayText, width: 'auto' }); // 插入links
            quill.setSelection(cursorPosition + 1); // 光标位置加1
            this.currentIndex = cursorPosition + 1;
            console.log('光标的位置' + this.currentIndex);
        },
        // 富文本link添加默认属性
        addLinkAttr() {
            let BlockEmbed = Quill.imports['blots/embed'];
            class LinkBlot extends BlockEmbed {
                static create(value) {
                    let node = super.create();
                    node.setAttribute('href', value.href);
                    node.setAttribute('class', 'link');
                    node.innerText = value.text;
                    node.onclick = () => {
                        this.handlerClick(value);
                    };
                    return node;
                }
                static value(node) {
                    console.log(node, 111)
                    return {
                        href: node.getAttribute('href'),
                        width: node.getAttribute('width'),
                        text: node.textContent || node.text
                    };
                }
                static handlerClick({ href }) {
                    window.open(href);
                }
            }
            LinkBlot.blotName = 'A';
            LinkBlot.tagName = 'a';
            Quill.register(LinkBlot);
        },
        onEditorBlur(quill) {
            console.log('editor blur!', quill);
        },
        onEditorFocus(quill) {
            console.log('editor focus!', quill);
        },
        onEditorReady(quill) {
            console.log('editor ready!', quill);
        },
        onEditorChange({
            quill,
            html,
            text
        }) {
            console.log('editor change!11', html, text);
            this.content = html;
        }
    },
    computed: {
        editor() {
            return this.$refs.myQuillEditor.quill;
        }
    },
    mounted() {
        let quill = this.editor;
        this.addImgAttr();
        this.addLinkAttr();
        this.addSelectAttr();
        setTimeout(() => {
            this.content = `<p>sdds</p><p><div class="el-cascader" value="2/province" code="CEST" width="100%" max-width="100%">﻿<span contenteditable="false"><div class="select-input-value"><e class="data-list-wraper">[{"name":"基本信息","code":"2","children":[{"name":"省份","code":"province","children":null},{"name":"生日","code":"birthday","children":null},{"name":"地址","code":"address","children":null},{"name":"职业","code":"profession","children":null},{"name":"姓名","code":"name","children":null},{"name":"性别","code":"gender","children":null},{"name":"参与活动","code":"participate_activity_detail","children":null},{"name":"潜客来源","code":"source_type_detail","children":null}]},{"name":"微信信息","code":"3","children":[{"name":"微信昵称","code":"nickname","children":null}]},{"name":"线索信息","code":"5","children":[{"name":"线索来源","code":"leadsSource","children":null},{"name":"培育状态","code":"nurtureState","children":null},{"name":"线索创建时间","code":"collectTime","children":null},{"name":"分配状态","code":"hasOwner","children":null},{"name":"线索状态","code":"potCustStatus","children":null},{"name":"线索池","code":"leadsPool","children":null},{"name":"备注","code":"remark","children":null},{"name":"入池方式","code":"entryWay","children":null},{"name":"微信号","code":"wechatNumber","children":null},{"name":"企业潜客挖掘","code":"opptyFlag","children":null},{"name":"lxl下拉多选","code":"col_dynamic_magic_varchar200_0","children":null},{"name":"日期赫","code":"col_dynamic_magic_bigint_1","children":null},{"name":"lxl下拉多选","code":"col_dynamic_magic_varchar200_1","children":null},{"name":"下拉多选","code":"col_dynamic_magic_varchar200_2","children":null},{"name":"来自哪里","code":"col_dynamic_magic_varchar30_12","children":null},{"name":"sz测试","code":"col_dynamic_magic_varchar30_11","children":null},{"name":"lxl单选按钮","code":"col_dynamic_magic_varchar10_0","children":null},{"name":"第一次测试","code":"col_dynamic_magic_varchar30_14","children":null},{"name":"lxl下拉单选","code":"col_dynamic_magic_varchar10_1","children":null},{"name":"测试映射","code":"col_dynamic_magic_varchar30_13","children":null},{"name":"userId","code":"col_dynamic_magic_varchar30_1","children":null},{"name":"lxl单行文本","code":"col_dynamic_magic_varchar30_0","children":null},{"name":"haha","code":"col_dynamic_magic_varchar200_19","children":null},{"name":"多行文本赫","code":"col_dynamic_magic_varchar200_18","children":null},{"name":"多选赫","code":"col_dynamic_magic_varchar200_17","children":null},{"name":"榴莲多行文本","code":"col_dynamic_magic_varchar200_16","children":null},{"name":"榴莲0601新增","code":"col_dynamic_magic_varchar200_15","children":null},{"name":"参与的活动","code":"col_dynamic_magic_varchar200_14","children":null},{"name":"28新增","code":"col_dynamic_magic_varchar200_13","children":null},{"name":"参与的活动","code":"col_dynamic_magic_varchar200_12","children":null},{"name":"28新增","code":"col_dynamic_magic_varchar200_11","children":null},{"name":"多选按钮","code":"col_dynamic_magic_varchar200_10","children":null},{"name":"0721lxl","code":"col_dynamic_magic_varchar10_12","children":null},{"name":"您的身份","code":"col_dynamic_magic_varchar10_10","children":null},{"name":"身高","code":"col_dynamic_magic_decimal_1","children":null}]},{"name":"企业微信","code":"18","children":[{"name":"是否为企微客户","code":"enterpriseWxFlag","children":null},{"name":"所属销售","code":"enterpriseWxUserID","children":null},{"name":"客户名称","code":"enterpriseWxName","children":null},{"name":"客户类型","code":"enterpriseWxType","children":null},{"name":"客户企业简称","code":"corpName","children":null},{"name":"客户企业名称","code":"corpFullName","children":null},{"name":"客户职位","code":"enterpriseWxPosition","children":null},{"name":"客户备注","code":"enterpriseWxRemark","children":null},{"name":"客户备注公司","code":"enterpriseWxRemarkCorpName","children":null}]},{"name":"身份信息","code":"26","children":[{"name":"微信UnionId","code":"union_id","children":null},{"name":"手机号","code":"phone","children":null},{"name":"线索Id","code":"leads_id","children":null},{"name":"微信OpenId","code":"open_id","children":null},{"name":"邮箱","code":"email","children":null},{"name":"QQ","code":"qq","children":null},{"name":"座机","code":"fixed_phone","children":null},{"name":"神策Id","code":"distinct_id","children":null},{"name":"企微userId","code":"external_userid","children":null},{"name":"自用CrmId","code":"own_crm_id","children":null},{"name":"抖音OpenId","code":"dy_open_id","children":null},{"name":"百度小程序OpenId","code":"smart_program_open_id","children":null}]},{"name":"自有系统","code":"28","children":[{"name":"32621050lxl_0804_01_更新字符串_toc","code":"32621050_lxl_0804_01","children":null},{"name":"32621050lxl_0804_02_更新数值_toc","code":"32621050_lxl_0804_02","children":null},{"name":"32621050lxl_0804_03_更新多值_toc","code":"32621050_lxl_0804_03","children":null},{"name":"抖音昵称","code":"dyNickname","children":null},{"name":"是否抖音粉丝","code":"dyFlag","children":null}]}]</e><span>基本信息/省份</span></div><div class="el-cascader__dropdown" x-placement="bottom" style="position: fixed; top: 0px; left: 0px; transform: translate3d(5px, 150px, 0px); display: none;"><div class="el-cascader-panel"><div class="el-scrollbar el-cascader-menu"><div class="el-cascader-menu__wrap el-scrollbar__wrap"><ul class="el-scrollbar__view el-cascader-menu__list"><li code="2" level="1" class="el-cascader-node in-active-path"><span class="el-cascader-node__label">基本信息</span><i class="el-icon-check el-cascader-node__prefix"></i></li><li code="3" level="1" class="el-cascader-node"><span class="el-cascader-node__label">微信信息</span><i class="el-icon-check el-cascader-node__prefix"></i></li><li code="5" level="1" class="el-cascader-node"><span class="el-cascader-node__label">线索信息</span><i class="el-icon-check el-cascader-node__prefix"></i></li><li code="18" level="1" class="el-cascader-node"><span class="el-cascader-node__label">企业微信</span><i class="el-icon-check el-cascader-node__prefix"></i></li><li code="26" level="1" class="el-cascader-node"><span class="el-cascader-node__label">身份信息</span><i class="el-icon-check el-cascader-node__prefix"></i></li><li code="28" level="1" class="el-cascader-node"><span class="el-cascader-node__label">自有系统</span><i class="el-icon-check el-cascader-node__prefix"></i></li></ul></div></div><div class="el-scrollbar el-cascader-menu"><div class="el-cascader-menu__wrap el-scrollbar__wrap"><ul class="el-scrollbar__view el-cascader-menu__list"><li code="province" level="2" class="el-cascader-node in-active-path"><span class="el-cascader-node__label">省份</span></li><li code="birthday" level="2" class="el-cascader-node"><span class="el-cascader-node__label">生日</span></li><li code="address" level="2" class="el-cascader-node"><span class="el-cascader-node__label">地址</span></li><li code="profession" level="2" class="el-cascader-node"><span class="el-cascader-node__label">职业</span></li><li code="name" level="2" class="el-cascader-node"><span class="el-cascader-node__label">姓名</span></li><li code="gender" level="2" class="el-cascader-node"><span class="el-cascader-node__label">性别</span></li><li code="participate_activity_detail" level="2" class="el-cascader-node"><span class="el-cascader-node__label">参与活动</span></li><li code="source_type_detail" level="2" class="el-cascader-node"><span class="el-cascader-node__label">潜客来源</span></li></ul></div></div></div></div></span>﻿</div></p> sdds`
        })
        // // 清除默认样式
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            let ops = [];
            delta.ops.forEach(op => {
                if (op.insert) {
                    let attr = ['bold'];
                    if (op.attributes) {
                        Object.keys(op.attributes).forEach(item => {
                            if (!attr.includes(item)) {
                                delete op.attributes[item];
                            }
                        });
                    }
                    ops.push(op);
                }
            });
            delta.ops = ops;
            return delta;
        });
        console.log('this is current quill instance object', this.editor);
    }
};
</script>

<style lang="less" scoped>
/deep/ .select-input-value {
    display: inline-block !important;
    overflow: hidden;
    width: 160px;
    border: 0;
    height: 40px;
    line-height: 40px;
    color: #303133;
    background: #f5f5f5;
    cursor: pointer;
    span {
        line-height: 40px;
        display: inline-block;
        padding: 0 10px;
        width: 140px;
        overflow:hidden; //超出的文本隐藏
        text-overflow:ellipsis; //用省略号显示
        white-space:nowrap; //不换行
    }
    .input-wraper {
        // display: inline-flex;
    }
    .input-inner {
        text-align: left;
        display: inline-block !important;
        &:empty::before {
          content: "在这里输入.";
          color: #999999;
          line-height: 1.5;
          font-size: 14px;
        }
        &:focus:before{
          content:none;
        }
      }
    .data-list-wraper {
        display: none;
    }
}

* {
    margin: 0;
    padding: 0;
    list-style: none;
}

/deep/ .el-cascader {
    display: -webkit-inline-box;
    position: relative;
    line-height: 40px;
    margin: 0 3px;
    span[contenteditable=false]{
        // display: block;
        // height: 40px;
    }
    .el-cascader__dropdown {
        display: none;
    }
    .el-cascader-panel {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        border-radius: 4px;
        font-size: 14px;
        border: 1px solid #e4e7ed;
    }
    .el-scrollbar {
        overflow: hidden;
        position: relative
    }
    .el-scrollbar:active>.el-scrollbar__bar,
    .el-scrollbar:focus>.el-scrollbar__bar,
    .el-scrollbar:hover>.el-scrollbar__bar {
        opacity: 1;
        -webkit-transition: opacity .34s ease-out;
        transition: opacity .34s ease-out
    }
    .el-scrollbar__wrap {
        overflow: scroll;
        height: 100%
    }
    .el-scrollbar__wrap--hidden-default {
        scrollbar-width: none
    }
    .el-scrollbar__wrap--hidden-default::-webkit-scrollbar {
        width: 0;
        height: 0
    }
    .el-scrollbar__thumb {
        position: relative;
        display: block;
        width: 0;
        height: 0;
        cursor: pointer;
        border-radius: inherit;
        background-color: rgba(144, 147, 153, .3);
        -webkit-transition: background-color .3s;
        transition: background-color .3s
    }
    .el-scrollbar__thumb:hover {
        background-color: rgba(144, 147, 153, .5)
    }
    .el-scrollbar__bar {
        position: absolute;
        right: 2px;
        bottom: 2px;
        z-index: 1;
        border-radius: 4px;
        opacity: 0;
        -webkit-transition: opacity .12s ease-out;
        transition: opacity .12s ease-out
    }
    .el-scrollbar__bar.is-vertical {
        width: 6px;
        top: 2px
    }
    .el-scrollbar__bar.is-vertical>div {
        width: 100%
    }
    .el-scrollbar__bar.is-horizontal {
        height: 6px;
        left: 2px
    }
    .el-scrollbar__bar.is-horizontal>div {
        height: 100%
    }
    .el-cascader-panel.is-bordered {
        border: 1px solid #e4e7ed;
        border-radius: 4px
    }
    .el-cascader-menu {
        min-width: 180px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #606266;
        border-right: 1px solid #e4e7ed
    }
    .el-cascader-menu:last-child {
        border-right: none
    }
    .el-cascader-menu:last-child .el-cascader-node {
        padding-right: 20px
    }
    .el-cascader-menu__wrap {
        height: 204px
    }
    .el-cascader-menu__list {
        position: relative;
        min-height: 100%;
        margin: 0;
        padding: 6px 0;
        list-style: none;
        -webkit-box-sizing: border-box;
        box-sizing: border-box
    }
    .el-avatar,
    .el-drawer {
        -webkit-box-sizing: border-box;
        overflow: hidden
    }
    .el-cascader-menu__hover-zone {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none
    }
    .el-cascader-menu__empty-text {
        position: absolute;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        text-align: center;
        color: #c0c4cc
    }
    .el-cascader-node {
        position: relative;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        padding: 0 30px 0 20px;
        height: 34px;
        line-height: 34px;
        outline: 0
    }
    .el-cascader-node.is-selectable.in-active-path {
        color: #606266
    }
    .el-cascader-node.in-active-path,
    .el-cascader-node.is-active,
    .el-cascader-node.is-selectable.in-checked-path {
        color: #4e6ef2;
        font-weight: 700
    }
    .el-cascader-node:not(.is-disabled) {
        cursor: pointer
    }
    .el-cascader-node:not(.is-disabled):focus,
    .el-cascader-node:not(.is-disabled):hover {
        background: #f5f7fa
    }
    .el-cascader-node.is-disabled {
        color: #c0c4cc;
        cursor: not-allowed
    }
    .el-cascader-node__prefix {
        position: absolute;
        left: 10px
    }
    .el-cascader-node__postfix {
        position: absolute;
        right: 10px
    }
    .el-cascader-node__label {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        padding: 0 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis
    }
    .el-cascader-node>.el-radio .el-radio__label {
        padding-left: 0
    }
}
</style>