# BOKI CLUB：发布与绑定 boki.club

这是一个可直接上传到 GitHub Pages 的静态网站，无需安装依赖或运行构建。

## 已包含

- 米白、炭黑、荧光绿的运动杂志风格；手机、平板、桌面自适应。
- 中文、英文、法语、德语、俄语、西班牙语、葡萄牙语、日语、韩语、泰语。
- 优先使用已保存的语言，其次匹配浏览器语言；也可手动切换。导航、正文、投票状态、错误提示、图片替代文字均随语言切换。装饰性的英文品牌标语保留英文。
- 使用提供的 IMG_3713.PNG 制作人物主视觉，保留原图入口。原素材为静态视频截图，图中的播放符号属于截图，不是可播放视频。
- “支持 boki.club +1”：调用真实在线计数服务，所有访客共享同一个总数，不是浏览器本地模拟。
- CNAME 文件已写入 boki.club。

## 先看本地效果

双击 index.html 可以查看版式；完整体验建议在终端运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /Users/x/Downloads/boki-club
```

浏览器打开 http://127.0.0.1:8765 。已有预览服务运行时无需重复执行；提示端口占用时换成 8766，并相应修改网址。

**注意：本地预览也连接正式在线计数器。点击支持会真实加票。** 不要把开发时的测试点击当成真实访客人数。

## 一、在 GitHub 发布

GitHub Free 可从公开仓库发布 GitHub Pages。网站源码和图片会公开，不要放密钥、密码、私人信息。域名续费仍由 Porkbun 收取。当前这种内容展示页适合 Pages；如果以后做商城、收款或商业 SaaS，应另选符合用途的托管方案。

1. 登录 https://github.com ，右上角 **+ → New repository**。
2. 名称填 **boki-club**，可见性选 **Public**，创建仓库。
3. 点击 **uploading an existing file**；若已创建初始文件，则点 **Add file → Upload files**。
4. 把本文件夹**里面的文件和 assets 文件夹**拖入上传区，不要只拖一个 ZIP，也不要在仓库根目录再套一层 boki-club 文件夹。
5. 确认仓库根目录直接有：index.html、style.css、script.js、locales.js、CNAME、assets/。README.md 可以一同上传。
6. 点击 **Commit changes** 保存。
7. 仓库 **Settings → Pages → Build and deployment**：
   - Source：**Deploy from a branch**。
   - Branch：**main**。
   - Folder：**/ (root)**。
   - 点击 **Save**。
8. 在 **Custom domain** 确认填入 **boki.club**，点击 **Save**。只填域名，不加 https:// 或路径。
9. 在仓库 **Actions** 中等待 Pages 部署任务完成。DNS 尚未配置时，域名检查失败是正常的，不需要反复重建仓库。

隐藏文件 .nojekyll 已包含；Finder 拖拽没选到它也不会影响当前普通 HTML/CSS/JS 网站。需要时可用 **Add file → Create new file** 新建名为 .nojekyll 的空文件。

**顺序要点：先在 GitHub Pages 声明自定义域名，再把网站 DNS 指向 GitHub。** 这样减少域名被他人抢绑定的风险。

### 建议先验证域名所有权

在 GitHub **头像 → Settings → Pages**（这是个人设置，不是仓库设置）中：

1. **Add a domain**，填 boki.club。
2. GitHub 会给一条 TXT 记录。在 Porkbun DNS 中按 GitHub 显示的 Host 和值添加。Host 通常形如 `_github-pages-challenge-你的用户名`，**以页面实际显示为准**；不要把域名后缀重复输入。
3. 回 GitHub 点击 **Verify**；成功后保留这条 TXT。

此 TXT 与下面的网站记录可以同时存在，不要删除。

## 二、在 Porkbun 绑定域名

1. 登录 https://porkbun.com 。
2. **Account → Domain Management**。
3. 找到 **boki.club → Details → DNS Records → 编辑图标**；也可悬停域名后点击 DNS。
4. 确认使用的是 Porkbun 的权威 DNS；如果你曾把 Nameservers 改到别的 DNS 提供商，下面的记录必须加在那个提供商，不能只加在 Porkbun。
5. 保存现有记录截图。仅移除 **根域名和 www 上冲突的旧网站 A、AAAA、ALIAS 或 CNAME 记录**，例如 Porkbun 默认停放页。**不要清空全部记录，不要删除邮箱 MX、邮件 SPF/DKIM/DMARC TXT 或 GitHub 验证 TXT。**
6. 手动添加以下记录；TTL 保持默认即可。

| Type | Host（Porkbun） | Answer / Value |
| --- | --- | --- |
| A | 留空 | 185.199.108.153 |
| A | 留空 | 185.199.109.153 |
| A | 留空 | 185.199.110.153 |
| A | 留空 | 185.199.111.153 |
| CNAME | www | 你的GitHub用户名.github.io |

- Porkbun 的 Host 留空表示 boki.club 根域名。其他 DNS 平台常把它写作 @。
- 把“你的GitHub用户名”替换为真实 GitHub 用户名。例如用户名是 alex，则填 `alex.github.io`。
- www 的 Answer **不要写** https://，**不要加** /boki-club，也不要填 boki.club。
- GitHub Pages 会把 www.boki.club 自动跳转到设定为主域名的 boki.club。
- 不要添加通配符 `*` 记录。

Porkbun 有 **Quick DNS Config → Github** 快捷配置；这里选手动方式是为了只改有关的网站记录，避免误改现有服务。

## 三、开启 HTTPS 并检查

1. 等 DNS 生效。GitHub 文档提示可能需要最多 24 小时；实际时间取决于缓存和 DNS。
2. 回仓库 **Settings → Pages**，等 **DNS check successful**。
3. 待证书签发后勾选 **Enforce HTTPS**。该选项可能需要最多 24 小时才可用；暂时变灰不代表你必须购买证书。
4. 打开 https://boki.club ，再打开 https://www.boki.club ，确认后者跳转至主域名。
5. 用手机打开检查图片、语言菜单和支持总数。若测试投票，记住那会真实计入。

Mac 可用以下命令检查 DNS，应该分别看到上表的四个 IPv4 地址和你的 GitHub 默认域名：

```sh
dig boki.club A +short
dig www.boki.club CNAME +short
```

### 常见问题

- **404**：检查 index.html 是否在仓库根目录、Pages 是否选 main / (root)、Actions 部署是否完成。
- **域名一直检查失败**：检查 DNS 是否在实际的权威 DNS 服务商配置；是否有旧的 A/AAAA/ALIAS/CNAME；www 的目标是否误加了路径。
- **以后修改网页**：在同一仓库替换相应文件并提交，Pages 会重新发布；不要删 CNAME。
- **以后删除仓库或停用 Pages**：同步移除或更改指向 GitHub 的 DNS；保留所有权验证 TXT，避免悬空域名。
- **在中国大陆访问**：GitHub Pages 以及海外计数服务的可达性取决于访问网络，本次未验证大陆网络，不承诺稳定连通。

## 四、投票的边界和维护

- 使用第三方 https://countapi.mileshilliard.com/ 的 get / hit 接口。此服务目前公开免费、无需注册或密钥，浏览器直接连接服务；托管并不由 GitHub 提供。服务方可看到连接该服务所需的网络信息，包括 IP。
- 本地只存语言偏好、已支持或待确认标记。**累计总数在服务端**，重新发布静态页面不会主动重置总数。
- 同一浏览器/同一站点来源记录一次。换设备、无痕模式、清空浏览器数据或从本地预览切换到正式域名，都可能再次支持，因此页面写“累计支持”，不写“实名人数”。
- API 是公开的，包括设置数值的接口，**无法防刷或防篡改**。这适用于轻量的名字应援，不适合有奖评选、正式排名或需要审计的投票。随机的计数器名称不是安全机制。
- 依赖第三方可用性和数据保存策略，没有本站数据库备份或服务等级保证。
- 请求只在初始化、点击支持、手动刷新、返回可见页面时发送；读取不增加总数。
- 点击后从服务端拿到成功结果才显示已支持和新总数。网络错误不会制造成功或使用假票数。
- 若增票请求结果未知（例如断网或超时），因为服务不支持幂等提交，本页保留“待确认”状态并禁止自动重发，避免一次点击被重算；刷新总数不能确认某一票究竟是否提交。
- 已进行两次真实测试增票，并在交付前清回 0；没有预填支持者。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| index.html | 页面结构 |
| style.css | 视觉和响应式样式 |
| locales.js | 十语言文案；每行顺序见文件顶部 |
| script.js | 语言选择、在线计数、浏览器已支持标记 |
| assets/portrait.webp | 压缩的人物主视觉 |
| assets/IMG_3713.PNG | 用户提供的原图 |
| assets/favicon.svg | 站点图标 |
| CNAME | GitHub Pages 自定义域名 |
| .nojekyll | 静态文件直接发布标记 |

上线前请确认你有权将原截图及其中人物肖像公开用于该网站；提供截图不等同于取得商业代言授权。未设置真实会员注册、邮箱收集、付费、虚构成员数或虚构城市分部。

## 设计参考与官方资料

- Tracksmith：运动、生活方式与社群的编辑式表达，https://www.tracksmith.com/ 。本站为原创布局，没有复制其图片或源码。
- GitHub 自定义域名：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- GitHub 域名所有权验证：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
- GitHub Pages 使用限制：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Porkbun 官方指南：https://kb.porkbun.com/article/64-how-to-connect-your-domain-to-github-pages
- CountAPI 接口和公开计数限制：https://countapi.mileshilliard.com/
