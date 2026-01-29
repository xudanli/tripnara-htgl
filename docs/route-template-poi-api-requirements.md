# 路线模板日计划POI选择 - 接口需求文档

## 📌 需求概述
路线模板的日计划需要支持POI选择功能。前端需要能够：
1. 查询与路线方向相关的POI列表
2. 为每个日计划添加/删除POI
3. 保存POI选择到路线模板

## 🔌 接口需求

### 方案一：使用现有接口（推荐，立即可用）

#### 1. 查询POI列表
**接口：** `GET /api/places/admin` ✅ 已存在

**使用方式：**
```
GET /api/places/admin?countryCode=IS&category=ATTRACTION&search=教会山&page=1&limit=50
```

**说明：**
- 前端从路线模板获取关联的路线方向ID
- 查询路线方向详情获取国家代码（countryCode）
- 使用国家代码查询POI列表

**响应格式：**
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "id": 381040,
        "uuid": "a91f3138-b54a-4dc5-a89d-a7ac72fe3fb0",
        "nameCN": "教会山",
        "nameEN": "Kirkjufell",
        "category": "ATTRACTION",
        "rating": 4.8,
        "location": { "lat": 64.9244, "lng": -23.3122 },
        "city": {
          "id": 1,
          "name": "Grundarfjörður",
          "countryCode": "IS"
        }
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50
  }
}
```

#### 2. 更新路线模板（保存POI选择）
**接口：** `PUT /api/route-directions/templates/:id` ✅ 已存在

**请求体：**
```json
{
  "dayPlans": [
    {
      "day": 1,
      "theme": "雷克雅未克 → 雷克雅未克",
      "requiredNodes": ["381040", "381086"]  // POI ID数组（字符串格式）
    },
    {
      "day": 2,
      "theme": "黄金圈经典环线",
      "requiredNodes": ["381037", "381084"]
    }
  ]
}
```

**说明：**
- `requiredNodes` 字段存储POI ID数组
- POI ID以字符串格式存储（兼容现有数据结构）

---

### 方案二：新增专用接口（可选，优化体验）

#### 1. 按路线模板获取可用POI列表（推荐新增）
**接口：** `GET /api/route-directions/templates/:id/available-pois`

**功能：** 根据路线模板关联的路线方向，自动获取该国家/地区的可用POI列表

**请求参数：**
- `category?: PlaceCategory` - POI类别筛选（可选）
- `search?: string` - 搜索关键词（可选）
- `page?: number` - 页码（默认1）
- `limit?: number` - 每页数量（默认50）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "id": 381040,
        "uuid": "a91f3138-b54a-4dc5-a89d-a7ac72fe3fb0",
        "nameCN": "教会山",
        "nameEN": "Kirkjufell",
        "category": "ATTRACTION",
        "rating": 4.8,
        "location": {
          "lat": 64.9244,
          "lng": -23.3122
        },
        "city": {
          "id": 1,
          "name": "Grundarfjörður",
          "countryCode": "IS"
        }
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50,
    "routeDirection": {
      "id": 27,
      "countryCode": "IS",
      "nameCN": "斯奈山半岛环线"
    }
  }
}
```

**实现逻辑：**
1. 根据模板ID查询路线模板
2. 获取关联的路线方向ID
3. 查询路线方向详情，获取国家代码
4. 使用国家代码查询POI列表
5. 返回POI列表和路线方向信息

**优势：**
- 前端无需额外查询路线方向
- 接口语义更清晰
- 返回数据更完整

#### 2. 批量获取POI详情（可选）
**接口：** `POST /api/places/admin/batch`

**功能：** 根据POI ID数组批量获取POI详情，用于在日计划中显示已选POI的完整信息

**请求体：**
```json
{
  "ids": [381040, 381086, 381037]
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "places": [
      {
        "id": 381040,
        "nameCN": "教会山",
        "nameEN": "Kirkjufell",
        "category": "ATTRACTION",
        "rating": 4.8,
        "location": { "lat": 64.9244, "lng": -23.3122 },
        "address": "Grundarfjörður, Iceland",
        "description": "冰岛最上镜的山..."
      }
    ]
  }
}
```

**使用场景：**
- 在日计划列表中显示已选POI的详细信息
- 避免多次单独查询POI详情

---

## 📊 数据结构

### RouteDayPlan 数据结构（已存在）
```typescript
interface RouteDayPlan {
  day: number;
  theme?: string;
  requiredNodes?: string[];  // POI ID数组（字符串格式）
  [key: string]: unknown;
}
```

### POI数据结构（已存在）
```typescript
interface PlaceListItem {
  id: number;
  uuid: string;
  nameCN: string;
  nameEN?: string;
  category: PlaceCategory;  // 'ATTRACTION' | 'RESTAURANT' | 'SHOPPING' | 'HOTEL' | 'TRANSIT_HUB'
  rating?: number;
  location?: {
    lat: number;
    lng: number;
  };
  city?: {
    id: number;
    name: string;
    countryCode: string;
  };
}
```

---

## ✅ 接口优先级

| 优先级 | 接口 | 状态 | 必需性 |
|--------|------|------|--------|
| **P0** | `GET /api/places/admin` | ✅ 已存在 | **必需** - MVP实现 |
| **P0** | `PUT /api/route-directions/templates/:id` | ✅ 已存在 | **必需** - MVP实现 |
| **P1** | `GET /api/route-directions/templates/:id/available-pois` | ⚠️ 需新增 | **推荐** - 优化体验 |
| **P2** | `POST /api/places/admin/batch` | ⚠️ 需新增 | **可选** - 性能优化 |

---

## 🚀 实施建议

### 阶段一：MVP实现（使用现有接口）
- ✅ 前端使用 `GET /api/places/admin` 查询POI
- ✅ 前端使用 `PUT /api/route-directions/templates/:id` 保存POI选择
- ⏱️ **预计时间：前端2-3天**

### 阶段二：优化（如果后端有时间）
- ⚠️ 后端实现 `GET /api/route-directions/templates/:id/available-pois`
- ⚠️ 前端切换到新接口
- ⏱️ **预计时间：后端1天，前端0.5天**

---

## 📝 总结

### 结论
✅ **现有接口已足够支持MVP实现**，前端可以立即开始开发

### 推荐方案
1. **立即开始**：前端使用现有接口实现基础功能
2. **后续优化**：如果后端有时间，可以新增 `GET /api/route-directions/templates/:id/available-pois` 接口

### 需要后端确认
1. ✅ `requiredNodes` 字段是否支持存储POI ID数组？
2. ✅ POI ID存储格式是字符串还是数字？
3. ⚠️ 是否需要新增 `GET /api/route-directions/templates/:id/available-pois` 接口？
