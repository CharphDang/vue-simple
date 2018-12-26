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
                this.compileText(node, RegExp.$1);
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        }
    },
    compileText(node, exp) {
    	updater['text'](node, this._getVMVal(exp));
        new Watcher(this.$vm, exp, function(newVal, oldVal) {
            updater['text'](node, newVal, oldVal);
        });
    },
    compile(node) {
        let nodeAttrs = node.attributes;
        for (let attr of nodeAttrs) {
            let attr_name = attr.name;
            if (attr_name === 'v-model') {
                let dir = attr.value;
                updater.model(node, this._getVMVal(dir));
                new Watcher(this.$vm, dir, function(newVal, oldVal) {
                    updater['model'](node, newVal, oldVal);
                });
                let val = this._getVMVal(dir);
                node.addEventListener('input', (e) => {
                    let newVal = e.target.value;
                    if (newVal !== val) {
                        this._setVMVal(dir, newVal);
                        val = newVal;
                    }
                }, false);
                node.removeAttribute(attr_name);
            }
        }
    },
    _getVMVal(exp) {
        return this.$vm[exp];
    },
    _setVMVal(exp, value) {
        this.$vm[exp] = typeof value == 'undefined' ? '' : value;
    }
}

var updater = {
    model(node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    text(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
}