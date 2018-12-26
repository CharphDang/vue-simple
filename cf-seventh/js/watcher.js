/*
 * @Author: SF2556
 * @Date:   2018-04-21 08:16:57
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-23 08:06:52
 */
function Watcher(vm, expOrFun, cb) {
    this.vm = vm;
    this.expOrFun = expOrFun;
    this.cb = cb;
    this.ids = {};
    if (typeof expOrFun === 'function') {
        this.getter = expOrFun;
    } else {
        this.getter = this._parseGetter(expOrFun);
    }
    this.value = this.get();
}

Watcher.prototype = {
    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },
    update() {
        let oldVal = this.value;
        let newVal = this.get();
        this.cb.call(this.vm, newVal, oldVal);
    },
    addDep(dep) {
        if (!this.ids.hasOwnProperty(dep.id)) {
            this.ids[dep.id] = dep;
            dep.addSub(this);
        }
    },
    _parseGetter(exp) {
        let exps = exp.split('.');
        return function(obj) {
            let val = obj;
            exps.forEach((key) => {
                val = val[key];
            });
            return val;
        }
    }
}