## 概念

### 屏幕尺寸

指屏幕的对角线的长度，单位是英寸，1 英寸=2.54 厘米。常见的屏幕尺寸有 2.4、2.8、3.5、3.7、4.2、5.0、5.5、6.0 等。
![屏幕尺寸](/assets/mobile/1.png)

### 屏幕分辨率

指在横纵向上的像素点数。一般以纵向像素横向像素来表示一个手机的分辨率，如 1960 1080。（这里的 1 像素值得是物理设备的 1 个像素点）

### 设备像素 (device pixels)

也称为物理像素。设备能控制显示的最小单位，我们可以把这些像素看作成显示器上一个个的点

### 设备独立像素(device independent pixels)

也称为逻辑分辨率,又叫 dip 或者是 dp，可以认为是计算机坐标系统中的一个点，这个点代表一个可以由程序使用的虚拟像素(比如说 CSS 像素)，然后由相关系统转换为物理像素

如下图所示，虽然设备物理分辨不同，但是他的这个逻辑分辨率却都差不多

![屏幕尺寸](/assets/mobile/6.png)

乔布斯在 iPhone4 的发布会上首次提出了 Retina Display(视网膜屏幕)的概念，在 iPhone4 使用的视网膜屏幕中，把 2x2 个像素当 1 个像素使用，这样让屏幕看起来更精致，但是元素的大小却不会改变。从此以后高分辨率的设备，多了一个逻辑像素。这些设备逻辑像素的差别虽然不会跨度很大，但是仍然有点差别，于是便诞生了移动端页面需要适配这个问题，既然逻辑像素由物理像素得来，那他们就会有一个像素比值

<strong>一个设备独立像素里可能包含 1 个或者多个物理像素点</strong>，包含的越多则屏幕看起来越清晰

### CSS 像素

浏览器使用的单位，用来精确度量网页上的内容，比如 div { width: 100px; }。 在一般情况下（页面缩放比为 1），1 个 CSS 像素 等于 1 个设备独立像素。比如，假设把屏幕独立像素分辨率设置为 1440x900，给页面元素设置为宽度 720px，则视觉上元素的宽度是屏幕宽度的一半。这也解释了为什么当我们把独立像素分辨率调高后网页的文字感觉变小了

<strong>当页面缩放比不为 1 时，CSS 像素和设备独立像素不再对应。比如当页面放大 200%，则 1 个 CSS 像素等于 4 个设备独立像素</strong>

### css 中的 1px 并不等于设备的 1px

在早先的移动设备中，屏幕像素密度都比较低，如 iphone3，它的分辨率为 320x480，在 iphone3 上，一个 css 像素确实是等于一个屏幕物理像素的。后来随着技术的发展，移动设备的屏幕像素密度越来越高，从 iphone4 开始，苹果公司便推出了所谓的 Retina 屏，分辨率提高了一倍，变成 640x960，但屏幕尺寸却没变化，这就意味着同样大小的屏幕上，像素却多了一倍，这时，一个 css 像素是等于两个物理像素的

### 设备像素比(device pixel ratio)

设备像素比简称为 dpr，其定义了物理像素和设备独立像素的对应关系

```javascript
设备像素比 ＝ 物理像素 / 设备独立像素  // 在某一方向上，x方向或者y方向
```

- css 中的 px 可以看成是设备独立像素，当 dpr 为 1:1 时，使用 1 个物理像素显示 1 个 CSS 像素。当 dpr 为 2:1 时，使用 4(2\*2)个物理像素显示 1 个 CSS 像素，当这个比率为 3:1 时，使用 9 个设备像素显示 1 个 CSS 像素

![dpr](/assets/mobile/2.png)

众所周知，iPhone6 的设备宽度和高度为 375pt 667pt,可以理解为设备的独立像素；而其 dpr 为 2，根据上面公式，我们可以很轻松得知其物理像素为 750pt 1334pt

### 布局视口（layout viewport）

![layout](/assets/mobile/3.png)

### 视觉视口（visual viewport）

![layout](/assets/mobile/4.png)

### 理想视口（ideal viewport）

布局视口在移动端展示的效果并不是一个理想的效果，所以理想视口(ideal viewport)就诞生了：网站页面在移动端展示的理想大小

![layout](/assets/mobile/5.png)

