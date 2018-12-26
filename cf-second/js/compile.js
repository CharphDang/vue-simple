/*
 * @Author: SF2556
 * @Date:   2018-04-17 08:20:50
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-17 14:36:54
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
    isEventDir(dir) {
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
        for (let node of childNodes) {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, RegExp.$1);
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        }
    },
    compile(node) {
        let attrs = node.attributes;
        for (let attr of attrs) {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let dir_name = attrName.slice(2);
                let dir_val = attr.value;
                if (this.isEventDir(dir_name)) {
                    compileUtil.eventHandle(node, this.$vm, dir_name, dir_val);
                } else {
                    compileUtil[dir_name] && compileUtil[dir_name](node, this.$vm, dir_val)
                }
                node.removeAttribute(attrName);
            }
        }
    },
    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    }
}
var compileUtil = {
	text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },
    eventHandle(node, vm, dir_name, dir_val) {
        let eventName = dir_name.split(':')[1];
        let eventFn = vm.$options.methods && vm.$options.methods[dir_val];
        if (eventName && eventFn) {
            node.addEventListener(eventName, eventFn.bind(vm), false);
        }
    },
    model(node, vm, dir_val) {
        this.bind(node, vm, dir_val, 'model');
        let val = this._getVMVal(vm, dir_val);
        node.addEventListener('input', (e) => {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            this._setVMVal(vm, dir_val, newValue);
            val = newValue;
        });
    },
    bind(node, vm, dir_val, dir_name) {
        let updaterFn = updater[dir_name + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, dir_val));
        new Watcher(vm, dir_val, function(newVal, oldVal) {
            updaterFn && updaterFn(node, newVal, oldVal);
        });
    },
    _getVMVal: function(vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
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
};