## 定义

根据不同参数可以命中不同的策略

## 实现

举一个简单的例子，计算年终奖，年终奖由奖金基数和绩效系数决定，公式为：`年终奖 = 奖金基数 * 绩效系数`。绩效分为 5 个等级，分别是 S(2)、A(1.5)、B(1)、C(0.5)、D(0.1)。奖金基数由个人工资加减奖惩项金额计算得出，如：故障(-5000)、领导(+3000)、卷王(+4000)、摸鱼(-2000)。

根据以下几位同事的信息计算年终奖：
老赵：绩效 A、工资 25000、卷王+领导
小王：绩效 S、工资 20000、卷王
小李：绩效 D、工资 23000、故障
小花：绩效 C、工资 18000、摸鱼

```js
// 员工
const staffs = [
  ['老赵', 'A', 25000, ['卷王', '领导']],
  ['小王', 'S', 25000, ['卷王']],
  ['小李', 'D', 25000, ['故障']],
  ['小花', 'C', 25000, ['摸鱼']],
];

// 年终奖策略：奖金基数 * 系数
const strategyA = {
  S: (base) => base * 2,
  A: (base) => base * 1.5,
  B: (base) => base * 1,
  C: (base) => base * 0.5,
  D: (base) => base * 0.1,
};

// 奖惩策略：个人工资加减奖惩项
const strategyB = {
  故障: (base) => base - 5000,
  领导: (base) => base + 3000,
  卷王: (base) => base + 4000,
  摸鱼: (base) => base - 2000,
};

// 奖金基数计算
function baseCalc(wages, bonusPenaltyList) {
  let base = wages;

  // for循环
  // for (let i = 0; i < bonusPenaltyList.length; i++) {
  //   const fn = strategyB[bonusPenaltyList[i]];
  //   base = fn(base);
  // }

  // array.forEach
  // bonusPenaltyList.forEach((item) => (base = strategyB[item](base)));

  // array.reduce
  base = bonusPenaltyList.reduce((total, item) => strategyB[item](total), base);

  return base;
}

// 年终奖计算
function bonusCalc(level, base) {
  return strategyA[level](base);
}

function calc(staffs) {
  staffs.forEach((staff) => {
    const [name, level, wages, items] = staff;
    const base = baseCalc(wages, items);
    const bonus = bonusCalc(level, base);

    console.log(`${name}，年终奖${bonus}`);
  });
}

calc(staffs);

// "老赵，年终奖48000"
// "小王，年终奖58000"
// "小李，年终奖2000"
// "小花，年终奖11500"
```
