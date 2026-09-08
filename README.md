# 梦墨的个人主页

React + TypeScript + Vite，部署目标为 Cloudflare Workers Static Assets。当前完成现有主页的技术迁移，保留个人介绍、六个社交／站点入口、随机摄影背景、拍摄参数、北京时间、运行时长及原错误页。

## 本地开发

需要 Node.js 24（见 `.nvmrc`）。

```sh
npm ci
npm run dev
```

开发地址通常为 http://127.0.0.1:5173 。启动前自动生成优化图片与拍摄信息。修改原始照片后重新启动开发服务，或运行 `npm run prepare:assets`。

```sh
npm test
npm run build
npm run preview
```

`build` 包含资源生成和 TypeScript 检查，输出为 `dist/`。GitHub Actions 在 push／PR 时执行测试与构建，不自动发布。

## 内容维护

- `src/config.ts`：个人介绍、链接、Discord 用户名、运行起始日期。
- `src/components/`：摄影、社交入口。
- `src/style.css`：延续原站分栏与移动端个人名片布局。
- `assets/images/Background/*.jpg`：原始摄影图片，文件名作为照片标识。
- `assets/images/avatar_new.png`：头像原图。
- `scripts/prepare-assets.mjs`：生成 960／1920 像素 WebP、头像和 EXIF 展示数据。优化图片不携带原始 EXIF；旧图片 URL 为兼容目的仍提供原图。
- `404.html`、`502.html`：原错误页源文件，构建时移除外部字体请求再复制到输出。
- `assets/js/`、`assets/css/`：保留作迁移参考，React 入口不再加载，也不复制到部署目录。

生成的 `public/photos/`、`public/assets/` 和 `src/generated/` 不提交 Git。首次独立运行类型检查前需要 `npm run prepare:assets`。

日期原值 `11/12/2021 11:45:14` 现明确为 `2021-11-12T11:45:14+08:00`，按原 JavaScript 月／日解析习惯解释；如实际建站日期不同，在配置里修正。

## 本次交互与资源调整

- 图标随 npm 依赖构建，首页不依赖第三方字体、图标或脚本 CDN。
- 京华老宋体暂替换为系统宋体回退。恢复原字体前应核对字体许可并准备可自托管的字体文件。
- Discord 改为按钮，点击复制，失败时显示可手动复制的用户名。
- 允许页面缩放，链接提供键盘焦点样式；动效尊重减少动态效果偏好。
- EXIF 在构建时解析；原照片缺少拍摄信息时显示提示。
- 使用浏览器原生鼠标指针。

## Cloudflare 预览与部署

配置文件为 `wrangler.jsonc`，目前只提供静态资源，无数据库和 Worker API。

```sh
npm run build
npm run preview:cloudflare
```

这个本地预览使用 Cloudflare 运行时，默认端口 8787。检查 `/`、历史图片路径、`/404.html` 及任意不存在路径。不存在路径应返回 HTTP 404；普通 Vite 开发／预览服务器不代表生产错误页行为。

准备好 Cloudflare 账号后：

```sh
npx wrangler login
npm run deploy
```

发布前确认 `name` 是否符合账号内命名。也可在 Cloudflare 中关联 Git 仓库，构建命令设为 `npm run build`，部署命令设为 `npx wrangler deploy`，Node 版本设为 24。`dist/` 也可部署到其他静态托管商，须配置相同的 404 行为。

当前没有新增客户端路由，刻意采用 `404-page`，避免将无效 URL 当成首页返回 200。后续增加文章／项目页面时需同步设计路由与预渲染策略。`502.html` 只是静态页面，不会自动覆盖 Cloudflare 平台生成的所有 502 错误。

## 正式域名迁移清单

1. 确认主域名、现托管商、DNS 记录、旧站备份与恢复方式。
2. 测试域名验证 HTTPS、图片、社交链接、移动布局和 404。
3. 在大陆多运营商、不同时间段实测访问，不把普通套餐视为大陆加速服务。
4. 在 Cloudflare 绑定自定义域名；若需迁移 DNS，完整保留邮件和其他子域名记录。
5. 为最终域名补齐 canonical、绝对地址分享图片和 sitemap；当前未假设主域名。
6. 记录旧解析与上一个发布版本后切换；观察 48–72 小时，旧站保留至少一周。
7. 如出现关键故障，恢复旧部署或解析；DNS 恢复受缓存时间影响。

本次本地迁移不会修改线上域名或创建云端部署。

## 后续范围

主题切换、项目展示、手动切换摄影背景及内容模块仍待后续开发。优先完成当前迁移验收，再加入新功能；项目素材、主域名和最终字体尚待确定。

## 来源

- [Cloudflare 静态资源与 404 配置](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Vite](https://vite.dev/guide/)
- [Font Awesome](https://fontawesome.com/)
- [原错误页模板](https://github.com/tarampampam/error-pages)

## 本次验证记录（2026-09-08）

- `npm run build`、TypeScript 检查及两项时间边界测试通过，`git diff --check` 通过。
- 通过 Cloudflare 本地运行时检查：首页与历史图片路径 HTTP 200，无效路径 HTTP 404。
- 浏览器检查 1440px 桌面与 390px 手机布局，无横向溢出；手机不挂载背景图片；Discord 点击显示复制成功。
- 预览期间浏览器未捕获 error／warn。尚未做线上部署、多运营商测速或 Lighthouse 性能验收。
- 1920px 背景 WebP 约 124–376 KB；首页 JavaScript gzip 约 64.55 KB。

## 静态站样式对齐

沿用当前依赖与系统宋体回退，不增加 CDN。按原站 CSS 恢复 hover／active 颜色 `#39c5bb` 和 0.5 秒过渡、两行菜单 15px／12px 间距和 18px 下边距、140px 头像、35px／24px 标题、100vh 内容区、移动端 90% 内容宽度与页脚 20px 10px 内边距、EXIF 左下角 50% 透明文字以及分阶段淡入动画。复制提示使用绝对定位，避免空提示撑高个人名片。

原京华老宋体文件不在当前依赖中；图标仍使用现有 Font Awesome 7 SVG，原站为 Font Awesome 6 字体图标，因此字体字形及个别图标轮廓不能保证像素级一致。保留键盘焦点与减少动态效果支持，不恢复自定义鼠标指针。
