> 设计模式是解决某个特定场景下对某种问题的解决方案。

## 原则

- 单一职责原则：一个类只负责一项职责。如果功能过于复杂就拆分开，每个部分保持独立。

- 开放/封闭原则：对扩展开放，对修改封闭。增加需求时，扩展新代码，而非修改已有代码。

- 里氏替换原则：当使用继承时，除添加新的方法完成新增功能外，尽量不要重写父类的方法，也尽量不要重载父类的方法。

- 接口隔离原则：保持接口的单一独立，将臃肿的接口拆分为独立的几个接口。

- 依赖倒置原则：面向接口编程，依赖于抽象而不依赖于具体，使用方只关注接口而不关注具体类的实现。

- 迪米特法则：一个对象应该对其他对象保持最少的了解。尽量降低类与类之间的耦合。

## 类别

- 创建型设计模式
  - 工厂：基于接口数据或事件生产几个派生类的一个实例
  - 抽象工厂：创建若干类系列的一个实例，无需详述具体的类
  - 原型：用于复制或克隆完全初始化的实例
  - 单例：一个类在全局访问点只有唯一一个实例
  - 生成器：从表示中分离对象构建，总是创建相同类型的对象
- 结构型设计模式
  - 装饰者：向对象动态添加备选的处理
  - 外观：隐藏整个子系统复杂性的唯一一个类
  - 享元：一个用于实现包含在别处信息的高效共享的细粒度实例
  - 适配器：匹配不同类的接口，因此类可以在不兼容接口的情况下共同工作
  - 代理：占位符对象代表真正的对象
  - 桥接：将对象接口从其实现中分离，因此它们可以独立进行变化
  - 组合：简单和复合对象的结构，使对象的总和不只是它各部分的总和
- 行为设计模式
  - 迭代器：顺序访问一个集合中的元素，无需了解该集合的内部工作原理
  - 中介者：在类之间定义简化的通信，以防止一组类显式引用彼此
  - 观察者：向多个类通知改变的方式，以确保类之间的一致性
  - 访问者：向类添加一个新的操作，无需改变类
  - 策略：在一个类中封装算法，将选择与实现分离
  - 备忘录：捕获对象的内部状态，以能够在以后恢复它
  - 职责链：在对象链之间传递请求的方法，以找到能够处理请求的对象
  - 状态：状态改变时，更改对象的行为

## 参考

- [设计模式六大原则](http://www.uml.org.cn/sjms/201211023.asp)
- [JS 常用设计模式总结](https://fanerge.github.io/2017/%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F%E6%80%BB%E7%BB%93.html)
- [前端渣渣唠嗑一下前端中的设计模式](https://juejin.cn/post/6844904138707337229)