- device-width 就等于理想视口的宽度，所以设置 width=device-width 就相当于让布局视口等于理想视口。

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
/>
```

- width：设置 layout viewport 的宽度，为一个正整数，或字符串"width-device"
- initial-scale：设置页面的初始缩放值，为一个数字，可以带小数
- minimum-scale：允许用户的最小缩放值，为一个数字，可以带小数
- maximum-scale：允许用户的最大缩放值，为一个数字，可以带小数
- height：设置 layout viewport 的高度，这个属性对我们并不重要，很少使用
- user-scalable：是否允许用户进行缩放，值为"no"或"yes", no 代表不允许，yes 代表允许

## 面试

问：移动端 1px 问题是什么？如何产生的？如何适配 1px

答：在样式文件写 1px，表示的是 css 像素（设备独立像素），在 retina 屏的 iphone 手机上，反映到设备上，1px 所需的物理像素：1 \* dpr. 常常有 2 个或 3 个物理像素，看起来变粗了

问：如何适配 1px

答：方案一：

```javascript
// 根据屏幕大小及dpi调整缩放和大小
(function () {
  var scale = 1.0;
  var ratio = 1;
  if (window.devicePixelRatio >= 2) {
    scale *= 0.5;
    ratio *= 2;
  }
  var text =
    '<meta name="viewport" content="initial-scale=' +
    scale +
    ", maximum-scale=" +
    scale +
    "," +
    " minimum-scale=" +
    scale +
    ", width=device-width," +
    ' user-scalable=no" />';
  document.write(text);
  document.documentElement.style.fontSize = 50 * ratio + "px";
})();
```

方案二：transform: scale(0.5)

这个方案也是 WeUI 正在用的，核心思想是使用 transform 的 scale 来整体缩放，如果你想画一条 1px 的线，就可以直接用

```html
div { height: 1px; background: #000; transform: scaleY(0.5); transform-origin: 0
0; }
```

理论上在 dpr 为 2 时就是 scaleY(0.5)，在 dpr 为 3 时就是 scaleY(0.333)，但是我注意到 WeUI 并没有针对其他 dpr 的做特殊处理，可能是因为在 iPhone6（dpr=2）和 iPhone6 Plus（dpr=3）中看起来差别不大吧

方案三：lib-flexible.js

答：获取当前环境的 dpr，1px 实际 代表了 1 \* dpr 个物理像素，显得变粗了。lib-flexible 设置 meta 标签的 initial-scale 属性为 1 / dpr。将界面缩小 1/dpr。此时 1px css 像素，表示 1 个物理像素

## lib-flexible 源码解析

在引入 lib-flexible 需要执行的 JS 之前，可以手动设置 meta 来控制 dpr 值，如：

```html
<meta name="flexible" content="initial-dpr=2" />
```

其中 initial-dpr 会把 dpr 强制设置为给定的值。如果手动设置了 dpr 之后，不管设备是多少的 dpr，都会强制认为其 dpr 是你设置的值。在此不建议手动强制设置 dpr，因为在 Flexible 中，只对 iOS 设备进行 dpr 的判断，对于 Android 系列，始终认为其 dpr 为 1。

```javascript
if (!dpr && !scale) {
  var isAndroid = win.navigator.appVersion.match(/android/gi);
  var isIPhone = win.navigator.appVersion.match(/iphone/gi);
  var devicePixelRatio = win.devicePixelRatio;
  if (isIPhone) {
    // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
    if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
      dpr = 3;
    } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
      dpr = 2;
    } else {
      dpr = 1;
    }
  } else {
    // 其他设备下，仍旧使用1倍的方案
    dpr = 1;
  }
  scale = 1 / dpr;
}
```

### flexible 的实质

flexible 实际上就是能过 JS 来动态改写 meta 标签，代码类似这样：

```javascript
var metaEl = doc.createElement("meta");
var scale = isRetina ? 0.5 : 1;
metaEl.setAttribute("name", "viewport");
metaEl.setAttribute(
  "content",
  "initial-scale=" +
    scale +
    ", maximum-scale=" +
    scale +
    ", minimum-scale=" +
    scale +
    ", user-scalable=no"
);
if (docEl.firstElementChild) {
  document.documentElement.firstElementChild.appendChild(metaEl);
} else {
  var wrap = doc.createElement("div");
  wrap.appendChild(metaEl);
  documen.write(wrap.innerHTML);
}
```

事实上他做了这几样事情：

- 动态改写<meta>标签
- 给 html 元素 添加 data-dpr 属性，并且动态改写 data-dpr 的值
- 给 html 元素 添加 font-size 属性，并且动态改写 font-size 的值

注意：使用了 flexible，就不要加 name=viewport 的 meta 标签，flexible.js 会自动帮助添加的

参考：https://github.com/amfe/article/issues/17
