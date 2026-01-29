# 路线模板POI选择功能 - 实施方案二实现指南

## ✅ 已实现的接口

### 1. 获取路线模板可用POI列表
**接口路径：** `GET /api/route-directions/templates/:id/available-pois`

**服务层函数：** `getAvailablePOIsForTemplate(id, params)`

**使用示例：**
```typescript
import { getAvailablePOIsForTemplate } from '@/services/route-directions';

// 获取模板ID为37的所有可用POI
const result = await getAvailablePOIsForTemplate(37);

// 带筛选条件
const result = await getAvailablePOIsForTemplate(37, {
  category: 'ATTRACTION',
  search: '教会山',
  page: 1,
  limit: 50
});

if (result) {
  console.log('POI列表:', result.places);
  console.log('总数:', result.total);
  console.log('路线方向:', result.routeDirection);
}
```

**响应数据结构：**
```typescript
{
  places: PlaceListItem[];
  total: number;
  page: number;
  limit: number;
  routeDirection?: {
    id: number;
    countryCode: string;
    nameCN?: string;
    nameEN?: string;
  };
}
```

### 2. 批量获取POI详情
**接口路径：** `POST /api/places/admin/batch`

**服务层函数：** `getPlacesBatch(ids)`

**使用示例：**
```typescript
import { getPlacesBatch } from '@/services/places';

// 批量获取POI详情
const result = await getPlacesBatch([381040, 381086, 381037]);

if (result) {
  console.log('POI详情列表:', result.places);
}
```

**请求体：**
```json
{
  "ids": [381040, 381086, 381037]
}
```

**响应数据结构：**
```typescript
{
  places: Place[];
}
```

## 📁 文件结构

### API路由层
```
src/app/api/
├── route-directions/
│   └── templates/
│       └── [id]/
│           ├── route.ts                    # 原有接口
│           ├── hard/
│           │   └── route.ts              # 物理删除
│           └── available-pois/
│               └── route.ts              # ✨ 新增：获取可用POI
└── places/
    └── admin/
        └── batch/
            └── route.ts                  # ✨ 新增：批量获取POI
```

### 服务层
```
src/services/
├── route-directions.ts                   # ✨ 新增：getAvailablePOIsForTemplate
└── places.ts                             # ✨ 新增：getPlacesBatch
```

## 🔧 前端使用示例

### 在路线模板详情页面中使用

```typescript
import { 
  getAvailablePOIsForTemplate,
  updateRouteTemplate 
} from '@/services/route-directions';
import { getPlacesBatch } from '@/services/places';
import type { PlaceListItem, RouteDayPlan } from '@/types/api';

// 1. 加载可用POI列表
async function loadAvailablePOIs(templateId: number) {
  const result = await getAvailablePOIsForTemplate(templateId, {
    category: 'ATTRACTION',
    limit: 100
  });
  
  if (result) {
    setAvailablePOIs(result.places);
    setRouteDirection(result.routeDirection);
  }
}

// 2. 为日计划添加POI
function handleAddPOIToDayPlan(dayPlanIndex: number, poiId: number) {
  setFormData((prev) => {
    const updatedDayPlans = [...(prev.dayPlans || [])];
    const dayPlan = updatedDayPlans[dayPlanIndex];
    
    updatedDayPlans[dayPlanIndex] = {
      ...dayPlan,
      requiredNodes: [
        ...(dayPlan.requiredNodes || []),
        String(poiId) // POI ID转为字符串
      ]
    };
    
    return {
      ...prev,
      dayPlans: updatedDayPlans
    };
  });
}

// 3. 从日计划移除POI
function handleRemovePOIFromDayPlan(dayPlanIndex: number, poiId: string) {
  setFormData((prev) => {
    const updatedDayPlans = [...(prev.dayPlans || [])];
    const dayPlan = updatedDayPlans[dayPlanIndex];
    
    updatedDayPlans[dayPlanIndex] = {
      ...dayPlan,
      requiredNodes: (dayPlan.requiredNodes || []).filter(id => id !== poiId)
    };
    
    return {
      ...prev,
      dayPlans: updatedDayPlans
    };
  });
}

// 4. 加载已选POI的详细信息（用于显示）
async function loadSelectedPOIDetails(dayPlan: RouteDayPlan) {
  if (!dayPlan.requiredNodes || dayPlan.requiredNodes.length === 0) {
    return [];
  }
  
  const poiIds = dayPlan.requiredNodes.map(id => Number(id));
  const result = await getPlacesBatch(poiIds);
  
  return result?.places || [];
}

// 5. 保存POI选择
async function handleSavePOIs() {
  const result = await updateRouteTemplate(templateId, {
    ...formData,
    dayPlans: formData.dayPlans
  });
  
  if (result) {
    alert('保存成功');
  }
}
```

