/*
 * @Author: SF2556
 * @Date:   2018-04-19 08:08:22
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-19 09:48:06
 */
function Compile(el, vm) {
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    this.$vm = vm;
    if (this.$el) {
        this.$fragment = this.nodeToFragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    isElementNode(node) {
        return node.nodeType === 1;
    },
    isTextNode(node) {
        return node.nodeType === 3;
    },
    nodeToFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    init() {
        this.compileElement(this.$fragment);
    },
    compileElement(el) {
        let childNodes = el.childNodes;
        for (let node of childNodes) {
            let reg = /\{\{(.*)\}\}/;
            let text = node.textContent;
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                compileUtil.text(this.$vm, node, RegExp.$1);
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        }
    },
    compile(node) {
        let nodeAttrs = node.attributes;
        for (let attr of nodeAttrs) {
            let attr_name = attr.name;
            let exp = attr.value;
            if (attr_name === 'v-model') {
                compileUtil.model(this.$vm, node, exp);
                node.removeAttribute(attr_name);
            }
        }
    }
}

var compileUtil = {
    model(vm, node, exp) {
        this.bind(vm, node, exp, 'model');
        let val = this._getVMVal(vm, exp);
        node.addEventListener('input', (e) => {
            let newVal = e.target.value;
            if (newVal !== val) {
                val = newVal;
                this._setVMVal(vm, exp, newVal);
            }
        }, false)
    },
    text(vm, node, exp) {
        this.bind(vm, node, exp, 'text');
    },
    bind(vm, node, exp, dir) {
        let updateFun = updater[dir + 'Updater'];
        updateFun && updateFun(node, this._getVMVal(vm, exp));
        new Watcher(vm, exp, function(newVal, oldVal) {
            updateFun && updateFun(node, newVal, oldVal);
        })
    },
    _getVMVal(vm, exp) {
        let val = vm;
        let exps = exp.split('.');
        exps.forEach((item) => {
            val = val[item];
        });
        return val;
    },
    _setVMVal(vm, exp, newVal) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = newVal;
            }
        });
    }
}

var updater = {
    textUpdater(node, value) {
        node.textContent = value === undefined ? '' : value;
    },
    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
}