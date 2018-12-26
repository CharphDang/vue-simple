/*
 * @Author: SF2556
 * @Date:   2018-04-19 08:07:54
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-19 09:46:39
 */
function Watcher(vm, exp, cb) {
    this.$vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.ids = {};
    this.getter = this.parseGetter(exp);
    this.value = this.get();
}

Watcher.prototype = {
    addDep(dep){
        if(!this.ids.hasOwnProperty(dep.id)) {
            this.ids[dep.id] = dep;
            dep.addSub(this);
        }
    },
    get() {
        Dep.target = this;
        let val = this.getter.call(this.$vm, this.$vm);
        Dep.target = null;
        return val;
    },
    update() {
        let newVal = this.get();
        var oldVal = this.value;
        if (newVal !== oldVal) {
            this.cb.call(this.$vm, newVal, oldVal);
        }
    },
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
    }
}