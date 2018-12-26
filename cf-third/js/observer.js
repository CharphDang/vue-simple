function Observer(data) {
    this.data = data;
    this.init(data);
}

Observer.prototype = {
    init(data) {
        this.convert(data);
    },
    convert(data) {
        Object.keys(data).forEach((key) => {
            this._proxyData(key, data[key]);
        });
    },
    _proxyData(key, val) {
        let dep = new Dep();
        observe(val);
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurable: false,
            get() {
                if (Dep.target) {
                	let subIds = Dep.target.subIds;
                	if (!subIds.hasOwnProperty(dep.id)) {
                		subIds[dep.id] = dep;
                		console.log(111);
                		dep.addSub(Dep.target);
                	}
                }
                return val;
            },
            set(newVal) {
                if (newVal === val) return;
                val = newVal;
                observe(newVal);
                dep.notify();
            }
        })
    }
}

function observe(data) {
    if (!data || typeof data !== 'object') return;
    return new Observer(data);
}

let uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}
Dep.prototype = {
    addSub(sub) {
        this.subs.push(sub);
    },
    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
}