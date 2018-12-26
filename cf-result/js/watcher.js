// 订阅者， 每一个使用到data中的属性的DOM节点，都是一个订阅者；
class Watcher {
    constructor(vm, expOrFun, cb) {
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
    // 每个订阅者初始化的时候，调用get，这个方法会触发监听者observe中数据劫持的get()方法，进行订阅者的添加。
    get() {
        Dep.target = this;
        let value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    }
    // 获取当前最新的值，利用闭包的特性，obj就是当前的VM，exp便是当前的引用值（some.name）。
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
    // 向订阅器中添加订阅者，利用id去判定是否添加过，防止重复添加。
    add(dep) {
        if (!this.ids.hasOwnProperty(dep.id)) {
            this.ids[dep.id] = dep;
            dep.addSub(this);
        }
    }
    // 更新函数，当数据劫持拿到最新值时，变通知每个订阅者执行各自的更新函数。
    update() {
        // 首先拿到旧值， 然后通过get方法拿到新值， 对比两者之间，如果不同，则进行更新
        let oldVal = this.value;
        let newVal = this.get();
        if (newVal !== oldVal) {
            // 更新的时候，将旧值更新为当前值，然后执行回调函数
            this.value = newVal;
            this.cb.call(this.vm, newVal, oldVal);
        }
    }
}