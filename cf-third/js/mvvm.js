function MVVM(options){
	this.$options = options || {};
	this.data = _data = options.data;
	// 实现 vm.xxx -> vm._data.xxx
    Object.keys(_data).forEach((key) => {
        this._proxyData(key);
    });
	observe(_data);
	new Compile(options.el, this);
}
MVVM.prototype = {
	_proxyData(key) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            set: (newVal) => {
                this.data[key] = newVal;
            },
            get: () => {
                return this.data[key];
            }
        });
    }
}