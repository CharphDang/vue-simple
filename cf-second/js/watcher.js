/*
 * @Author: SF2556
 * @Date:   2018-04-17 08:20:37
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-17 14:10:19
 */
function Watcher(vm, expOrFun, cb) {
    this.vm = vm;
    this.cb = cb;
    this.expOrFun = expOrFun;
    // 保存订阅者的ID；
    this.depIds = {};
    if (typeof expOrFun === 'function') {
        this.getter = expOrFun;
    } else {
        this.getter = this.parseGetter(expOrFun);
    }
    this.value = this.get();
}

Watcher.prototype = {
    update() {
        this.run();
    },
    run() {
        let newVal = this.get();
        let oldVal = this.value;
        if (newVal !== oldVal) {
            this.value = newVal;
            this.cb.call(this.vm, newVal, oldVal);
        }
    },
    addDep(dep) {
    	if (!this.depIds.hasOwnProperty(dep.id)) {
    		dep.addSub(this);
    		this.depIds[dep.id] = dep;
    	}
    },
    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },

    parseGetter(exp) {
        if (/[^\w.$]/.test(exp)) return;
        let exps = exp.split('.');
        let len = exps.length;
        return function(obj) {
        	for (let i = 0 ; i < len; i++) {
        		if (!obj) return;
        		obj = obj[exps[i]];
        	}
        	return obj;
        }
    }
}