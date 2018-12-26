/*
 * @Author: SF2556
 * @Date:   2018-04-19 15:03:55
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-19 16:51:20
 */
function MVVM(options) {
    this.$options = options;
    let data = this._data = options.data;
    Object.keys(data).forEach((key) => {
        this._proxyData(key);
    });
    this._initComputed();
    observe(data);
    this.$compile = new Compile(options.el, this);
}
MVVM.prototype = {
    $watch(exp, cb){
         new Watcher(this, exp, cb);
    },
    _proxyData(key) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            get() {
                return this._data[key];
            },
            set(newVal) {
                this._data[key] = newVal;
            }
        });
    },
    _initComputed() {
        let computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach((key) => {
                Object.defineProperty(this, key, {
                    enumerable: true,
                    configurable: false,
                    get: typeof computed[key] === 'function' ?
                        computed[key] :
                        computed[key].get,
                    set() {}
                })
            })
        }
    }
}