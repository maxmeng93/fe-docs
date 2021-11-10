:::tip
STAR：Situation（情景），Task（任务），Action（行动）和 Result（结果）

XXX 项目出现 XXX 问题，我作为 XXX，负责其中的 XXX 部分，我通过 XXX 方式（或技术方案）成功解决了该问题，使 XXX 提高了 XXX，XXX 增长了 XXX

在项目经历描述中，通过交代清楚你在团队中的位置，以及大略描述你在团队中起到的作用
:::

微前端特性：

- 📦 基于 single-spa 封装，提供了更加开箱即用的 API。
- 📱 技术栈无关，任意技术栈的应用均可 使用/接入，不论是 React/Vue/Angular/JQuery 还是其他等框架。
- 💪 HTML Entry 接入方式，让你接入微应用像使用 iframe 一样简单。
- 🛡​ 样式隔离，确保微应用之间样式互相不干扰。
- 🧳 JS 沙箱，确保微应用之间 全局变量/事件 不冲突。

[qiankun](https://qiankun.umijs.org/zh/api#registermicroappsapps-lifecycles)使用：

1. 主应用：

- registerMicroApps(apps, lifeCycles?): 注册微应用的基础配置信息。当浏览器 url 发生变化时，会自动检查每一个微应用注册的 activeRule 规则，符合规则的应用将会被自动激活。
- start(opts?)：启动 qiankun
- initGlobalState(state)：定义全局状态。建议在主应用使用，微应用通过 props 获取通信方法

2. 微应用

- RegistrableApp 注册子应用时，使用 props 参数，主应用将数据传递给子应用。

## 场景

后台项目多，需要到 A 项目才能看到 A1 内容，到 B 项目才能看到 B1 内容。使用微前端项目统一接入各个后台项目，通过配置，能直接在微前端项目快速访问各个后台业务。微前端项目由运营支撑部开发维护，我负责 cms 后台接入微前端。

## 实现

## 1. 动态路由

根据配置，后端返回菜单的数据。一个菜单下可以有多个子菜单，树形结构。<code>userShow</code>字段表示菜单是否显示。
:::details

```json
{
  "id": 1612858,
  "systemId": 9,
  "type": 1,
  "name": "课程管理",
  "detail": "/",
  "level": 1,
  "order": 0,
  "icon": "cms_book",
  "parentId": 0,
  "modules": [
    {
      "id": 1612859,
      "systemId": 9,
      "type": 1,
      "name": "课程管理",
      "detail": "/cms/course/courseManage",
      "level": 2,
      "order": 0,
      "icon": "",
      "parentId": 1612858,
      "modules": [],
      "userShow": true
    },
    {
      "id": 1612860,
      "systemId": 9,
      "type": 1,
      "name": "画作工具库",
      "detail": "/cms/course/drawToolLib",
      "level": 2,
      "order": 0,
      "icon": "",
      "parentId": 1612858,
      "modules": [],
      "userShow": true
    }
  ],
  "userShow": true
}
```

:::
递归渲染

```js
<template v-for="(value, index) in menuData">
  // 有子菜单
  <el-submenu v-if="value.modules && value.modules.length && isShow(value)" :id="value.id" :key="index" :index="`${value.id}`">
    <template slot="title">
      <menuTitle :menu-data="value" />
    </template>
    <tree-menu :menu-data="value.modules" />
  </el-submenu>
  // 无子菜单
  <el-menu-item v-else-if="isShow(value)" :id="value.detail" :key="index" :index="addPathPrefix(value.detail)">
    <menuTitle :menu-data="value" />
  </el-menu-item>
</template>
```

## 2. 消息通信

1. initGlobalState. 官方提供的接口.

```js
// 主应用
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: "qiankun",
});
// 主应用监听数据
onGlobalStateChange((value, prev) =>
  console.log("[onGlobalStateChange - master]:", value, prev)
);

setGlobalState({
  ignore: "master",
  user: {
    name: "master",
  },
});

// 子应用
export async function mount(props) {
  storeTest(props);
}

function storeTest(props) {
  // 子应用监听数据
  props.onGlobalStateChange &&
    props.onGlobalStateChange((value, prev) =>
      console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev)
    );
  // 子应用修改数据
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}
```

![initGlobalState](/assets/project/35.png)

父应用和子应用都监听了<code>{ ignore: 'master', user: { name: 'master', }, }</code>对象, 子应用修改监听的数据, 触发了主应用和子应用的回调. 本质上和 eventEmit 是一样的.

- 优点: 有 qiankun 官方支持, 使用简单
- 缺点: 子应用需要先了解监听的数据池, 再进行通信; 容易出现状态混乱(不知道谁改的数据)

2. 父应用注册子应用是可通过<code>props</code>向子应用传递数据。可以传父应用的 store 对象, 传给子应用, 子应用再调用<code>store.dispatch</code>, 通知父应用.

```js
// 传入到子应用的数据
const initData = {
  user: user || {}, // 用户相关信息
  store,
  menus: menuData.menus, // 菜单
  resources: menuData.resources, // 权限code
};

props: initData;
```

注意了，这里把主应用的<code>store</code>对象传出去了，子应用拿到主应用的<code>store</code>对象，需要时执行<code>store.dispatch</code>，主应用通过<code>Vuex：Action --> Mutation</code>的形式来修改数据即可。

```js
// 这部分代码在子应用中执行。事实上，为了避免子应用们代码冗余，会把这部分逻辑封装到Npm包中，抛出函数给子应用使用
const data = [
  {
    moduleId: detail,
    redPointNum: count,
  },
];
store.dispatch("redPoint/setCounts", data);
```

## 3. 注册子应用

先初始化主应用，再在主应用中注册子应用。
:::details

```js
// 获取子应用列表
{
  appCode: "cms";
  appName: "cms";
  id: "1280077660296974336";
  route: "/cms";
  siteUrl: "//manager-test.61info.cn/index.html";
  versionAddress: "//manager-test.61info.cn/index.html";
  versionCode: null;
  versionName: null;
  weight: null;
}
```

:::

```js
// render.tsx
function createApp(appContent: string, loading: boolean): Vue {
  return new Vue({
    // ...
  });
}

export const render = (() => {
  let app: Vue;
  return ({ appContent, loading }) => {
    app = createApp(appContent, loading);
    return app;
  };
})();

// index.tsx
function activeRule(routerPrefix: string): any {
  return (location) => location.hash.slice(1).startsWith(routerPrefix);
}

// 实例化主应用
const app = render({ appContent: "", loading: false });

async function setApps() {
  const appsData = await fetchUserApps().then((res) => res.data.list || []);

  // 获取到用户的菜单和权限
  const menuData = await MenuStore.fetchMenus();
  // 传入到子应用的数据
  const initData = {
    user: user || {},
    store,
    menus: menuData.menus, // 菜单列表
    resources: menuData.resources, // 按钮权限code列表
  };

  const microAppSettings = appsData.reduce((list, app) => {
    const obj = {
      name: app.appName,
      entry: app.siteUrl,
      container: "#appContainer",
      props: initData,
      activeRule: activeRule(app.route),
    };
    list.push(obj);
    return list;
  }, []);

  registerMicroApps(microAppSettings);
  start({ prefetch: false });
}

setApps();
```

## 4. 接入

微应用需要在自己的入口 js (通常就是你配置的 webpack 的 entry js) 导出 <code>bootstrap</code>、<code>mount</code>、<code>unmount</code> 三个生命周期钩子，以供主应用在适当的时机调用

- bootstrap: 只会在子应用初始化的时候调用一次，再进入子应用时，不会再次触发
- mount: 每次进入都会调用 mount 方法，这里触发应用的渲染方法
- unmount: 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例

register 函数，为子应用提供注册。兼容 qiankun 和非 qiankun 下的独立运行。

```js
// 子应用
register((props) => {
  // ...
  let app = new Vue({
    el: "#app",
    router,
    store,
    render: (h) => h(App),
  });
  return () => {
    app.$destroy();
    app = null;
  };
}, {});

// 下面的代码封装到npm供子应用们使用
let appRender: Function = () => {
  console.error("please run register method to init app");
};

export function register(
  render: (props?: MicroParams) => Function,
  conf: MicroConf = {}
): Function | void {
  options = conf;
  // appRender()返回一个函数，包含卸载微应用的逻辑
  appRender = render;
  if (!window.__POWERED_BY_QIANKUN__) {
    const params = getParams();
    const user = params.user;
    // 自动更新本地缓存
    if (user && user.accessToken) {
      localStorage.setItem("accessToken", user.accessToken);
      localStorage.setItem("loginInfo", JSON.stringify(user));
    }
    const microProps: MicroParams = Object.assign({}, params, {
      menus: [],
      resources: [],
    });
    return render(microProps);
  }
}

export async function mount(props: MicroParams) {
  options.mount && options.mount(props);
  unmountAppCallback = appRender(props);
}
export async function unmount() {
  // options.unmount && options.unmount()
  unmountAppCallback && unmountAppCallback();
  console.log("child app unmount");
}
```

## qiankun

HTML Entry 是由<code>import-html-entry</code>库实现的，通过 http 请求加载指定地址的首屏内容即 html 页面，然后解析这个 html 模版得到 template, scripts , entry, styles

```json
{
  template: 经过处理的脚本，link、script 标签都被注释掉了,
  scripts: [脚本的http地址 或者 { async: true, src: xx } 或者 代码块],
  styles: [样式的http地址],
 	entry: 入口脚本的地址，要不是标有 entry 的 script 的 src，要不就是最后一个 script 标签的 src
}
```

然后远程加载 styles 中的样式内容，将 template 模版中注释掉的 link 标签替换为相应的 style 元素。

![html entry](/assets/project/36.png)

1. 为什么要用微前端？

使用微前端项目统一接入各个后台项目，通过配置，能直接在微前端项目快速访问各个后台业务

2. 怎么处理样式隔离？

- [Shadow DOM](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM)
- scopedCSS

[start(opts?)](https://qiankun.umijs.org/zh/api#startopts) API 有个<code>sandbox</code>属性, <code>boolean | { strictStyleIsolation?: boolean, experimentalStyleIsolation?: boolean }</code>

当配置为 { strictStyleIsolation: true } 时表示开启严格的样式隔离模式。这种模式下 qiankun 会为每个微应用的容器包裹上一个 shadow dom 节点，从而确保微应用的样式不会对全局造成影响

当 experimentalStyleIsolation 被设置为 true 时，qiankun 会改写子应用所添加的样式为所有样式规则增加一个特殊的选择器规则来限定其影响范围，因此改写后的代码会表达类似为如下结构

```js
// 假设应用名是 react16
.app-main {
  font-size: 14px;
}

div[data-qiankun-react16] .app-main {
  font-size: 14px;
}
```

3. 怎么处理 JS 隔离？

```js
// src/sandbox/index.ts
export function createSandboxContainer(
  appName: string,
  elementGetter: () => HTMLElement | ShadowRoot,
  scopedCSS: boolean,
  useLooseSandbox?: boolean,
  excludeAssetFilter?: (url: string) => boolean,
  globalContext?: typeof window
) {
  let sandbox: SandBox;
  if (window.Proxy) {
    sandbox = useLooseSandbox
      ? new LegacySandbox(appName, globalContext)
      : new ProxySandbox(appName, globalContext);
  } else {
    sandbox = new SnapshotSandbox(appName);
  }
  // ...
}
```

## 总结

参考:
[微前端框架 之 qiankun 从入门到源码分析](https://juejin.cn/post/6885211340999229454#heading-39)

[HTML Entry 源码分析](https://juejin.cn/post/6885212507837825038#heading-3)

[说说微前端 JS 沙箱实现的几种方式](https://juejin.cn/post/6981374562877308936)
