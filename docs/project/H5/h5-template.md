## 场景

![h5](/assets/project/24.png)

最初的做法是把每个 h5 项目统一放在<code>draw-course-ativity-H5</code>，但随着团队接的 H5 越来越多，draw-course-ativity-H5 目录下的项目变多，每个 H5 都有<code>node_modules</code>下有大量的包，导致 vscode 卡顿！多个 H5 的包版本难以同步维护！使用<code>vue</code>+<code>webpack</code>搭建多页面 H5，提高了 H5 开发效率，统一维护 package。

vue2 已升级到 vue3

## 代码

不讲，见源码：[h5-template](https://github.com/0zcl/h5_template)
