function Observer(data) {
    this.data = data;
    this.init(data);
}

Observer.prototype = {
    init(data) {
        Object.keys(data).forEach((key) => {
            this.convert(key, data[key]);
        })
    },
    convert(key, val) {
        let dep = new Dep();
        observe(val);
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurable: false,
            get() {
                if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set(newVal) {
                if (newVal !== val) {
                    val = newVal;
                    observe(newVal);
                    dep.notify();
                }
            }
        });
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
    },
    depend() {
        Dep.target.addDep(this);
    }
}
Dep.target = null;