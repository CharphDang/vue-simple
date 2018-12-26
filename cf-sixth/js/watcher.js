/*
 * @Author: SF2556
 * @Date:   2018-04-20 08:11:47
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-20 09:29:47
 */
function Watcher(vm, expOrFn, cb) {
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.cb = cb;
    this.ids = {};
    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this._parseGetter(expOrFn);
    }
    this.value = this.get();
}

Watcher.prototype = {
    addDep(dep) {
        if (!this.ids.hasOwnProperty(dep.id)) {
            this.ids[dep.id] = dep;
            dep.addSub(this);
        }
    },
    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },
    _parseGetter(exp) {
        let exps = exp.split('.');
        return function(obj) {
            let val = obj;
            exps.forEach((key) => {
                val = val[key];
            })
            return val;
        }
    },
    update() {
        let oldValue = this.value;
        let newValue = this.get();
        if (newValue !== oldValue) {
            this.cb.call(this.vm, newValue, oldValue);
        }
    }
}