# 路线模板日计划POI选择功能 - 产品需求评估与接口设计

## 📋 产品需求评估（产品经理）

### 1. 需求背景
当前路线模板的日计划功能仅支持设置天数（day）和主题（theme），缺少POI（Point of Interest，景点）选择功能。为了提升路线模板的实用性和完整性，需要支持为每个日计划添加和选择POI。

### 2. 业务价值
- **提升模板质量**：通过关联具体POI，使路线模板更加具体和可执行
- **改善用户体验**：用户可以直接看到每日的景点安排，无需额外查询
- **支持智能规划**：为后续的行程自动规划功能提供数据基础
- **数据完整性**：完善路线模板的数据结构，支持更复杂的路线规划需求

### 3. 功能需求

#### 3.1 核心功能
1. **POI选择器**
   - 支持按国家代码筛选POI
   - 支持按POI类别筛选（景点、餐厅、购物、酒店、交通枢纽）
   - 支持搜索POI（按名称）
   - 支持多选POI
   - 显示POI基本信息（名称、类别、评分等）

2. **日计划POI管理**
   - 为每个日计划添加/删除POI
   - 显示已选POI列表
   - 支持POI排序（调整顺序）
   - 支持标记必选POI（required）

3. **数据关联**
   - POI与路线方向的国家代码关联
   - 保存POI ID到 `requiredNodes` 字段

#### 3.2 交互设计
- **选择方式**：弹窗选择器或下拉选择
- **展示方式**：在日计划卡片中显示已选POI列表
- **操作方式**：点击"添加POI"按钮打开选择器，选择后添加到当前日计划

#### 3.3 数据约束
- POI必须属于路线方向对应的国家
- 每个日计划可以关联多个POI
- POI可以标记为必选（required）或可选

### 4. 优先级
**高优先级** - 核心功能，直接影响路线模板的实用性

### 5. 技术可行性
- ✅ 已有POI查询接口（`GET /places/admin`）
- ✅ 已有路线方向的国家代码信息
- ✅ 数据结构已支持（`requiredNodes?: string[]`）
- ✅ 前端已有POI选择相关组件参考

---

## 🔌 接口设计（前端工程师）

### 1. 现有接口分析

#### 1.1 POI查询接口（已存在）
```
GET /api/places/admin
查询参数：
- countryCode: string (必需) - 国家代码，用于筛选POI
- category?: PlaceCategory - POI类别筛选
- search?: string - 搜索关键词
- page?: number - 页码
- limit?: number - 每页数量
- orderBy?: 'id' | 'rating' | 'createdAt' | 'updatedAt'
- orderDirection?: 'asc' | 'desc'

响应：
{
  "success": true,
  "data": {
    "places": PlaceListItem[],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

#### 1.2 路线模板更新接口（已存在）
```
PUT /api/route-directions/templates/:id
请求体：
{
  "dayPlans": [
    {
      "day": number,
      "theme": string,
      "requiredNodes": string[]  // POI ID数组
    }
  ]
}
```

### 2. 需要的接口

#### 2.1 按路线方向获取POI列表（推荐新增）
**接口路径：** `GET /api/route-directions/templates/:id/available-pois`

**功能说明：** 根据路线模板关联的路线方向，获取该国家/地区的可用POI列表

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

**优势：**
- 自动关联路线方向的国家代码，无需前端传递
- 返回路线方向信息，便于前端展示
- 统一的数据格式，便于前端处理

#### 2.2 批量获取POI详情（可选，用于优化）
**接口路径：** `POST /api/places/admin/batch`

**功能说明：** 根据POI ID数组批量获取POI详情，用于在日计划中显示已选POI的完整信息

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
        "address": "...",
        "description": "..."
      }
    ]
  }
}
```

### 3. 前端实现方案

#### 3.1 使用现有接口方案（推荐）
**优点：**
- 无需后端开发新接口
- 实现快速，立即可用
- 利用现有 `GET /api/places/admin` 接口

