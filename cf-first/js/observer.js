/*
 * @Author: SF2556
 * @Date:   2018-04-16 11:20:45
 * @Last Modified by:   DangChaofeng
 * @Last Modified time: 2018-04-16 16:18:42
 */
function Observer(data) {
    // data就是vue中的data数据
    this.data = data;
    this.walk(data);
}
Observer.prototype = {
    walk(data) {
        Object.keys(data).forEach((key) => {
            this.convertData(key, data[key]);
        });
    },
    convertData(key, val) {
    	// 监听一下值，内部会判断，如果是object则深层监听
    	let dep = new Dep();
    	observe(val);
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurable: false,
            get: () => {
            	if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set: (newVal) => {
            	if(newVal === val) return;
            	// TODO  这块和想象中不一样
            	val = newVal;
            	console.log(val, '----------------------------');
            	// this.data[key] = newVal;
            	// 新值就会监听，内部会判断，如果是object则监听
            	observe(newVal);
            	// 通知订阅者
            	dep.notify();
            }
        });
    }
}

function observe(data){
	// 值是object的话，进行监听
	if (!data || typeof data !== 'object') return;
	return new Observer(data);
}

// 定义dep，来保存订阅者
let uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}
Dep.prototype = {
    addSub(sub) {
        this.subs.push(sub);
    },
    removeSub(sub) {
        let index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },
    depend() {
        Dep.target.addDep(this);
    },
    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        });
    }
}
Dep.target = null;