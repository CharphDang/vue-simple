/*
 * @Author: SF2556
 * @Date:   2018-04-21 08:17:04
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-21 09:30:58
 */
function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
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
    isDirective(dir) {
        return dir.indexOf('v-') === 0;
    },
    isEventDirective(dir) {
        return dir.indexOf('on') === 0;
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
        // for(let node of childNodes) {}
        [].slice.call(childNodes).forEach((node) => {
            let reg = /\{\{(.*)\}\}/;
            let text = node.textContent;
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        });
    },
    compileText(node, exp) {
        compileUtil.text(this.$vm, node, exp);
    },
    compile(node) {
        let nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach((attr) => {
            let attr_name = attr.name;
            let attr_value = attr.value;
            if (this.isDirective(attr_name)) {
                let dir = attr_name.slice(2);
                if (this.isEventDirective(dir)) {
                    this.eventHandle(node, dir, attr_value);
                } else {
                    compileUtil[dir] && compileUtil[dir](this.$vm, node, attr_value);
                }
                node.removeAttribute(attr_name);
            }
        });
    },
    eventHandle(node, dir, name) {
        let fn = this.$vm.$options.methods[name];
        let eventName = dir.split(':')[1];
        if (eventName && fn) {
            node.addEventListener(eventName, fn.bind(this.$vm), false);
        }
    }
}

var compileUtil = {
    html(vm, node, exp) {
        debugger;
        this.bind(vm, node, exp, 'html');
    },
    model(vm, node, exp) {
        this.bind(vm, node, exp, 'model');
        node.addEventListener('input', (e) => {
            let value = e.target.value;
            this._setVMVal(vm, exp, value);
        }, false);
    },
    text(vm, node, exp) {
        this.bind(vm, node, exp, 'text');
    },
    bind(vm, node, exp, dir) {
        let updaterFn = updater[dir + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        new Watcher(vm, exp, function(newVal, oldVal) {
            updaterFn && updaterFn(node, newVal);
        })
    },
    _getVMVal(vm, exp) {
        let val = vm;
        let exps = exp.split('.');
        exps.forEach((key) => {
            val = val[key];
        });
        return val;
    },
    _setVMVal(vm, exp, value) {
        let val = vm;
        let exps = exp.split('.');
        let len = exps.length - 1;
        exps.forEach((key, index) => {
            if (index < len) {
                val = val[key];
            } else {
                val[key] = value;
            }
        });
    }
}

var updater = {
    textUpdater(node, value) {
        node.textContent = typeof value === undefined ? '' : value;
    },
    modelUpdater(node, value) {
        node.value = typeof value === undefined ? '' : value;
    },
    htmlUpdater(node, value) {
        debugger;
        node.innerHTML = typeof value === undefined ? '' : value;
    }
}