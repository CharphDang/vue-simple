// 监听者的构造函数，进行数据的劫持监听。（包含子属性）
class Observer {
    constructor(data) {
        this.data = data;
        this.init(data);
    }
    init(data) {
        Object.keys(data).forEach((key) => {
            this._proxyData(key, data[key]);
        });
    }
    _proxyData(key, val) {
        let dep = new Dep();
        // 进行递归，每个值都需要判定是否是一个对象，如果是对象，则需要进行数据劫持。
        observe(val);
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurabled: false,
            get() {
                if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set(newVal) {
                if (val !== newVal) {
                    val = newVal;
                    observe(newVal);
                    dep.notify();
                }
            }
        })
    }
}

// 进行数据监听，data必须是一个对象才可以。
function observe(data) {
    if (!data || typeof data !== 'object') return;
    return new Observer(data);
}

// uuid 是为了限制订阅器的重复添加
let uuid = 0;
let num = 0;
// Dep是一个订阅器，用来收集订阅者，一个data的key值便生成一个订阅器。
class Dep {
    constructor() {
        this.id = uuid++;
        this.subs = [];
        num++;
        console.log(num);
    }
    // 为当前订阅器添加一个订阅者，（订阅者=> 一个key值，在DOM中被几处使用，那几处的节点就是订阅者）
    addSub(sub) {
        this.subs.push(sub);
        if (this.id === 4) {
            console.log(this.subs.length, 'subs', sub);
        }
    }
    // 当数据更新后，便通知所有的订阅者进行自己的更新函数，进行DOM刷新。
    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
    // 当前订阅器中添加订阅者。
    depend() {
        Dep.target.add(this);
    }
}

// 订阅者
Dep.target = null;