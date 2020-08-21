## 模板方法模式

模板方法模式，是一种基于继承的设计模式。

模板方法模式由两部分结构组成，第一部分是抽象父类，第二部分是具体的实现子类。通常再抽象父类中封装了子类的算法框架，包括实现一些公共方法以及封装子类中所有方法的执行顺序。子类通过继承这个抽象类，也继承了整个算法结构，并且可以选中重写父类的方法。

### 举个例子 —— Coffee or Tea

首先，我们来泡一杯咖啡，如果没有什么太个性的需求，泡咖啡的步骤通常如下：

1. 把水煮沸
2. 用沸水冲泡咖啡
3. 把咖啡倒进杯子
4. 加糖和牛奶

**▼实现泡咖啡**

```js
var Coffee = function () {}

Coffee.prototype.boilWater = function () {
  console.log('把水煮沸')
}

Coffee.prototype.brewCoffeeGriends = function () {
  console.log('用沸水冲泡咖啡')
}

Coffee.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子')
}

Coffee.prototype.addSugarAndMilk = function () {
  console.log('加糖和牛奶')
}

Coffee.prototype.init = function () {
  this.boilWater()
  this.brewCoffeeGriends()
  this.pourInCup()
  this.addSugarAndMilk()
}

var coffee = new Coffee()
coffee.init()
```

接下来，开始准备泡茶，泡茶的步骤和泡咖啡相差并不大：

1. 把水煮沸
2. 用沸水浸泡茶叶
3. 把茶水倒进杯子
4. 加柠檬

**▼实现泡茶**

```js
var Tea = function () {}

Tea.prototype.boilWater = function () {
  console.log('把水煮沸')
}

Tea.prototype.steepTeaBag = function () {
  console.log('用沸水浸泡茶叶')
}

Tea.prototype.pourInCup = function () {
  console.log('把茶水倒进杯子')
}

Tea.prototype.addLemon = function () {
  console.log('加柠檬')
}

Tea.prototype.init = function () {
  this.boilWater()
  this.steepTeaBag()
  this.pourInCup()
  this.addLemon()
}

var tea = new Tea()
tea.init()
```

可以对比发现，泡茶和泡咖啡的过程是有很多共通之处的。不管是泡茶还是泡咖啡，都可以整理为以下四个步骤：

1. 把水煮沸
2. 用沸水冲泡饮料
3. 把饮料倒进杯子
4. 加调料

我们可以创建一个抽象父类来表示泡一杯饮料的过程：

**▼抽象父类**

```js
var Beverage. = function () {}

Beverage.prototype.boilWater = function {
  console.log('把水煮沸')
}

Beverage.prototype.brew = function () {} // 空方法，应该由子类重写

Beverage.prototype.pourInCup = function () {} // 空方法，应该由子类重写

Beverage.prototype.addCondiments = function () {} // 空方法，应该由子类重写

Beverage.prototype.init = function () {
  this.boilWater()
  this.brew()
  this.pourInCup()
  this.addCondiments()
}
```

**▼创建Coffee子类和Tea子类**

```js
var Coffee = function () {}

Coffee.prototype = new Beverage()
// 重写父类方法
Coffee.prototype.brew = function () {
  console.log('用沸水冲泡咖啡')
}
Coffee.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子')
}
Coffee.prototype.addCondiments = function () {
  console.log('加糖和牛奶')
}

var coffee = new Coffee()
coffee.init()
```

```js
var Tea = function () {}

Tea.prototype = new Beverage()
// 重写父类方法
Tea.prototype.brew = function () {
  console.log('用沸水浸泡茶叶')
}
Tea.prototype.pourInCup = function () {
  console.log('把茶水倒进杯子')
}
Tea.prototype.addCondiments = function () {
  console.log('加柠檬')
}

var tea = new Tea()
tea.init()
```

而以上的实现中`Beverage.prototype.init`被称为模板方法，**因为该方法中封装了子类的算法框架，它作为一个算法的模板，指导子类以何种顺序去执行哪些方法**。

### 抽象类

在Java中，类分为两种，一种为具体类，另一种为抽象类。具体类可以被实例化，抽象类不能被实例化。抽象类的作用就是**用来被某些具体类继承的**。

抽象类中包含**抽象方法**与**具体方法**。抽象方法没有具体的实现过程，例如`Beverage`中的`brew`方法。具体方法就是实现了具体过程的方法，这些方法通常是为了节省代码达到复用的效果，例如`Beverage`中的`boilWater`方法。

由于JavaScript并没有从语法层面提供抽象类的支持，我们在编写代码时得不到任何形式的警告，完全依托与程序员的记忆力和自觉性，这是相当不好的。所以需要变通的解决方法：

* 用鸭子类型来模拟接口检查，以便确保子类中确实重写了父类的方法。但模拟接口检查会带来不必要的复杂性，而且要求程序员主动进行这些接口检查，这就要求我们在业务代码中添加一些跟业务逻辑无关的代码。
* 让`Beverage.prototype.brew`等抽象方法直接抛出异常错误，如果忘记在子类中改写，那么至少会在程序运行时得到一个错误。这种方式实现简单并且代价很少，但是得到错误信息的时间有点太靠后。

```js
Beverage.prototype.brew = function () {
  throw new Error('子类必须重写brew方法')
}
```

### 钩子方法

钩子方法（hook）主要是用于解决在模板方法模式中，为一些需要“个性”需求的子类提供接口。例如冲泡饮料的` Beverage`类，某些客户需要满足不加料的需求，这里我们就可以加上一个`customerWantsCondiments`的钩子方法：

```js
var Beverage. = function () {}

Beverage.prototype.boilWater = function {
  console.log('把水煮沸')
}

Beverage.prototype.brew = function () {
  throw new Error('子类必须重写brew方法')
}

Beverage.prototype.pourInCup = function () {
  throw new Error('子类必须重写pourInCup方法')
}

Beverage.prototype.addCondiments = function () {
  throw new Error('子类必须重写addCondiments方法')
}

Beverage.prototype.customerWantsCondiments = function () {
  return true // 默认需要调料
}

Beverage.prototype.init = function () {
  this.boilWater()
  this.brew()
  this.pourInCup()
  if (this.customerWantsCondiments()) { // 如果挂钩返回true,则需要调料
    this.addCondiments()
  }
}
```

## 好莱坞原则

> 好莱坞无疑是演员的天堂，但好莱坞也有很多找不到工作的新人演员，许多新人演员在好莱 坞把简历递给演艺公司之后就只有回家等待电话。有时候该演员等得不耐烦了，给演艺公司打电 话询问情况，演艺公司往往这样回答：“不要来找我，我会给你打电话。” 

在程序设计中，我们允许底层组件将自己挂钩到高层组件中，而高层组件则会决定什么时候，以何种方式去使用这些底层组件。高层组件对待底层组件的方式，跟演艺公司对待新人演员一样，都是“别调用我们，我们会调用你”。

在模板方法模式、发布-订阅模式与回调函数中，都符合这一原则。

