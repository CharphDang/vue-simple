/*
 * @Author: SF2556
 * @Date:   2018-04-19 15:04:04
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-19 15:24:23
 */
function Observer(data) {
    this.data = data;
    this.init(data);
}
Observer.prototype = {
    init(data) {
        Object.keys(data).forEach((key) => {
            this._proxyData(this.data, key, data[key]);
        });
    },
    _proxyData(data, key, val) {
        let dep = new Dep();
        observe(val);
        Object.defineProperty(data, key, {
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