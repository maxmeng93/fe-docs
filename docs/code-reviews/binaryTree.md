## 二叉树的遍历

以一定的顺序规则，逐个访问二叉树的所有结点。按照顺序规则的不同，遍历方式有以下四种：

- 先序遍历：根结点 -> 左子树 -> 右子树
- 中序遍历：左子树 -> 根结点 -> 右子树
- 后序遍历：左子树 -> 右子树 -> 根结点
- 层次遍历

## 遍历方法图解与编码实现

以先序遍历为例，举一反三。先序遍历的“旅行路线”如下图红色数字 所示：
![blockchain](~/assets/code-reviews/6.png)
如果说有 N 多个子树，那么我们<font color=red>**在每一棵子树内部，都要重复这个“旅行路线”**</font>，动画演示如下：
![blockchain](~/assets/code-reviews/7.gif)

### 递归函数的编写要点

- 递归式：遍历根结点 -> 左结点 -> 右结点。对每个子树，重复这个旅行路线。
- 递归边界：结点为空时，结束。

### 代码

```javascript
const root = {
  val: "A",
  left: {
    val: "B",
    left: {
      val: "D",
    },
    right: {
      val: "E",
    },
  },
  right: {
    val: "C",
    right: {
      val: "F",
    },
  },
};

function preOrder(root) {
  if (!root) return;
  console.log("当前遍历的结点值是：", root.val);
  preOrder(root.left);
  preOrder(root.right);
}
console.log(preOrder(root));
```

### 运行结果

```
$ node binaryTree-1.js
当前遍历的结点值是： A
当前遍历的结点值是： B
当前遍历的结点值是： D
当前遍历的结点值是： E
当前遍历的结点值是： C
当前遍历的结点值是： F
```

## 图解先序遍历的完整过程

各位现在完全可以再回过头来看一下我们前面示例的这棵二叉树：
![blockchain](~/assets/code-reviews/8.png)
我们直接把它套进 preorder 函数里，一步一步来认清楚先序遍历的每一步做了什么：

1. 调用 preorder(root)，这里 root 就是 A，它非空，所以进入递归式，输出 A 值。接着优先遍历左子树，preorder(root.left) 此时为 preorder(B) ：
   ![blockchain](~/assets/code-reviews/9.png)
2. 进入 preorder(B) 的逻辑： 入参为结点 B，非空，进入递归式，输出 B 值。接着优先遍历 B 的左子树，preorder(root.left) 此时为 preorder(D) ：
   ![blockchain](~/assets/code-reviews/10.png)
3. 进入 preorder(D) 的逻辑： 入参为结点 D，非空，进入递归式，输出 D 值。接着优先遍历 D 的左子树，preorder(root.left) 此时为 preorder(null)：
   ![blockchain](~/assets/code-reviews/11.png)
4. 进入 preorder(null) ，发现抵达了递归边界，直接 return 掉。紧接着是 preorder(D) 的逻辑往下走，走到了 preorder(root.right) ：
   ![blockchain](~/assets/code-reviews/12.png)
5. 再次进入 preorder(null) ，发现抵达了递归边界，直接 return 掉，回到 preorder(D) 里。接着 preorder(D) 的逻辑往下走，发现 preorder(D) 已经执行完了。于是返回，回到 preorder(B) 里，接着 preorder(B) 往下走，进入 preorder(root.right) ，也就是 preorder(E)
6. E 不为空，进入递归式，输出 E 值。接着优先遍历 E 的左子树，preorder(root.left) 此时为 preorder(null)，触碰递归边界，直接返回 preorder(E)；继续 preorder(E)执行下去，是 preorder(root.right) ，这里 E 的 right 同样是 null，故直接返回。如此一来，preorder(E)就执行完了，回到 preorder(B)里去；发现 preorder(B)也执行完了，于是回到 preorder(A)里去，执行 preorder(A)中的 preorder(root.right)。root 是 A，root.right 就是 C 了，进入 preorder(C)的逻辑
   ![blockchain](~/assets/code-reviews/13.png)
   C 不为空，进入递归式，输出 C 值。接着优先遍历 C 的左子树，preorder(root.left) 此时为 preorder(null)，触碰递归边界，直接返回。继续 preorder(C)执行下去，是 preorder(root.right) ，这里 C 的 right 是 F：
   ![blockchain](~/assets/code-reviews/14.png)
7. 进入 preorder(F)的逻辑，F 不为空，进入递归式，输出 F 值。接着优先遍历 F 的左子树，preorder(root.left) 此时为 preorder(null)，触碰递归边界，直接返回 preorder(F)；继续 preorder(F)执行下去，是 preorder(root.right) ，这里 F 的 right 同样是 null，故直接返回 preorder(F)。此时 preorder(F)已经执行完了，返回 preorder(C)；发现 preorder(C)也执行完了，就回到 preorder(A)；发现 preorder(A)作为递归入口，它的逻辑也已经执行完了，于是我们的递归活动就正式画上了句号。

## 中序遍历与后序遍历

思路同上，这样只展示代码，以作备忘

```javascript
/ 所有遍历函数的入参都是树的根结点对象
function inorder(root) {
    // 递归边界，root 为空
    if(!root) return
    // 递归遍历左子树
    inorder(root.left)
    // 输出当前遍历的结点值
    console.log('当前遍历的结点值是：', root.val)
    // 递归遍历右子树
    inorder(root.right)
}
```

```javascript
function postorder(root) {
  // 递归边界，root 为空
  if (!root) return;
  // 递归遍历左子树
  postorder(root.left);
  // 递归遍历右子树
  postorder(root.right);
  // 输出当前遍历的结点值
  console.log("当前遍历的结点值是：", root.val);
}
```
