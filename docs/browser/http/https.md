## 概念

- 对称加密：指加密和解密都使用的是相同的密钥
- 非对称加密：非对称加密算法有 A、B 两把密钥，如果你用 A 密钥来加密，那么只能使用 B 密钥来解密；
  反过来，如果你要 B 密钥来加密，那么只能用 A 密钥来解密。公钥是公开的，私钥是只有服务器才知道的。
- 数字证书：服务端站点的公钥 + 服务端站点的基础信息 + CA 私钥加 信息摘要 得到的数字签名，三者组成数字证书

![数字证书](/assets/browser/http/9.png)

## 安全层

HTTP 传输的内容被中间人窃取、伪造和篡改。传输过程中无安全性。因此在 TCP 和 HTTP 之间插入一个<code>安全层</code>. 所有经过安全层的数据都会被加密或者解密

<img src="/assets/browser/http/10.png" style="width: 60%" />

安全层有两个主要的职责：对发起 HTTP 请求的数据进行<code>加密操作</code>和对接收到 HTTP 的内容进行<code>解密操作</code>。

## 对称加密

1. 浏览器发送 <code>加密套件列表</code>和<code>client-random 随机数</code>
2. 服务端从加密套件列表取一个加密套件，并生机<code>service-random 随机数</code>
3. 将 client-random 和 service-random 混合起来生成一个密钥 master secret，有了密钥 master secret , 双方就可以进行数据的加密传输了

![secret](/assets/browser/http/11.png)

:::tip
加密套件是指加密的方法，加密套件列表就是指浏览器能支持多少种加密方法列表
:::

## 缺点

加密套件和随机数是明文的

## 非对称加密

1. 浏览器发送 <code>加密套件列表</code>
2. 服务端从加密套件列表取一个加密套件，并返回公钥
3. 进行通信。公钥加密，私钥解密；私钥加密，公钥解密

![secret](/assets/browser/http/12.png)

## 缺点

1. 非对称加密效率太低
2. 无法保证服务器发送给浏览器的数据安全。黑客可以截获数据，通过公钥解密，然后篡改信息再返回给客户端。

## 添加数字证书

数字证书有两个作用

1. 数字证书向浏览器证明服务器的身份
2. 数字证书里面包含了服务器公钥

![secret](/assets/browser/http/13.png)

1. 浏览器发送 对称加密套件列表，非对称加密套件列表，client-random 随机数
2. 服务端返回 对称加密套件，非对称加密套件，service-random 随机数，以及 数字证书
3. 浏览器 验证 数字证书
4. 浏览器保存 公钥，并生成 <code>pre-master 随机数</code>, 用公钥对 pre-master 加密，并发送给服务端
5. 服务端用私钥解密 pre-master
6. 浏览器和服务端 用 client-random + service-random + pre-master 生成对称密钥 master-secret
7. 进行通信。用对称密钥进行加解密

:::tip
重要的就是这个 pre-master 随机数, 黑客获取不到, 所以才保证了加密的可靠性!!!
:::

## 如何申请数字证书？(了解即可)

![数字证书](/assets/browser/http/9.png)

1. 服务端站点人员 填写表单(包含：服务端站点公钥、站点资料、公司资料等)
2. CA 机构审核
3. 对表单明文资料 Hash 计算，得出 信息摘要
4. CA 私钥 加密 信息摘要，得出 数字签名
5. 返回包含 公钥、基本信处、数字签名的 数字证书

## 浏览器如何验证数字证书？

1. 验证证书的有效期。证书里面就含有证书的有效期, 浏览器只需要判断当前时间是否在证书的有效期范围内即可.

<img src="/assets/browser/http/14.png" style="width: 50%" />

2. 验证数字证书 是否被吊销。了解即可
3. 验证数字证书 是否是 CA 机构颁发的。
   _ 浏览器利用证书原始信息 Hash 计算，得出信息摘要
   _ 用<strong>CA 的公钥</strong>解密 数字证书中的数字签名，解密出来的也是信息摘要 \* 比较两个信息摘要是否相等
   ![ca](/assets/browser/http/15.png)

## 浏览器是怎么获取到 CA 公钥的？

你部署 HTTP 服务器的时候，除了部署当前的数字证书之外，还需要部署 CA 机构的数字证书
极客时间服务器就有了两个数字证书

1. 给极客时间域名的数字证书
2. 给极客时间签名的 CA 机构的数字证书

在建立 HTTPS 链接时，<code>服务器会将这两个证书一同发送给浏览器</code>，于是浏览器就可以获取到 CA 的公钥了

参考：
[https](https://github.com/LinDaiDai/niubility-coding-js/blob/master/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/HTTPS%E9%9D%A2%E8%AF%95%E9%97%AE%E7%AD%94.md)
[极客时间](https://time.geekbang.org/column/article/180213)
