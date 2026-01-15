# 环境变量配置指南

## 📋 环境变量说明

### 必需的环境变量

#### `NEXT_PUBLIC_API_BASE_URL`
- **说明**: API 服务器的基础 URL
- **默认值**: `http://localhost:3000/api`
- **示例**:
  - 开发环境: `http://localhost:3000/api`
  - 生产环境: `https://api.yourapp.com/api`

## 🚀 快速开始

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 开发环境
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 2. 不同环境的配置

#### 开发环境 (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

#### 生产环境 (`.env.production`)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/api
```

#### 测试环境 (`.env.test`)
```env
NEXT_PUBLIC_API_BASE_URL=https://api-test.yourapp.com/api
```

## 📝 Next.js 环境变量规则

1. **客户端变量**: 必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问
2. **服务端变量**: 不需要 `NEXT_PUBLIC_` 前缀，只在服务端可用
3. **优先级**: `.env.local` > `.env.development` / `.env.production` > `.env`

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
