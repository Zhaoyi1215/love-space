# 💕 我们的恋爱手账

一个只属于你们两个人的私密空间，用来记录异地恋的点滴：在一起天数实时跳动、见面倒计时、双人日记、照片墙、三类愿望清单、留言板、时间线。两人用**同一个情侣码**进入同一份数据，任何一台设备打开都能实时同步。

## 功能一览

| 页面 | 功能 |
|------|------|
| 💕 首页 | 在一起天数实时跳动 + 下次见面倒计时进度条 + 两人城市与当地时间 |
| 📔 日记 | 双人共享日记，带情绪标签，倒序展示 |
| 🖼️ 照片墙 | 上传照片 + 一句话备注，网格相册、大图查看 |
| ✅ 愿望清单 | 分三类：想一起去的地方 / 想吃的东西 / 想做的事，做完打卡 |
| 💌 留言板 | 便利贴墙，随手留一句悄悄话 |
| 📅 时间线 | 按日期回顾重要节点 |

## 技术栈

React + Vite + Tailwind CSS · Supabase（Postgres + Auth + Storage + Realtime）· 部署到 Vercel（免费）

---

## 🚀 上线步骤（照做即可，全程约 10 分钟，都免费）

你需要准备两个免费账号：**Supabase**（数据库）和 **Vercel + GitHub**（部署网站）。不需要把任何密码/密钥发给我。

### 第一步：创建 Supabase 数据库

1. 打开 https://supabase.com ，点 **Start your project** 用 GitHub 或邮箱注册登录。
2. 进入控制台后点 **New project**：
   - Name 随便填，比如 `love-space`
   - Database Password 点 **Generate a password** 自动生成（记不记都行，之后用不到）
   - Region 选一个离你近的，比如 `Southeast Asia (Singapore)` 或 `East US`
   - 点 **Create new project**，等 1~2 分钟初始化完成。
3. 左侧菜单点 **SQL Editor** → **New query**，把本项目 `supabase/schema.sql` 文件里的**全部内容**复制粘贴进去，点 **Run**（或按 `Ctrl+Enter`）。
   - 看到 `Success. No rows returned` 即成功，表、权限、图片存储、实时同步就全部建好了。

4. 开启匿名登录：左侧菜单 **Authentication** → **Providers**（或 **Sign In / Up**）→ 找到 **Anonymous** → 打开开关（**Enable anonymous sign-ins**）→ 保存。

5. 复制密钥：左侧菜单 **Settings** → **API**，你会看到：
   - **Project URL**（形如 `https://xxxx.supabase.co`）
   - **anon public** 那一串很长的 key
   把这两个值先记下来，下一步要用。

### 第二步：部署到 Vercel

1. 把本项目文件夹推到一个 **GitHub 仓库**：
   - 打开 https://github.com ，登录后点右上角 **+** → **New repository**，起个名（如 `love-space`），**不要**勾选初始化 README，点 **Create repository**。
   - 在你的电脑上本项目目录里执行（把地址换成你自己的仓库）：
     ```bash
     git init
     git add .
     git commit -m "init love space"
     git branch -M main
     git remote add origin https://github.com/你的用户名/love-space.git
     git push -u origin main
     ```

2. 打开 https://vercel.com ，点 **Sign Up**，选 **Continue with GitHub** 登录并授权。

3. 点 **Add New… → Project**，在列表里选中刚才那个 `love-space` 仓库，点 **Import**。

4. 在 **Environment Variables** 里添加两个变量（名字要完全一致，注意 `VITE_` 前缀）：
   - `VITE_SUPABASE_URL` = 第一步第 5 步的 Project URL
   - `VITE_SUPABASE_ANON_KEY` = 第一步第 5 步的 anon key

5. 点 **Deploy**，等一两分钟，出现 `Congratulations!` 和一个网址（形如 `https://love-space-xxx.vercel.app`），就是你们的网站了 🎉

### 第三步：开始使用

1. 打开那个网址 → 会自动匿名登录。
2. **第一个人**点「创建空间」：填昵称、选头像、选城市、填在一起的纪念日 → 生成一个 6 位**情侣码**。
3. 把情侣码发给对方（首页点一下情侣码即可复制）。
4. **第二个人**打开网址点「加入空间」，输入情侣码 + 自己的昵称/头像/城市 → 就进入了同一个空间。
5. 之后谁打开网址都会自动进入，两边发日记、传照片、打卡、留言都能**实时看到对方**。

---

## 💻 本地运行（可选，方便你自己先预览/改样式）

```bash
npm install
# 复制 .env.example 为 .env，填入 Supabase 的 URL 和 anon key
cp .env.example .env
npm run dev
```

浏览器打开提示的地址（默认 http://localhost:5173 ）即可。本地同样走真实 Supabase 数据。

## 📁 目录结构

```
love-space/
├─ index.html
├─ src/
│  ├─ main.jsx / App.jsx
│  ├─ lib/          # supabase 客户端、情侣码逻辑、全局状态、hooks
│  ├─ components/   # 通用卡片/弹窗/底部导航
│  └─ views/        # 6 个页面 + 首次进入引导
└─ supabase/
   └─ schema.sql    # 一次性建库脚本（表 + 权限 + 存储 + 实时 + 情侣码函数）
```

## ❓ 常见问题

- **换手机/清缓存后还能进吗？** 匿名身份存在浏览器里，清缓存会导致身份丢失。建议用「情侣码」重新加入即可（数据都在，不会丢）。
- **照片会公开吗？** 图片链接是随机文件名，只有拿到链接的人能看，普通访客看不到。情侣码才是进入空间的钥匙。
- **想改两个人名字/城市？** 目前首次进入时填写。后续可在首页「设置下次见面」旁补充编辑资料（可在后续迭代加）。
