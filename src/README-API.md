# TripNara 后台管理系统 API 对接文档

本文档说明如何使用已实现的 API 服务。

## 📁 文件结构

```
src/
├── types/
│   └── api.ts              # API 类型定义
├── lib/
│   └── api-client.ts       # API 客户端基础配置
└── services/
    ├── index.ts            # 统一导出
    ├── users.ts            # 用户管理 API
    ├── contact.ts          # 联系消息管理 API
    ├── readiness.ts        # 准备度Pack管理 API
    └── places.ts           # 地点/POI管理 API
```

## 🚀 快速开始

### 1. 环境配置

创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. 认证Token设置

API 客户端会自动从 `localStorage` 读取 `access_token`。在登录后需要设置：

```typescript
localStorage.setItem('access_token', 'your-jwt-token');
```

### 3. 使用示例

#### 用户管理

```typescript
import { getUsers, getUserById, updateUser } from '@/services/users';

// 获取用户列表
const users = await getUsers({
  page: 1,
  limit: 20,
  search: 'example@email.com',
});

// 获取用户详情
const user = await getUserById('user-id');

// 更新用户信息
const updatedUser = await updateUser('user-id', {
  displayName: '新用户名',
  emailVerified: true,
});
```

#### 联系消息管理

```typescript
import {
  getContactMessages,
  updateMessageStatus,
  replyMessage,
} from '@/services/contact';

// 获取消息列表
const messages = await getContactMessages({
  page: 1,
  status: 'pending',
});

// 更新消息状态
await updateMessageStatus('message-id', {
  status: 'read',
});

// 回复消息
await replyMessage('message-id', {
  reply: '感谢您的反馈',
});
```

#### 准备度Pack管理

```typescript
import {
  getReadinessPacks,
  createReadinessPack,
  updateReadinessPack,
  deleteReadinessPack,
} from '@/services/readiness';

// 获取Pack列表
const packs = await getReadinessPacks({
  page: 1,
  countryCode: 'IS',
});

// 创建Pack
const newPack = await createReadinessPack({
  pack: {
    packId: 'pack.is.iceland',
    destinationId: 'IS-ICELAND',
    displayName: {
      en: 'Iceland Travel Readiness',
      zh: '冰岛旅行准备度',
    },
    // ... 其他字段
  },
});

// 更新Pack
await updateReadinessPack('pack-id', {
  isActive: false,
});

// 删除Pack
await deleteReadinessPack('pack-id');
```

#### 地点管理

```typescript
import { updatePlace, deletePlace } from '@/services/places';

// 更新地点
await updatePlace(123, {
  nameCN: '新中文名称',
  rating: 4.5,
});

// 删除地点
await deletePlace(123);
```

## 📝 API 响应处理

所有 API 函数返回 `null` 表示请求失败，成功时返回数据对象。

### 错误处理示例

```typescript
import { getUsers } from '@/services/users';
import { isErrorResponse } from '@/lib/api-client';

const result = await getUsers();

if (result === null) {
  // 请求失败，错误信息已通过 console.error 输出
  // 可以在这里添加用户提示
  alert('获取用户列表失败，请稍后重试');
} else {
  // 请求成功
  console.log('用户列表:', result.users);
}
```

### 使用原始响应（获取错误详情）

如果需要获取详细的错误信息，可以直接使用 `apiGet`、`apiPost` 等函数：

```typescript
import { apiGet, isErrorResponse } from '@/lib/api-client';
import type { GetUsersResponse, ErrorResponse } from '@/types/api';

const response = await apiGet<GetUsersResponse>('/users/admin', {
  page: 1,
  limit: 20,
});

if (isErrorResponse(response)) {
  // response 是 ErrorResponse 类型
  console.error('错误码:', response.error.code);
  console.error('错误信息:', response.error.message);
} else {
  // response 是 SuccessResponse<GetUsersResponse> 类型
  console.log('数据:', response.data);
}
```

## 🔧 自定义配置

### 修改 API 基础URL

在 `.env` 文件中修改：

```env
VITE_API_BASE_URL=https://api.yourapp.com/api
```

### 自定义请求头

```typescript
import { apiGet } from '@/lib/api-client';

const response = await apiGet('/users/admin', {}, {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### 不需要认证的请求

```typescript
import { apiGet } from '@/lib/api-client';

const response = await apiGet('/public/endpoint', {}, {
  requireAuth: false,
});
```

## 📚 类型定义

所有类型定义都在 `src/types/api.ts` 中，包括：

- `User` - 用户信息
- `ContactMessage` - 联系消息
- `ReadinessPack` - 准备度Pack
- `Place` - 地点信息
- `PaginatedResponse<T>` - 分页响应
- `ApiResponse<T>` - API响应包装

## 🛠️ 开发建议

1. **错误处理**: 建议在组件中使用 try-catch 或错误边界来处理 API 错误
2. **加载状态**: 使用 React Query 或 SWR 来管理 API 请求的加载状态和缓存
3. **类型安全**: 充分利用 TypeScript 类型定义，确保类型安全
4. **环境变量**: 不同环境使用不同的 `.env` 文件（`.env.development`, `.env.production`）

## 📖 更多示例

查看 `src/lib/api-client.example.ts` 获取更多使用示例。
