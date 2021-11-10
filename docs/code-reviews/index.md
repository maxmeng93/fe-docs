## 一、全排列问题

`题目描述：给定一个没有重复数字的序列，返回其所有可能的全排列。`

```
示例：
输入: [1,2,3]
输出: [
[1,2,3],
[1,3,2],
[2,1,3],
[2,3,1],
[3,1,2],
[3,2,1]
]
```

### 思路分析

<!-- ![blockchain](~/assets/code-reviews/1.png) -->

问题变成了，我手里有 3 个数，要往这 3 个坑里填，有几种填法？我们一个一个坑来看：

- Step1：面对第一个坑，我有 3 种选择：填 1、填 2、填 3，随机选择其中一个填进去即可。
- Step2：面对第二个坑，由于 Step1 中已经分出去 1 个数字，现在只剩下 2 个选择：比如如果 Step1 中填进去的是 1，那么现在就剩下 2、3；如果 Step1 中填进去的是 2，那么就剩下 1、3。
- Step3： 面对第三个坑，由于前面已经消耗了 2 个数字，此时我们手里只剩下 1 个数字了。所以说第 3 个坑是毫无悬念的，它只有 1 种可能。  
  ![blockchain](~/assets/code-reviews/2.png)

在以上的“填坑”过程中，我们重复地做了以下事情：

- 检查手里剩下的数字有哪些
- 选取其中一个填进当前的坑里

### 递归边界

坑位的个数是已知的，我们可以通过记录当前坑位的索引来判断是否已经走到了边界：
比如说示例中有 n 个坑，假如我们把第 1 个坑的索引记为 0 ，那么索引为 n-1 的坑就是递归式的执行终点，索引为 n 的坑（压根不存在）就是递归边界

### 代码

```javascript
const permute = function (nums) {
  const len = nums.length;
  const current = [];
  const visited = {};
  const res = [];
  const dfs = (nth) => {
    if (nth === len) {
      // 递归边界：坑位已经填满，将对应的排列记录下来
      res.push(current.slice());
      return;
    }
    for (let index = 0; index < len; index++) {
      const visitNum = nums[index];
      if (!visited[visitNum]) {
        visited[visitNum] = 1;
        current.push(visitNum); // 将元素放进坑
        dfs(nth + 1); // 基于该选择，继续往下递归，考察下一个数
        current.pop(); // 让出当前坑位
        visited[nums[index]] = 0;
      }
    }
  };
  dfs(0); // 对第一个坑位进行赋值
  return res;
};

console.log(JSON.stringify(permute([1, 2, 3])));
```

### 运行结果

```
$ node algorithm-1.js
[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

## 二、组合问题

`题目描述：给定一组不含重复元素的整数数组 nums，返回该数组所有可能的子集（幂集）。说明：解集不能包含重复的子集。`

```
示例: 输入: nums = [1,2,3]
输出:
[
[3],
[1],
[2],
[1,2,3],
[1,3],
[2,3],
[1,2],
[]
]
```

### 思路分析

- 单看每个元素，都有两种选择：选入子集，或不选入子集。
- 比如[1,2,3]，先看 1，选 1 或不选 1，都会再看 2，选 2 或不选 2，以此类推。
- 考察当前枚举的数，基于选它而继续，是一个递归分支；基于不选它而继续，又是一个分支
  ![blockchain](~/assets/code-reviews/3.png)
- 用索引 index 代表当前递归考察的数字 nums[index]。
- 当 index 越界时，所有数字考察完，得到一个解，位于递归树的底部，把它加入解集，结束当前递归分支。

为什么要回溯？

- 因为不是找到一个子集就完事。
- 找到一个子集，结束递归，要撤销当前的选择，回到选择前的状态，做另一个选择——不选当前的数，基于不选，往下递归，继续生成子集。
- 回退到上一步，才能在包含解的空间树中把路走全，回溯出所有的解。
  ![blockchain](~/assets/code-reviews/4.png)

### 代码

```javascript
// 方法一
const subsets = function (nums) {
  const res = [];
  const current = [];
  const len = nums.length;
  const dfs = (index) => {
    if (index === len) {
      // 递归边界:指针越界
      res.push(current.slice());
      return;
    }
    current.push(nums[index]); // 选择这个数
    dfs(index + 1); // 基于该选择，继续往下递归，考察下一个数
    current.pop(); // 上面的递归结束，撤销该选择
    dfs(index + 1);
  };
  dfs(0); // 对第一个元素，进行 选 或 不选 的操作
  return res;
};

console.log(JSON.stringify(subsets([1, 2, 3])));
```

### 运行结果

```
$ node algorithm-2.js
[[1,2,3],[1,2],[1,3],[1],[2,3],[2],[3],[]]
```

## 三、限定组合问题

`题目描述：给定两个整数 n 和 k，返回 1 ... n 中所有可能的 k 个数的组合。`

```
示例: 输入: n = 4, k = 2
输出:
[
[2,4],
[3,4],
[2,3],
[1,2],
[1,3],
[1,4],
]
```

### 思路分析

这是一道复杂化的组合问题，它追加了一个限定条件——只返回 n 个数中 k 个数的组合
假如 n=3， k=2，那么需要输出的内容就如下图的红色箭头所示:
![blockchain](~/assets/code-reviews/5.png)
只有双向箭头所指的结点组合被认为是有效结果，其它结点都被丢弃了。在寻找这三对结点组合的过程中，我们一旦找到一对，就停止继续往深处搜索，这就意味着一些结点压根没有机会被遍历到。
这其实就是“剪枝”的过程——在深度优先搜索中，有时我们会去掉一些不符合题目要求的、没有作用的答案，进而得到正确答案。这个丢掉答案的过程，形似剪掉树的枝叶，所以这一方法被称为“剪枝”。

### 递归式与递归边界

- 看看手里有哪些元素，取一个放进 current 数组保存，或者不放。基于当前选择(放或不放)，往下递归
- 当 current 数组放满时(current.len === k)，结束递归

### 代码

```javascript
const combine = function (n, k) {
  const res = [];
  const current = [];
  const dfs = (nth) => {
    if (current.length === k) {
      res.push(current.slice());
      return;
    }
    for (let index = nth + 1; index <= n; index++) {
      current.push(index); // 当前元素进行取值，填坑
      dfs(index); // 基于当前选择，继续往下递归，考察下一个数
      current.pop(); // 不放当前元素。考察下一个数
    }
  };
  dfs(0); // 对第一个元素，进行 放 或 不放 的操作
  return res;
};

console.log(JSON.stringify(combine(4, 2)));
```

### 运行结果

```
$ node algorithm-3.js
[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
```
