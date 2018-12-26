/*
 * @Author: SF2556
 * @Date:   2018-04-20 08:12:04
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-20 09:46:57
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
    compile(node) {
        let nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach((attr) => {
            let attr_name = attr.name;
            let attr_value = attr.value;
            if (this.isDirective(attr_name)) {
                let dir = attr_name.slice(2);
                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandle(this.$vm, node, attr_value, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](this.$vm, node, attr_value);
                }
                node.removeAttribute(attr_name);
            }
        });
    },
    compileText(node, exp) {
        compileUtil.text(this.$vm, node, exp);
    }

}

var compileUtil = {
    model(vm, node, exp) {
        this.bind(vm, node, exp, 'model');
        node.addEventListener('input', (e) => {
            let val = e.target.value;
            this._setVMVal(vm, exp, val);
        }, false);
        // 对相应的属性添加watch
        this.bind(vm, node, exp, 'model');

        // var me = this,
        //     val = this._getVMVal(vm, exp);
        // node.addEventListener('input', function(e) {
        //     var newValue = e.target.value;
        //     if (val === newValue) {
        //         return;
        //     }

        //     me._setVMVal(vm, exp, newValue);
        //     val = newValue;
        // });
    },
    text(vm, node, exp) {
        this.bind(vm, node, exp, 'text');
    },
    html(vm, node, exp) {
        this.bind(vm, node, exp, 'html');
    },
    class(vm, node, exp) {
        this.bind(vm, node, exp, 'class');
    },
    bind(vm, node, exp, dir) {
        let updaterFn = updater[dir + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        new Watcher(vm, exp, function(newVal, oldVal) {
            updaterFn(node, newVal, oldVal);
        });
    },
    eventHandle(vm, node, exp, dir) {
        let eventType = dir.split(':')[1];
        let fn = vm.$options.methods && vm.$options.methods[exp];
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    _getVMVal(vm, exp) {
        let exps = exp.split('.');
        let val = vm;
        exps.forEach((key) => {
            val = val[key];
        });
        return val;
    },
    _setVMVal(vm, exp, value) {
        let exps = exp.split('.');
        let val = vm;
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
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },

    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },

    classUpdater: function(node, value, oldValue) {
        var className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        var space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
}