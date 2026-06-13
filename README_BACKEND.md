# HP乙游模拟器后端版使用说明

这个版本在原本网页游戏基础上增加了一个 Node.js 后端，用来保存玩家存档、读取 database 文件，减少浏览器本地存储容量限制导致的丢档问题。

## 本地运行

1. 安装 Node.js 18 或以上版本。
2. 解压本项目。
3. 在项目根目录打开终端，运行：

```bash
npm start
```

4. 浏览器打开：

```text
http://localhost:3000
```

不要直接双击 `index.html`，直接双击时没有后端，仍然只能使用本地存档。

## 后端保存了什么

后端会保存：

- 玩家当前角色数据
- 存档位 1-4
- 主线/羁绊/夜游对话历史
- 关系、好感、课程、背包、信件、结局等状态

保存位置：

```text
backend/data/users/<玩家ID>/saves.json
```

## database 文件

`database/` 文件夹仍然保留在项目里，后端可以通过：

```text
/api/database/characters.json
/api/database/world_lore.json
```

读取它们。前端也会继续读取这些数据库，供 AI prompt 使用。

## 部署提醒

GitHub Pages 不能运行后端，只能托管静态网页。

如果要使用这个后端版，需要部署到支持 Node.js 的平台，例如：

- Render
- Railway
- Fly.io
- VPS
- 本地电脑

如果仍然上传到 GitHub Pages，游戏可以打开，但后端存档不会生效，会自动回退到浏览器本地存档。

## API Key 安全提醒

玩家自己的 AI API Key 仍然保存在玩家浏览器端。不要把你的私人 API Key 写死进前端代码里。

---

## Supabase 持久存档版

本版本已经支持 Supabase 数据库存档。请查看 `README_SUPABASE.md`。

Render 填好环境变量并重新部署后，访问 `/api/health`，看到 `"storage":"supabase"` 即代表数据库存档生效。
