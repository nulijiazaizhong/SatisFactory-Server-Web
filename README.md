# SatisFactory Server Web

幸福工厂专用服务器 Web 控制面板 - 基于 React + Express 的全栈应用

## 功能特性

- 🖥️ **仪表盘** - 实时显示服务器状态、在线玩家、游戏时间等
- ⚙️ **服务器设置** - 修改自动暂停、自动保存、网络质量等配置
- 🎮 **游戏设置** - 上帝模式、无限电力、飞行模式等游戏修改器
- 💾 **存档管理** - 保存、加载、删除游戏存档
- 🎯 **操作** - 执行控制台命令、关闭服务器
- 🔐 **权限控制** - 支持只读模式和完整权限模式

## 技术栈

- **前端**: React 18 + Vite + TypeScript
- **后端**: Express + TypeScript
- **API**: [satisfactory-dedicated-server-api](https://www.npmjs.com/package/satisfactory-dedicated-server-api)

## 快速开始

### 前置要求

- Node.js >= 18
- 已运行的幸福工厂专用服务器

### 安装

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动

```bash
# 终端 1 - 启动后端 (端口 3001)
cd backend
npm run dev

# 终端 2 - 启动前端 (端口 5173)
cd frontend
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd ../backend
npm run build
```

## 连接服务器

1. 点击右上角「连接」按钮
2. 输入服务器地址和端口
3. 如需完整权限，输入用户名和密码
4. 点击连接

**权限说明：**
- 不输入密码：无密码登录（仅可查看仪表盘）
- 输入密码：完整权限（可管理所有功能）

## 项目结构

```
SatisFactory-Server-Web/
├── backend/                 # Express API 服务器
│   ├── src/
│   │   ├── index.ts       # 入口文件
│   │   ├── routes/        # API 路由
│   │   └── services/      # SDK 封装
│   └── package.json
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/        # 页面
│   │   ├── contexts/     # React Context
│   │   └── api/           # API 客户端
│   └── package.json
├── SPEC.md                # 项目规格文档
└── README.md
```

## License

MIT
