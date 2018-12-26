class MVVM {
    constructor(options) {
        // 备份，编译时会用到。对methods引用
        this.$options = options;
        let data = this._data = options.data;
        // 对data数据进行封装， vm.data.key =>  vm.key
        Object.keys(data).forEach((key) => {
            this._proxyData(key);
        });
        // 对对象的值全部进行数据劫持，在劫持中，添加订阅者。并在数据更新时通知订阅者的更新函数进行更新。
        observe(data);
        // 对computed函数进行初始化。
        this._initComputed();
        // 对DOM文档进行编译，将v-model等指令消除，并new出各自的订阅者。
        this.$compile = new Compile(options.el, this);
    }
    $watch(exp, cb) {
        new Watcher(this, exp, cb);
    }
    _proxyData(key) {
        // 将vm.data.key 转变为vm.key
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            get() {
                return this._data[key];
            },
            set(newVal) {
                this._data[key] = newVal;
            }
        })
    }
    _initComputed() {
        let computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach((key) => {
                Object.defineProperty(this, key, {
                    enumerable: true,
                    configurable: false,
                    get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
                    set: function() {}
                })
            })
        }
    }
}