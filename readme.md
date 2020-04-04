# 简易Vue实现

参考[文章1](https://segmentfault.com/a/1190000006599500)

推荐[源码解析](https://github.com/lihongxun945/myblog/issues/22)

> 本人练习制作的[简易版vue](https://dangchaofeng.github.io/vue-simple/cf-result/)

> 演示版的源码（含清晰注释）[在这里](https://github.com/dangchaofeng/vue-simple/cf-result)

> 要实现简单的vue，必须掌握两点：

* 数据劫持，Object.defineProperty()
* 发布-订阅模式 

## 创建对象的方法

### 字面量创建法

```javascript
var people = {
    name: 'DangChaofeng',
    age: '25'
};
```

### 构造函数创建法

```	javascript
var people = new Object();
people.name = 'DangChaofeng';
people.age = '25';
```

创建出来的对象，我们可以对它进行任意操作，增删改查均可以。

Eg:

```	javascript
// 增加：
people.gender = 'man';
// 删除
delete people.gender;
// 修改
people.name = 'Suliang';
// 查(获取)
people.name
```

但是你们有没有想过，为什么我们可以对它进行增删改查呢？我们已经知道对象是一个键值对，key-value（属性-值）的存在，少有人去知道，对象属性还有自己的特性。

## 对象属性的四大特性

### 数据属性

```javascript
var obj = new Object();
Object.defineProperty(obj, 'name', {
    value: "Tom",
    writable: true,
    configurable: true,
    enumerable: true
});
```

### 访问器属性

```	javascript
var obj = new Object();
var tempVar = '123';
Object.defineProperty(obj, 'name', {
    configurable: true,
    enumerable: true,
    set: function(val){
        tempVar = val;
    },
    get: function(){
        return tempVar;
    }
});
```

这里需要说明下： 如果我们不使用Object.defineProperty()来创建属性，默认创建出来的属性的特性，均为true,如果使用Object.defineProperty()来创建属性，不写的特性，均默认为fasle。

如果我不写writable: true，则可写行性为false,赋值操作将失败。

VUE中的`数据劫持`，就是利用对象的访问器属性，通过Object.defineProperty()来劫持对象属性的setter和getter操作，在数据变动时做你想要做的事情。

## 发布-订阅者模式

> jq的$().on()、$().trigger()；就是典型的一种发布订阅模式实现。下来我们实现自己的一个简易版发布订阅者模式：

```js
function Public() {
  // 一个中间站，是用来收集存储并建立发布者和订阅者之间的联系：
  this.handlers = {};
}
Public.prototype = {
    // 订阅事件
    on: function(eventType, handler){
        var self = this;
        // 如果不存在这个事件，则初始化，值是一个数组。(因为对一个事件可以监听多次，挂不同的回调函数，所以事件名称对应多个事件函数).
        if(!(eventType in self.handlers)) {
           self.handlers[eventType] = [];
        } else {
           self.handlers[eventType].push(handler);
        }
        return this;
    },
     // 触发事件(发布事件) 循环执行事件对应的所有事件函数，并把参数带进入。
    emit: function(eventType){
       var self = this;
       var handlerArgs = Array.prototype.slice.call(arguments,1);
       for(var i = 0; i < self.handlers[eventType].length; i++) {
         self.handlers[eventType][i].apply(self,handlerArgs);
       }
       return self;
    },
    // 删除订阅事件
    off: function(eventType, handler){
        var currentEvent = this.handlers[eventType];
        var len = 0;
        if (currentEvent) {
            len = currentEvent.length;
            for (var i = len - 1; i >= 0; i--){
                if (currentEvent[i] === handler){
                    currentEvent.splice(i, 1);
                }
            }
        }
        return this;
    }
};
 
var Publisher = new Public();
 
//订阅事件a
Publisher.on('a', function(data){
    console.log(1 + data);
});
Publisher.on('a', function(data){
    console.log(2 + data);
});
 
//触发事件a
Publisher.emit('a', '我是第1次调用的参数');
 
Publisher.emit('a', '我是第2次调用的参数');　

//test
```