## 🎨 UI组件建议

### POI选择器组件
```typescript
interface POISelectorProps {
  templateId: number;
  selectedPOIIds: string[];
  onSelect: (poiIds: string[]) => void;
  onClose: () => void;
}

function POISelector({ templateId, selectedPOIIds, onSelect, onClose }: POISelectorProps) {
  const [pois, setPOIs] = useState<PlaceListItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  
  useEffect(() => {
    loadPOIs();
  }, [search, category]);
  
  async function loadPOIs() {
    const result = await getAvailablePOIsForTemplate(templateId, {
      search,
      category: category || undefined,
      limit: 50
    });
    
    if (result) {
      setPOIs(result.places);
    }
  }
  
  // ... UI实现
}
```

### 日计划POI列表组件
```typescript
interface DayPlanPOIListProps {
  dayPlan: RouteDayPlan;
  onRemovePOI: (poiId: string) => void;
  onAddPOI: () => void;
}

function DayPlanPOIList({ dayPlan, onRemovePOI, onAddPOI }: DayPlanPOIListProps) {
  const [poiDetails, setPOIDetails] = useState<Place[]>([]);
  
  useEffect(() => {
    loadPOIDetails();
  }, [dayPlan.requiredNodes]);
  
  async function loadPOIDetails() {
    if (!dayPlan.requiredNodes || dayPlan.requiredNodes.length === 0) {
      setPOIDetails([]);
      return;
    }
    
    const ids = dayPlan.requiredNodes.map(id => Number(id));
    const result = await getPlacesBatch(ids);
    
    if (result) {
      setPOIDetails(result.places);
    }
  }
  
  // ... UI实现
}
```

## 📝 后端接口要求

### 1. GET /route-directions/templates/:id/available-pois
**实现逻辑：**
1. 根据模板ID查询路线模板
2. 获取关联的路线方向ID (`routeDirectionId`)
3. 查询路线方向详情，获取国家代码 (`countryCode`)
4. 使用国家代码查询POI列表：`GET /places/admin?countryCode={countryCode}`
5. 返回POI列表和路线方向信息

**响应格式：**
```json
{
  "success": true,
  "data": {
    "places": [...],
    "total": 150,
    "page": 1,
    "limit": 50,
    "routeDirection": {
      "id": 27,
      "countryCode": "IS",
      "nameCN": "斯奈山半岛环线",
      "nameEN": "Snæfellsnes Peninsula Circuit"
    }
  }
}
```

### 2. POST /places/admin/batch
**实现逻辑：**
1. 接收POI ID数组
2. 批量查询POI详情
3. 返回POI详情列表

**响应格式：**
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
        ...
      }
    ]
  }
}
```

## ✅ 下一步

1. **后端实现**：实现上述两个接口
2. **前端开发**：实现POI选择器组件和日计划POI管理
3. **测试**：测试POI选择、保存、显示功能
4. **优化**：根据用户体验反馈进行优化

## 📚 相关文档

- [产品需求评估](./route-template-day-plan-poi-requirement.md)
- [接口需求文档](./route-template-poi-api-requirements.md)
