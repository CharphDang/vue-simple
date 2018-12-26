/*
 * @Author: SF2556
 * @Date:   2018-04-21 08:16:31
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-21 08:33:47
 */
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
        observe(val);
        let dep = new Dep();
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
    },
    depend() {
        Dep.target.addDep(this);
    }
}
Dep.target = null;