function Watcher(vm, exp, cb) {
    this.$vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.subIds = {};
    this.value = this.get();
}

Watcher.prototype = {
    get() {
        Dep.target = this;
        let val = this.$vm[this.exp];
        Dep.target = null;
        return val;
    },
    update() {
        this.run();
    },
    run() {
    	let newVal = this.get();
        let oldVal = this.value;
        if (newVal !== oldVal) {
            this.value = newVal;
            this.cb.call(this.$vm, newVal, oldVal);
        }
    }
}