/**
 * @file 富文本select插件
 * @author bigcui
 * 2021-09-03
 */

// level 指定output下一级
import {
    addEventPopper,
    css,
    getName
} from '@/components/quill-editor/util';
import Popper from './popper'
import Vue from "vue";
let eventHub = new Vue();
class SelfSelect {
    constructor(ParentNode, data, placeHolder) {
        this.value = data.value || '';
        this.placeHolder = placeHolder;
        this.list = data.list || [];
        this.selectVavList = this.value.split('/');
        this.ParentNode = ParentNode;
        this.levelIndex = 0; // 层级管理 flex布局
        this.selectWraperALL = document.createElement('div'); // 下拉框外包裹
        this.elCascaderpanel = document.createElement('div'); // 下拉框
        this.selectDiv = document.createElement('div'); // 输入框包括
        this.input = document.createElement('span'); // input可视区
        this.elCascaderpanel.className = 'el-cascader-panel';
        this.selectWraperALL.className = 'el-cascader__dropdown';
        this.selectDiv.className = 'select-input-value';
        this.input.className = 'input-inner';
        this.popperJSmode = null; // poper实例
        this.initPopper();
        this.createSelectInput()
        this.createPanel()
        this.ParentNode.appendChild(this.selectDiv);
        this.ParentNode.appendChild(this.selectWraperALL);
    }
    bindClick(dom, callback) {
        dom.onclick = (e) => {
            callback && callback.call(e)
        };
    }
    createSelectInput() {
        let selectTxt = document.createElement('div');
        let selectArrow = document.createElement('i');
        selectArrow.className='el-input__icon';
        selectTxt.className = 'input-wraper';
        selectTxt.appendChild(this.input);
        this.selectDiv.appendChild(selectTxt);
        this.selectDiv.appendChild(selectArrow);
        // 初始化数据input value
        this.resetInputValue(this.input);
        this.bindClick(this.selectDiv, () => {
            eventHub.$emit('updatepopperJS');
            this.selectDiv.classList.add('is-focus');
            if (selectArrow.className.includes('is-reverse')){
                selectArrow.classList.remove('is-reverse');
            }
            else {
                selectArrow.classList.add('is-reverse');
            }
            let status = css(this.selectWraperALL, 'display');
            css(this.selectWraperALL, 'display', status === 'none' ? 'block' : 'none');
            if(status === 'none') {
                this.selectDiv.classList.add('is-focus');
            }
            else {
                this.selectDiv.classList.remove('is-focus');
            }
        });
    }
    // 动态level 创建指定level
    createPanel(list = this.list, level) {
        let ul = document.createElement('ul');
        let len = list;
        let selectWraper = document.createElement('div');
        let selectDropDown = document.createElement('div');
        ul.className = 'el-scrollbar__view el-cascader-menu__list';
        selectWraper.className = 'el-scrollbar el-cascader-menu';
        selectDropDown.className = 'el-cascader-menu__wrap el-scrollbar__wrap'; +
        this.levelIndex++;
        if (level) {
            this.levelIndex = level;
        }
        for (let i = 0; i < len.length; i++) {
            let keyData = len[i];
            let li = document.createElement('li');
            createLi.call(this, li, keyData);
            this.liBindEvent(keyData, li, ul);
            // 历史数据回填
            this.resetOptionValue(list, keyData);
            ul.append(li);
        }
        selectDropDown.appendChild(ul);
        selectWraper.appendChild(selectDropDown);
        clearHistoryPanel.call(this);
        this.elCascaderpanel.appendChild(selectWraper);
        this.selectWraperALL.appendChild(this.elCascaderpanel);

        function clearHistoryPanel() {
            //场景1 创建当前指定子节点 clear历史节点
            if (level) {
                this.elCascaderpanel.childNodes[level - 1] && this.elCascaderpanel.removeChild(this.elCascaderpanel.childNodes[level - 1]);
            }
            // 场景2 所有已经展开的节点
            for (let l = this.elCascaderpanel.children.length; l >= 0; l--) {
                if (l > this.levelIndex - 2) {
                    this.elCascaderpanel.children[l] && this.elCascaderpanel.removeChild(this.elCascaderpanel.children[l]);
                }
            }
        }

        function createLi(li, keyData) {
            let span = document.createElement('span');
            span.innerHTML = keyData.name;
            span.className = 'el-cascader-node__label';
            li.setAttribute('code', keyData.code);
            li.setAttribute('level', this.levelIndex);
            li.appendChild(span);
            li.className = 'el-cascader-node';
            if (Object.keys(keyData.children || []).length) {
                let after = document.createElement('i');
                after.className = 'el-icon-check el-cascader-node__postfix';
                li.appendChild(after);
            }
            if (this.selectVavList.includes(keyData.code)) {
                li.classList.add('in-active-path');
            }
        }
    }
    resetOptionValue(list = this.list, keyData) {
        if (this.selectVavList.length) {
            let activedCode = this.selectVavList[this.levelIndex - 1];
            if (keyData.code === activedCode) {
                let subList = list.find(el => el.code == activedCode);
                // 二级回填 自动展开
                if (subList.children && subList.children.length && this.selectVavList.length > 1) {
                    Promise.resolve(1).then(() => {
                        this.createPanel(subList.children);
                    });
                }
            }
        }
    }
    liBindEvent(keyData, li, ul) {
        let setSelectPach = () => {
            let selectVal = [];
            let selectCode = [];
            let thisLevel = +li.getAttribute('level');
            if (thisLevel < this.levelIndex) {
                for (let l = this.elCascaderpanel.children.length; l >= 0; l--) {
                    // debugger
                    if (l > (this.levelIndex - thisLevel)) {
                        this.elCascaderpanel.children[l] && this.elCascaderpanel.removeChild(this.elCascaderpanel.children[l]);
                    }
                }
            }
            Promise.resolve(1).then(() => {
                this.selectWraperALL.querySelectorAll('.in-active-path').forEach(el => {
                    selectVal.push(el.innerText);
                    selectCode.push(el.getAttribute('code'));
                });
                this.input.innerHTML = selectVal.join('/');
                this.ParentNode.setAttribute('value', selectCode.join('/'));
                this.selectWraperALL.style.display = 'none';
            });
        };
        this.bindClick(li, () => {
            ul.children.forEach(el => {
                el.classList.remove('in-active-path');
            });
            li.classList.add('in-active-path');
            if (Object.keys(keyData.children || []).length) {
                // 点击的时候需要判断 是右侧更新数据 还是在右侧创建panel？看levelIndex是
                // 是否比自己大
                this.createPanel(keyData.children, +li.getAttribute('level') + 1);
            } else {
                setSelectPach();
                this.selectWraperALL.style.display = 'none';
            }
            // 更新弹窗poperjs
            setTimeout(() => {
                eventHub.$emit('updatepopperJS');
            });
        });
    }
    resetInputValue(dom) {
        let str = [];
        this.selectVavList.forEach(el => {
            str.push(getName(this.list, el));
        });
        dom.innerText = str.length > 1 ? str.join('/') : str.join('')
    }
    initPopper() {
        this.popperJSmode = new Popper(this.selectDiv, this.selectWraperALL, {
            placement: 'bottom-start'
        });
        this.popperJSmode.onCreate(_ => {
            this.popperJSmode.update();
        });
        eventHub.$on('updatepopperJS', _ => {
            this.popperJSmode.update();
        });
        addEventPopper(this.ParentNode, () => {
            setTimeout(() => {
                this.selectWraperALL.style.display = 'none';
                this.selectDiv.classList.remove('is-focus');
                this.selectDiv.querySelector('.el-input__icon').classList.remove('is-reverse');
            });
        });
    }
}

export default SelfSelect;