**实现步骤：**
1. 从路线模板获取关联的路线方向ID
2. 查询路线方向详情，获取国家代码（countryCode）
3. 使用国家代码调用 `GET /api/places/admin?countryCode=IS`
4. 在POI选择器中展示结果
5. 用户选择POI后，将POI ID保存到 `dayPlans[].requiredNodes` 数组

**代码示例：**
```typescript
// 1. 获取路线方向的国家代码
const routeDirection = await getRouteDirectionById(template.routeDirectionId);
const countryCode = routeDirection?.countryCode; // 例如: "IS"

// 2. 查询该国家的POI列表
const pois = await getPlaces({
  countryCode: countryCode,
  category: selectedCategory, // 可选
  search: searchKeyword, // 可选
  limit: 50
});

// 3. 用户选择POI后，更新日计划
const updatedDayPlan = {
  ...dayPlan,
  requiredNodes: [...(dayPlan.requiredNodes || []), selectedPoiId]
};
```

#### 3.2 使用新接口方案（如果后端支持）
**优点：**
- 接口更语义化，更易理解
- 自动处理路线方向关联
- 返回数据更完整

**实现步骤：**
1. 调用 `GET /api/route-directions/templates/:id/available-pois`
2. 在POI选择器中展示结果
3. 用户选择POI后，将POI ID保存到 `dayPlans[].requiredNodes` 数组

### 4. 数据结构设计

#### 4.1 前端状态管理
```typescript
interface DayPlanWithPOIs extends RouteDayPlan {
  day: number;
  theme?: string;
  requiredNodes?: string[]; // POI ID数组
  selectedPOIs?: PlaceListItem[]; // 已选POI的完整信息（用于显示）
}
```

#### 4.2 组件设计
```typescript
// POI选择器组件
interface POISelectorProps {
  countryCode: string;
  selectedPOIIds: string[];
  onSelect: (poiIds: string[]) => void;
  onClose: () => void;
}

// 日计划POI列表组件
interface DayPlanPOIListProps {
  dayPlan: DayPlanWithPOIs;
  onRemovePOI: (poiId: string) => void;
  onAddPOI: () => void;
}
```

### 5. 接口优先级

| 优先级 | 接口 | 状态 | 说明 |
|--------|------|------|------|
| P0 | `GET /api/places/admin` | ✅ 已存在 | 必需，用于查询POI列表 |
| P0 | `PUT /api/route-directions/templates/:id` | ✅ 已存在 | 必需，用于保存POI选择 |
| P1 | `GET /api/route-directions/templates/:id/available-pois` | ⚠️ 需新增 | 推荐，简化前端逻辑 |
| P2 | `POST /api/places/admin/batch` | ⚠️ 需新增 | 可选，用于批量获取POI详情 |

### 6. 实现建议

#### 阶段一：MVP实现（使用现有接口）
1. ✅ 使用 `GET /api/places/admin` 查询POI
2. ✅ 使用 `PUT /api/route-directions/templates/:id` 保存POI选择
3. ✅ 前端实现POI选择器组件
4. ✅ 前端实现日计划POI展示

#### 阶段二：优化（如果后端支持新接口）
1. ⚠️ 后端实现 `GET /api/route-directions/templates/:id/available-pois`
2. ⚠️ 前端切换到新接口
3. ⚠️ 优化用户体验

---

## 📝 总结

### 产品评估结论
✅ **需求合理且必要**，建议优先实现

### 接口需求结论
✅ **现有接口已足够支持MVP实现**，无需等待新接口开发

### 推荐方案
1. **立即开始**：使用现有接口实现基础功能
2. **后续优化**：如果后端有时间，可以新增专用接口提升体验

### 下一步行动
1. 前端工程师开始实现POI选择器组件
2. 前端工程师实现日计划POI管理功能
3. （可选）后端工程师评估是否需要新增专用接口
