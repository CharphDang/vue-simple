function MVVM(options) {
    this.$options = options;
    let data = this._data = this.$options.data;
    Object.keys(data).forEach((key) => {
        this._proxyData(key, data[key]);
    });
    observe(data);
    new Compile(options.el, this);
}
MVVM.prototype = {
    _proxyData(key, val) {
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
    },
    _initComputed() {
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach((key) => {
                Object.defineProperty(this, key, {
                    get: typeof computed[key] === 'function' ?
                        computed[key] :
                        computed[key].get,
                    set: function() {}
                });
            });
        }
    }
}