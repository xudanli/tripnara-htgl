# 环境变量配置指南

## 📋 环境变量说明

### 必需的环境变量

#### `NEXT_PUBLIC_API_BASE_URL`
- **说明**: 前端 API 客户端的基础 URL（用于浏览器端调用）
- **默认值**: `http://localhost:8989/api`（Next.js 开发服务器运行在 8989 端口）
- **示例**:
  - 开发环境: `http://localhost:8989/api`
  - 生产环境: `https://api.yourapp.com/api`

#### `BACKEND_API_BASE_URL` (服务端)
- **说明**: 真实后端服务的基础 URL（用于 Next.js API 路由代理请求）
- **默认值**: `http://localhost:3000/api`
- **注意**: 这是服务端环境变量，不需要 `NEXT_PUBLIC_` 前缀。**需要包含 `/api` 后缀**，因为后端服务的完整地址是 `http://localhost:3000/api`
- **示例**:
  - 开发环境: `http://localhost:3000/api`
  - 生产环境: `https://backend.yourapp.com/api`

## 🚀 快速开始

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 开发环境
# 前端 API 客户端配置（浏览器端使用）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8989/api

# 后端服务配置（服务端使用，Next.js API 路由代理请求）
BACKEND_API_BASE_URL=http://localhost:3000/api
```

### 2. 不同环境的配置

#### 开发环境 (`.env.local`)
```env
# 前端 API 客户端配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:8989/api

# 后端服务配置
BACKEND_API_BASE_URL=http://localhost:3000/api
```

#### 生产环境 (`.env.production`)
```env
# 前端 API 客户端配置
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/api

# 后端服务配置
BACKEND_API_BASE_URL=https://backend.yourapp.com
```

#### 测试环境 (`.env.test`)
```env
# 前端 API 客户端配置
NEXT_PUBLIC_API_BASE_URL=https://api-test.yourapp.com/api

# 后端服务配置
BACKEND_API_BASE_URL=https://backend-test.yourapp.com
```

## 📝 Next.js 环境变量规则

1. **客户端变量**: 必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问
2. **服务端变量**: 不需要 `NEXT_PUBLIC_` 前缀，只在服务端可用（如 `BACKEND_API_BASE_URL`）
3. **优先级**: `.env.local` > `.env.development` / `.env.production` > `.env`

## 🔄 API 路由代理说明

Next.js API 路由（`/api/*`）现在作为代理，将请求转发到真实的后端服务：

- **前端** → Next.js API 路由（`/api/*`）→ **后端服务**（`BACKEND_API_BASE_URL`）
- 这样可以避免 CORS 问题，并统一 API 路径
- 后端服务地址通过 `BACKEND_API_BASE_URL` 环境变量配置

## 🔒 安全注意事项

- ✅ **可以提交**: `.env.example` - 示例文件，不包含敏感信息
- ❌ **不要提交**: `.env.local` - 包含本地配置，已添加到 `.gitignore`
- ❌ **不要提交**: `.env.production` - 包含生产环境配置

## 📁 文件结构

```
project/
├── .env.local          # 本地开发环境（不提交到 Git）
├── .env.example        # 环境变量示例（提交到 Git）
├── .env.development    # 开发环境配置（可选）
├── .env.production     # 生产环境配置（可选）
└── .gitignore         # 已忽略 .env.local
```

## 🔧 使用方式

环境变量会在构建时注入到客户端代码中。在代码中访问：

```typescript
// 在客户端组件中
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// API 客户端会自动读取环境变量
import { apiGet } from '@/lib/api-client';
```

## 🐛 常见问题

### 1. 环境变量不生效
- 确保变量名以 `NEXT_PUBLIC_` 开头
- 重启开发服务器 (`npm run dev`)
- 检查 `.env.local` 文件是否在项目根目录

### 2. 生产环境变量
- 在部署平台（Vercel、Netlify 等）配置环境变量
- 确保变量名以 `NEXT_PUBLIC_` 开头

### 3. 环境变量类型
- Next.js 环境变量都是字符串类型
- 需要数字或布尔值时，需要手动转换

## 📚 相关文档

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [API 使用文档](./src/README-API.md)
