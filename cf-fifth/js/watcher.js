/*
 * @Author: SF2556
 * @Date:   2018-04-19 15:04:14
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-19 16:52:32
 */
function Watcher(vm, expOrFun, cb) {
    this.vm = vm;
    this.expOrFun = expOrFun;
    this.cb = cb;
    this.ids = {};
    if (typeof expOrFun === 'function') {
        debugger;
        this.getter = expOrFun;
    } else {
        this.getter = this._parseGetter(expOrFun);
    }
    this.value = this.get();
}

Watcher.prototype = {
    addDep(dep){
        if(!this.ids.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.ids[dep.id] = dep;
        }
    },
    update() {
        this.run();
    },
    run() {
        let oldVal = this.value;
        let newVal = this.get();
        if (newVal !== oldVal) {
            this.cb.call(this.vm, newVal, oldVal);
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
            });
            return val;
        }
    }
}