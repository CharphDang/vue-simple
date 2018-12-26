/*
* @Author: SF2556
* @Date:   2018-04-17 08:20:57
* @Last Modified by:   DangChaofeng
* @Last Modified time: 2018-04-17 13:53:13
*/
function MVVM(options) {
    this.$options = options || {};
    let data = this._data = options.data;
    // 实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach((key) => {
        this._proxyData(key);
    });
    // 对computed进行遍历，加入的数据劫持中;
    this._initComputed();
    // 在数据发生变化的时候，通知所有订阅者去搞事情
    observe(data, this);
    this.$compile = new Compile(options.el, this)
}
MVVM.prototype = {
    _proxyData(key) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            set: (newVal) => {
                this._data[key] = newVal;
            },
            get: () => {
                return this._data[key];
            }
        });
    },
    _initComputed() {
        let computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach((key) => {
                Object.defineProperty(this, key, {
                    get: typeof computed[key] === 'function' ?
                        computed[key] : computed[key].get,
                    set: () => {}
                });
            })
        }
    }
}