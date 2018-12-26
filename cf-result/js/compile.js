// 编译的构造函数
class Compile {
    constructor(el, vm) {
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);
        this.$vm = vm;
        if (this.$el) {
            // 首先创建一个新的文档片段，将DOM中的节点移过来，然后进行init操作。
            this.$fragment = this.nodeToFragment(this.$el);
            this.init();
            // 当DOM节点都编译完，订阅者都实例化后，将文档片段重新加入到DOM中
            this.$el.appendChild(this.$fragment);
        }
    }
    // 是否是元素节点，1
    isElementNode(node) {
        return node.nodeType === 1;
    }
    // 是否是文本节点，3       注释节点的nodeType是2
    isTextNode(node) {
        return node.nodeType === 3;
    }
    // 是指令节点吗？ ‘v-’ 开头的便是
    isDirective(dir) {
        return dir.indexOf('v-') === 0;
    }
    // 是事件节点吗？ ‘v-’后面直接跟着'on'便是
    isEventDirective(dir) {
        return dir.indexOf('on') === 0;
    }
    // 创建文档碎片，将原DOM中节点移入进来。
    nodeToFragment(el) {
        let fragment = document.createDocumentFragment();
        let child;
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }
    // 对文档片段进行编译。
    init() {
        this.compileElement(this.$fragment);
    }
    // 编译文档的节点，判断是否是元素节点，如果是，则进行元素节点的编译，如果不是，则判断是否是文本节点，并使用正则匹配对应的exp
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

            // 当node还有自己的子节点，并且子节点length不为0
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    }
    // 编译文本节点，
    compileText(node, exp) {
        compileUtil.text(this.$vm, node, exp);
    }
    // 编译元素节点，判定是事件指令还是普通指令。然后将其指令的属性移除。
    compile(node) {
        let nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach((attr) => {
            let attr_name = attr.name;
            let attr_value = attr.value;
            if (this.isDirective(attr_name)) {
                let dir = attr_name.slice(2);
                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandle(this.$vm, node, dir, attr_value);
                } else {
                    compileUtil[dir] && compileUtil[dir](this.$vm, node, attr_value);
                }
                node.removeAttribute(attr_name);
            }
        });
    }
}

// 编译工具
let compileUtil = {
    // 对各个指令进行编译，绑定相应的更新DOM值的函数，进行初始化更新试图并new处对应的订阅者。订阅者初始化后，便会调用自身的get()，触发数据劫持，添加到订阅器中。
    bind(vm, node, exp, dir) {
        let updaterFn = updater[dir + 'Updater'];
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        new Watcher(vm, exp, function(newVal, oldVal) {
            updaterFn && updaterFn(node, newVal);
        })
    },
    // 事件处理， 对DOM中引用的方法进行对应的监听，并在编译阶段绑定其this到当前的VM上。
    eventHandle(vm, node, dir, exp) {
        let eventName = dir.split(':')[1];
        let fn = vm.$options.methods[exp];
        if (eventName && fn) {
            node.addEventListener(eventName, fn.bind(vm), false);
        }
    },
    // 对元素的input事件进行监听，并执行相应的赋值。
    model(vm, node, exp) {
        this.bind(vm, node, exp, 'model');
        node.addEventListener('keyup', (e) => {
            let value = e.target.value;
            this._setVMVal(vm, exp, value);
        }, false)
    },
    text(vm, node, exp) {
        this.bind(vm, node, exp, 'text');
    },
    html(vm, node, exp) {
        this.bind(vm, node, exp, 'html');
    },
    // 获取当前值
    _getVMVal(vm, exp) {
        let exps = exp.split('.');
        let val = vm;
        exps.forEach((key) => {
            val = val[key];
        })
        return val;
    },
    // 设置当前的值，自己会触发数据劫持
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
        })
    }
}

// 不同指令的更新函数，目前只实现了model、text、html三种。
let updater = {
    modelUpdater(node, value) {
        return node.value = value === undefined ? '' : value;
    },
    textUpdater(node, value) {
        return node.textContent = value === undefined ? '' : value;
    },
    htmlUpdater(node, value) {
        return node.innerHTML = value === undefined ? '' : value;
    }
}