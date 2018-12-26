/*
 * @Author: SF2556
 * @Date:   2018-04-16 11:21:07
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-16 16:02:29
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
        return node.nodeType == 1;
    },
    isTextNode(node) {
        return node.nodeType == 3;
    },
    isDirective(attr) {
    	return attr.indexOf('v-') === 0;
    },
    isEventDirective(dir){
    	return dir.indexOf('on') === 0;
    },
    nodeToFragment(node) {
        let fragment = document.createDocumentFragment();
        let child;
        while (child = node.firstChild) {
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
        let nodeAttrs = node.attributes;
        for (let attr of nodeAttrs) {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
            	let dir_name = attrName.slice(2);
            	let dir_val = attr.value;
            	if (this.isEventDirective(dir_name)) {
            		compileUtil.eventHandler(node, this.$vm, dir_val, dir_name);
            	} else {
            		compileUtil[dir_name] && compileUtil[dir_name](node, this.$vm, dir_val);
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

    model: function(node, vm, exp) {
        // 对相应的属性添加watch
        this.bind(node, vm, exp, 'model');

        var me = this,
            val = this._getVMVal(vm, exp);
        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    },

    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];

        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function(value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function(node, vm, exp, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
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
};

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