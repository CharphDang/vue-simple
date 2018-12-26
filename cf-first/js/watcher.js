/*
 * @Author: SF2556
 * @Date:   2018-04-16 11:20:55
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-16 16:02:56
 */
function Watcher(vm, expOrFun, cb) {
    this.cb = cb;
    this.vm = vm;
    this.expOrFun = expOrFun;
    this.depIds = {};
    if (typeof expOrFun === 'function') {
        this.getter = expOrFun;
    } else {
        this.getter = this.parseGetter(expOrFun);
    }
    this.value = this.get();
}

Watcher.prototype = {
    // 多级情况下深层遍历： eg: exp = parent.child.some;
    parseGetter: function(exp) {
        if (/[^\w.$]/.test(exp)) return;

        var exps = exp.split('.');

        return function(obj) {
            for (var i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        }
    },
    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },
    update: function() {
        this.run();
    },
    run: function() {
        var newVal = this.get();
        var oldVal = this.value;
        if (newVal !== oldVal) {
            this.value = newVal;
            this.cb.call(this.vm, newVal, oldVal);
        }
    },
    addDep(dep){
    	if(!this.depIds.hasOwnProperty(dep.id)){
    		dep.addSub(this);
    		this.depIds[dep.id] = dep;
    	}
    }
}