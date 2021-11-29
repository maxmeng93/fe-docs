## TypeScript

[Ts 高手篇：22 个示例深入讲解 Ts 最晦涩难懂的高级类型工具](https://juejin.cn/post/6994102811218673700)
[TypeScript 高级用法](https://juejin.cn/post/6926794697553739784)
[你不知道的 TypeScript 高级类型](https://juejin.cn/post/6865860467307315207)
[重学 TypeScript](https://juejin.cn/post/7003171767560716302)
[ts 刷题](https://github.com/type-challenges/type-challenges/blob/master/README.zh-CN.md)
[来玩 TypeScript 啊，机都给你开好了](https://zhuanlan.zhihu.com/c_206498766)

### 泛型

泛型允许程序员在强类型程序设计语言中编写代码时使用一些以后才指定的类型，在实例化时作为参数指明这些类型。
泛型通过一对尖括号来表示(<>)，尖括号内的字符被称为类型变量，这个变量用来表示类型。

### 高级类型

1. 交叉类型（&）
   交叉类型说简单点就是将多个类型合并成一个类型，个人感觉叫做「合并类型」更合理一点，其语法规则和逻辑 “与” 的符号一致。
2. 联合类型（|）
   联合类型的语法规则和逻辑 “或” 的符号一致，表示其类型为连接的多个类型中的任意一个。
3. 类型别名（type）
   前面提到的交叉类型与联合类型如果有多个地方需要使用，就需要通过类型别名的方式，给这两种类型声明一个别名。类型别名与声明变量的语法类似，只需要把 const、let 换成 type 关键字即可。
4. 类型索引（keyof）
   keyof 类似于 Object.keys ，用于获取一个接口中 Key 的联合类型。
5. 类型约束（extends）
   这里的 extends 关键词不同于在 class 后使用 extends 的继承作用，泛型内使用的主要作用是对泛型加以约束。
6. 类型映射（in）
   in 关键词的作用主要是做类型的映射，遍历已有接口的 key 或者是遍历联合类型。
7. 条件类型（U ? X : Y）
   条件类型的语法规则和三元表达式一致，经常用于一些类型不确定的情况。

### 工具泛型

1. Partial
   Partial 用于将一个接口的所有属性设置为可选状态，首先通过 keyof T，取出类型变量 T 的所有属性，然后通过 in 进行遍历，最后在属性后加上一个 ?。
2. Required
   Required 的作用刚好与 Partial 相反，就是将接口中所有可选的属性改为必须的，区别就是把 Partial 里面的 ? 替换成了 -?。
3. Record
4. Pick
   Pick 主要用于提取接口的某几个属性。
5. Exclude
   Exclude 的作用与之前介绍过的 Extract 刚好相反，如果 T 中的类型在 U 不存在，则返回，否则抛弃。
6. Omit
   Omit 的作用刚好和 Pick 相反，先通过 Exclude<keyof T, K> 先取出类型 T 中存在，但是 K 不存在的属性，然后再由这些属性构造一个新的类型。
7. Readonly
8. Extract
   如果 T 中的类型在 U 存在，则返回，否则抛弃。
